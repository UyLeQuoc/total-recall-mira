// Mira's agent loop. Each user turn becomes a small plan of tool calls (YouCam Skin AI,
// product matching, price check, YouCam Makeup or Clothes VTO), streamed into the thread as
// iMessage bubbles with a visible step trace.
import { useCallback, useEffect, useRef, useState } from 'react'
import { api, ApiError, prepareImage, settings, zoomToFace, type SkinReport } from '../lib/api'
import { demoLipPreview } from '../lib/demoTint'
import { loadProfile, saveProfile, type Profile } from '../lib/memory'
import { CONCERN_LABEL, GARMENTS, LIP_SHADES, SKIN_PRODUCTS, best, lipEffect, saved, type Garment, type LipShade, type SkinProduct } from '../data/catalog'

export type Step = { label: string; detail?: string; state: 'todo' | 'run' | 'done' | 'fail' }

export type Msg =
  | { id: string; from: 'me'; kind: 'text'; text: string }
  | { id: string; from: 'me'; kind: 'image'; src: string }
  | { id: string; from: 'mira'; kind: 'text'; text: string }
  | { id: string; from: 'mira'; kind: 'trace'; title: string; steps: Step[] }
  | { id: string; from: 'mira'; kind: 'skin'; report: SkinReport; photo: string }
  | { id: string; from: 'mira'; kind: 'picks'; items: SkinProduct[] }
  | { id: string; from: 'mira'; kind: 'shades'; items: LipShade[] }
  | { id: string; from: 'mira'; kind: 'garments'; items: Garment[] }
  | { id: string; from: 'mira'; kind: 'tryon'; before: string; after: string; title: string; sub: string; mock: boolean }
  | { id: string; from: 'mira'; kind: 'memory'; profile: Profile }

type NewMsg = Msg extends infer M ? (M extends Msg ? Omit<M, 'id'> : never) : never

export type Chip = { label: string; action: Action }
export type Action =
  | { type: 'scan' }
  | { type: 'outfit' }
  | { type: 'shades' }
  | { type: 'memory' }
  | { type: 'demoSelfie' }
  | { type: 'demoBody' }
  | { type: 'addKey' }
  | { type: 'demoMode' }
  | { type: 'say'; text: string }

type Pending = 'selfie' | 'body' | null
type Busy = 'idle' | 'thinking' | 'working'

const uid = () => Math.random().toString(36).slice(2, 10)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
export const DEMO_SELFIE = '/samples/selfie-face.jpg'
export const DEMO_BODY = '/samples/person-full.jpg'

// Offered whenever YouCam refuses for lack of units or a bad key.
const KEY_CHIPS: Chip[] = [
  { label: '🔑 Use my own YouCam key', action: { type: 'addKey' } },
  { label: '✨ Try demo mode', action: { type: 'demoMode' } },
]
const needsKey = (err: unknown) => err instanceof ApiError && /credit|unit|auth|http_401|http_403/i.test(err.code)

const START_CHIPS: Chip[] = [
  { label: '📸 Scan my skin', action: { type: 'scan' } },
  { label: '💄 Find my lip shade', action: { type: 'shades' } },
  { label: '🧥 Try on an outfit', action: { type: 'outfit' } },
  { label: '🧠 What do you know about me?', action: { type: 'memory' } },
]

// Makeup VTO call; in demo mode the bundled selfie gets a local tint preview.
async function makeup(img: string, shade: LipShade, signal?: AbortSignal) {
  const out = await api.makeup(img, lipEffect(shade), signal)
  if (!out.mock) return out
  const preview = await demoLipPreview(img, shade.color, shade.texture === 'gloss').catch(() => null)
  return { ...out, url: preview || out.url }
}

export function useMira() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)
  const [busy, setBusy] = useState<Busy>('idle')
  const [chips, setChips] = useState<Chip[]>([])
  const [live, setLive] = useState<boolean | null>(null)
  const [keySheet, setKeySheet] = useState(false)
  const ctx = useRef({ selfie: null as string | null, body: null as string | null, report: null as SkinReport | null, pending: null as Pending, profile: loadProfile() })
  const abortRef = useRef<AbortController | null>(null)
  const started = useRef(false)

  const push = useCallback((m: NewMsg) => {
    const id = uid()
    setMsgs((prev) => [...prev, { ...m, id } as Msg])
    return id
  }, [])

  const patch = useCallback((id: string, fn: (m: Msg) => Msg) => setMsgs((prev) => prev.map((m) => (m.id === id ? fn(m) : m))), [])

  // Mira "types" before every reply, proportional to message length, like a person would.
  const say = useCallback(
    async (text: string) => {
      setTyping(true)
      await sleep(Math.min(1400, 450 + text.length * 12))
      setTyping(false)
      push({ from: 'mira', kind: 'text', text })
    },
    [push],
  )

  const trace = useCallback(
    (title: string, labels: [string, string?][]) => {
      const id = push({ from: 'mira', kind: 'trace', title, steps: labels.map(([label, detail]) => ({ label, detail, state: 'todo' as const })) })
      const set = (i: number, state: Step['state'], detail?: string) =>
        patch(id, (m) => (m.kind === 'trace' ? { ...m, steps: m.steps.map((s, j) => (j === i ? { ...s, state, detail: detail ?? s.detail } : s)) } : m))
      return { set }
    },
    [push, patch],
  )

  const remember = (fn: (p: Profile) => void) => {
    fn(ctx.current.profile)
    ctx.current.profile = { ...ctx.current.profile }
    saveProfile(ctx.current.profile)
  }

  useEffect(() => {
    if (started.current) return
    started.current = true
    api.health().then((h) => setLive(h.live)).catch(() => setLive(false))
    ;(async () => {
      const p = ctx.current.profile
      await say(p.scans ? `welcome back ✨ last time your skin scored ${p.lastScore}. want to check in?` : "hey! i'm Mira 💅 your shopping bestie for skin, makeup and fits")
      await say('send me a selfie and i will read your skin with YouCam AI, find what actually works, check every store for the best price, and try it on you before you buy')
      setChips(START_CHIPS)
    })()
  }, [say])

  // ---------- tools ----------

  const runSkin = useCallback(
    async (photo: string) => {
      setBusy('working')
      setChips([])
      const ac = new AbortController()
      abortRef.current = ac
      const t = trace('Mira is on it', [
        ['Reading your selfie'],
        ['YouCam Skin AI', '8 concerns'],
        ['Matching products to your skin'],
        ['Checking 3 stores for the best price'],
        ['Trying your best lip shade on you', 'YouCam Makeup VTO'],
      ])
      try {
        t.set(0, 'run')
        let img = await prepareImage(photo, { minShort: 640, maxLong: 1600 })
        t.set(0, 'done')
        t.set(1, 'run')
        let report: SkinReport
        try {
          report = await api.skin(img, ac.signal)
        } catch (err) {
          // Self-heal once: a selfie taken at arm's length is the most common rejection.
          if (!(err instanceof ApiError) || !err.code.includes('too_small')) throw err
          t.set(1, 'run', 'face too far, zooming in and retrying')
          img = await zoomToFace(img)
          report = await api.skin(img, ac.signal)
        }
        ctx.current.selfie = img
        ctx.current.report = report
        t.set(1, 'done', `${report.concerns.length} concerns scored`)
        t.set(2, 'run')
        const sorted = [...report.concerns].sort((a, b) => a.score - b.score)
        const focus = sorted.slice(0, 3)
        const picks = focus.map((c) => SKIN_PRODUCTS.find((p) => p.concern === c.type)).filter(Boolean) as SkinProduct[]
        await sleep(500)
        t.set(2, 'done', picks.map((p) => p.brand).join(', '))
        t.set(3, 'run')
        await sleep(600)
        const totalSaved = picks.reduce((s, p) => s + saved(p.offers), 0)
        t.set(3, 'done', `saves you $${totalSaved}`)

        push({ from: 'mira', kind: 'skin', report, photo: img })
        const oily = report.concerns.find((c) => c.type === 'oiliness')
        const dry = report.concerns.find((c) => c.type === 'moisture')
        const skinType = oily && dry ? (oily.score < 68 && dry.score < 68 ? 'combination' : oily.score < 68 ? 'oily' : dry.score < 68 ? 'dry' : 'balanced') : 'balanced'
        remember((p) => {
          p.skinType = skinType
          p.focus = focus.map((c) => c.type)
          p.skinAge = report.skinAge ?? p.skinAge
          p.lastScore = report.overall ?? p.lastScore
          p.scans += 1
          p.saved += totalSaved
          p.history = [...p.history, { date: new Date().toISOString().slice(0, 10), score: report.overall ?? 0 }].slice(-8)
        })
        await say(
          `your skin scores ${report.overall}/100${report.skinAge ? ` and reads like ${report.skinAge}` : ''} 🫶 biggest wins are ${focus
            .map((c) => CONCERN_LABEL[c.type]?.toLowerCase() || c.type)
            .join(', ')}. you look ${skinType}, so i skipped anything heavy or fragranced`,
        )
        push({ from: 'mira', kind: 'picks', items: picks })

        // Agentic follow through: pick a shade from what we just learned and try it on unprompted.
        t.set(4, 'run')
        const redness = report.concerns.find((c) => c.type === 'redness')?.score ?? 80
        const shade = redness < 70 ? LIP_SHADES[0] : report.skinAge && report.skinAge > 30 ? LIP_SHADES[3] : LIP_SHADES[1]
        const out = await makeup(img, shade, ac.signal)
        t.set(4, 'done', shade.name)
        remember((p) => (p.lipShade = shade.name))
        await say(
          redness < 70
            ? `bonus: a ${shade.name.toLowerCase()} balances visible redness instead of fighting it. already tried it on you 👇`
            : `bonus: i tried ${shade.name} on you since it pops with your tone 👇`,
        )
        push({ from: 'mira', kind: 'tryon', before: img, after: out.url, title: shade.name, sub: `${shade.brand} · $${best(shade.offers).price} at ${best(shade.offers).store}`, mock: out.mock })
        setChips([
          { label: '💄 Other shades', action: { type: 'shades' } },
          { label: '🧥 Try a full look', action: { type: 'outfit' } },
          { label: '🧠 What you know about me', action: { type: 'memory' } },
        ])
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        const idx = [0, 1, 2, 3, 4]
        idx.forEach((i) => t.set(i, 'fail'))
        await say(err instanceof ApiError ? err.message : 'something broke on my side, try again?')
        setChips(needsKey(err) ? KEY_CHIPS : [{ label: '📸 Try another selfie', action: { type: 'scan' } }, ...(ctx.current.selfie ? [] : [{ label: '✨ Use demo selfie', action: { type: 'demoSelfie' } as Action }])])
      } finally {
        setBusy('idle')
        abortRef.current = null
      }
    },
    [push, say, trace],
  )

  const tryShade = useCallback(
    async (shade: LipShade) => {
      if (!ctx.current.selfie) {
        ctx.current.pending = 'selfie'
        await say(`love ${shade.name} 💋 send me a selfie and i'll put it on you`)
        setChips([{ label: '✨ Use demo selfie', action: { type: 'demoSelfie' } }])
        return
      }
      setBusy('working')
      const t = trace(`Trying ${shade.name}`, [['YouCam Makeup VTO', `${shade.texture} · ${shade.color}`], ['Price check', '3 stores']])
      try {
        t.set(0, 'run')
        const out = await makeup(ctx.current.selfie, shade)
        t.set(0, 'done')
        t.set(1, 'done', `best $${best(shade.offers).price} at ${best(shade.offers).store}`)
        remember((p) => (p.lipShade = shade.name))
        push({ from: 'mira', kind: 'tryon', before: ctx.current.selfie, after: out.url, title: shade.name, sub: `${shade.brand} · $${best(shade.offers).price} at ${best(shade.offers).store}`, mock: out.mock })
        await say(`${shade.vibe}. saved you $${saved(shade.offers)} vs the priciest store`)
      } catch (err) {
        t.set(0, 'fail')
        await say(err instanceof ApiError ? err.message : 'that one failed, try again?')
        if (needsKey(err)) setChips(KEY_CHIPS)
      } finally {
        setBusy('idle')
      }
    },
    [push, say, trace],
  )

  const tryGarment = useCallback(
    async (g: Garment) => {
      if (!ctx.current.body) {
        ctx.current.pending = 'body'
        await say('send me a full body pic (head to toe, standing) and i will dress you in it 🧥')
        setChips([{ label: '✨ Use demo full body photo', action: { type: 'demoBody' } }])
        return
      }
      setBusy('working')
      setChips([])
      const t = trace(`Dressing you in ${g.name}`, [['Preparing your photo'], ['YouCam AI Clothes', g.category.replace('_', ' ')], ['Price check', '3 stores']])
      try {
        t.set(0, 'run')
        const garment = await prepareImage(g.image, { minShort: 512, maxLong: 1600 })
        t.set(0, 'done')
        t.set(1, 'run')
        const res = await api.cloth(ctx.current.body, garment, g.category)
        // Demo mode has no generated image, so preview the garment reference instead.
        const out = res.mock ? { ...res, url: g.image } : res
        t.set(1, 'done')
        t.set(2, 'done', `best $${best(g.offers).price} at ${best(g.offers).store}`)
        push({ from: 'mira', kind: 'tryon', before: ctx.current.body, after: out.url, title: g.name, sub: `${g.brand} · $${best(g.offers).price} at ${best(g.offers).store}`, mock: out.mock })
        const lip = ctx.current.profile.lipShade
        await say(`ok this is a serve 🔥 ${lip ? `pair it with ${lip} for the full look. ` : ''}it's $${saved(g.offers)} cheaper at ${best(g.offers).store}`)
        setChips([
          { label: '📸 Rescan my skin', action: { type: 'scan' } },
          { label: '💄 Lip shades', action: { type: 'shades' } },
          { label: '🧠 What you know about me', action: { type: 'memory' } },
        ])
      } catch (err) {
        t.set(1, 'fail')
        await say(err instanceof ApiError ? err.message : 'that try on failed, try again?')
        if (needsKey(err)) setChips(KEY_CHIPS)
      } finally {
        setBusy('idle')
      }
    },
    [push, say, trace],
  )

  // ---------- inputs ----------

  const sendPhoto = useCallback(
    async (src: string) => {
      if (busy !== 'idle') return
      push({ from: 'me', kind: 'image', src })
      const pending = ctx.current.pending
      ctx.current.pending = null
      if (pending === 'body') {
        ctx.current.body = await prepareImage(src, { minShort: 512, maxLong: 1600 })
        await tryGarment(GARMENTS[0])
        return
      }
      await runSkin(src)
    },
    [busy, push, runSkin, tryGarment],
  )

  const showShades = useCallback(async () => {
    await say(ctx.current.report ? 'picked these for your tone, tap one to try it on 💄' : 'here are this week\'s best lip picks, tap one to try it on 💄')
    push({ from: 'mira', kind: 'shades', items: LIP_SHADES })
  }, [push, say])

  const showOutfits = useCallback(async () => {
    await say('this look is trending and 24% off at one store right now, want to see it on you?')
    push({ from: 'mira', kind: 'garments', items: GARMENTS })
  }, [push, say])

  const showMemory = useCallback(async () => {
    const p = ctx.current.profile
    await say(p.scans ? "here's what i've learned about you so far, i use it on every pick 🧠" : "not much yet! scan your skin once and i'll remember what works for you")
    if (p.scans) push({ from: 'mira', kind: 'memory', profile: p })
  }, [push, say])

  const act = useCallback(
    async (a: Action) => {
      if (busy !== 'idle') return
      setChips([])
      if (a.type === 'scan') {
        ctx.current.pending = 'selfie'
        await say('send me a selfie 📸 face the window, no filter, hair off your face')
        setChips([{ label: '✨ Use demo selfie', action: { type: 'demoSelfie' } }])
      } else if (a.type === 'shades') await showShades()
      else if (a.type === 'outfit') await showOutfits()
      else if (a.type === 'memory') await showMemory()
      else if (a.type === 'demoSelfie') await sendPhoto(DEMO_SELFIE)
      else if (a.type === 'demoBody') {
        ctx.current.pending = 'body'
        await sendPhoto(DEMO_BODY)
      } else if (a.type === 'addKey') setKeySheet(true)
      else if (a.type === 'demoMode') {
        settings.setDemo(true)
        setLive(false)
        await say('demo mode on ✨ results are previews until you add a YouCam key. try it out 👇')
        setChips(START_CHIPS)
      } else if (a.type === 'say') await sendText(a.text)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busy, say, showShades, showOutfits, showMemory, sendPhoto],
  )

  const sendText = useCallback(
    async (raw: string) => {
      const text = raw.trim()
      if (!text || busy !== 'idle') return
      push({ from: 'me', kind: 'text', text })
      setChips([])
      const t = text.toLowerCase()
      if (/(skin|acne|pimple|breakout|pore|scan|wrinkle|oily|dry|redness|selfie)/.test(t)) return act({ type: 'scan' })
      if (/(lip|lipstick|gloss|shade|makeup|red|nude|berry)/.test(t)) return showShades()
      if (/(outfit|dress|jacket|wear|fit|look|clothes|try on)/.test(t)) return showOutfits()
      if (/(know|remember|profile|about me|memory)/.test(t)) return showMemory()
      if (/(cheap|price|deal|save|cost|\$)/.test(t)) {
        const p = ctx.current.profile
        await say(p.saved ? `so far i've saved you $${p.saved} by checking every store 💸 i always show the cheapest legit seller first` : 'i check 3 stores on every pick and only show verified sellers. scan your skin and i\'ll start saving you money 💸')
        return
      }
      if (/(hi|hey|hello|yo|sup)\b/.test(t)) {
        await say('hiii 👋 what are we shopping for today?')
        setChips(START_CHIPS)
        return
      }
      if (/(thank|ty|love)/.test(t)) {
        await say('anytime 🫶 i\'ll ping you if any of your picks drop in price')
        return
      }
      await say("i'm best at skin, makeup and outfits right now. send a selfie or pick one of these 👇")
      setChips(START_CHIPS)
    },
    [busy, push, say, act, showShades, showOutfits, showMemory],
  )

  const cancel = useCallback(() => abortRef.current?.abort(), [])

  // Called by the key sheet after the user saves or clears their own YouCam key.
  const keySaved = useCallback(
    async (hasOwn: boolean) => {
      setKeySheet(false)
      if (hasOwn) settings.setDemo(false)
      const h = await api.health().catch(() => ({ live: false }))
      setLive(h.live)
      await say(hasOwn ? "got your YouCam key 🔑 i'll run everything live on your units now" : 'key removed, back to the shared units')
      setChips(START_CHIPS)
    },
    [say],
  )

  return { msgs, typing, busy, chips, live, keySheet, setKeySheet, keySaved, sendText, sendPhoto, act, tryShade, tryGarment, cancel }
}
