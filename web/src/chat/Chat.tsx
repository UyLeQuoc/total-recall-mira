import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { useMira, type Msg, type Step } from './useMira'
import { Blob, ProductArt, Lipstick } from '../ui/Art'
import { CONCERN_LABEL, best, saved } from '../data/catalog'
import type { Profile } from '../lib/memory'
import './chat.css'

export default function Chat() {
  const m = useMira()
  const [draft, setDraft] = useState('')
  const [sheet, setSheet] = useState(false)
  const [viewer, setViewer] = useState<string | null>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const camRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [m.msgs, m.typing, m.chips])

  const onFile = (f?: File | null) => {
    setSheet(false)
    if (!f) return
    const r = new FileReader()
    r.onload = () => m.sendPhoto(String(r.result))
    r.readAsDataURL(f)
  }

  const submit = () => {
    if (!draft.trim()) return
    m.sendText(draft)
    setDraft('')
  }

  const now = new Date()
  const stamp = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  return (
    <div className="chat-stage">
      <a className="chat-back-link" href="#/">← mira.shop</a>
      <div className="phone">
        <div className="phone-island" />
        <div className="screen">
          <div className="statusbar">
            <span>{stamp.replace(/\s?[AP]M/i, '')}</span>
            <span className="sb-icons">
              <svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="6" rx="1" /><rect x="10" y="2.5" width="3" height="8.5" rx="1" /><rect x="15" y="0" width="3" height="11" rx="1" /></svg>
              <svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="16" height="8" rx="2" /><rect x="23" y="4" width="1.5" height="4" rx=".75" opacity=".4" /></svg>
            </span>
          </div>
          <header className="im-header">
            <a href="#/" className="im-back" aria-label="Back">
              <svg width="12" height="20" viewBox="0 0 12 20"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <div className="im-contact">
              <div className="im-avatar"><Blob size={44} mood="happy" color="#F59AC9" /></div>
              <div className="im-name">Mira <span>›</span></div>
            </div>
            {m.live !== null && <span className={`im-mode ${m.live ? 'live' : ''}`}>{m.live ? 'YouCam live' : 'demo mode'}</span>}
          </header>

          <div className="thread" ref={scroller} aria-live="polite">
            <div className="thread-stamp"><b>iMessage</b><br />Today {stamp}</div>
            {m.msgs.map((msg, i) => (
              <Row key={msg.id} msg={msg} last={i === m.msgs.length - 1 || m.msgs[i + 1].from !== msg.from} onShade={m.tryShade} onGarment={m.tryGarment} onView={setViewer} busy={m.busy !== 'idle'} />
            ))}
            {m.typing && (
              <div className="row mira last"><div className="bubble typing"><i /><i /><i /></div></div>
            )}
            {m.busy === 'working' && (
              <div className="row center"><button className="cancel-btn" onClick={m.cancel}>Stop</button></div>
            )}
            {m.chips.length > 0 && (
              <div className="chips">
                {m.chips.map((c) => (
                  <button key={c.label} className="chip" onClick={() => m.act(c.action)} disabled={m.busy !== 'idle'}>{c.label}</button>
                ))}
              </div>
            )}
          </div>

          <div className="composer">
            <button className="plus" onClick={() => setSheet((s) => !s)} aria-label="Add photo" disabled={m.busy !== 'idle'}>
              <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
            </button>
            <form className="field" onSubmit={(e) => { e.preventDefault(); submit() }}>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="iMessage" aria-label="Message Mira" maxLength={400} />
              {draft.trim() ? (
                <button type="submit" className="send" aria-label="Send">
                  <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 12V2M2.5 6.5 7 2l4.5 4.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              ) : (
                <svg className="mic" width="14" height="20" viewBox="0 0 14 20"><rect x="3.5" y="1" width="7" height="12" rx="3.5" fill="currentColor" /><path d="M1 9.5a6 6 0 0 0 12 0M7 15.5V19" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
              )}
            </form>
          </div>

          {sheet && (
            <div className="sheet" role="dialog" aria-label="Add a photo">
              <button onClick={() => camRef.current?.click()}><span>📷</span>Camera</button>
              <button onClick={() => fileRef.current?.click()}><span>🖼️</span>Photos</button>
              <button onClick={() => { setSheet(false); m.act({ type: 'demoSelfie' }) }}><span>🙂</span>Demo selfie</button>
              <button onClick={() => { setSheet(false); m.act({ type: 'demoBody' }) }}><span>🧍</span>Demo full body</button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
          <input ref={camRef} type="file" accept="image/*" capture="user" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
          <div className="home-indicator" />

          {viewer && (
            <div className="viewer" onClick={() => setViewer(null)} role="dialog" aria-label="Photo">
              <img src={viewer} alt="" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type RowProps = {
  msg: Msg
  last: boolean
  busy: boolean
  onShade: ReturnType<typeof useMira>['tryShade']
  onGarment: ReturnType<typeof useMira>['tryGarment']
  onView: (src: string) => void
}

function Row({ msg, last, busy, onShade, onGarment, onView }: RowProps) {
  const cls = `row ${msg.from} ${last ? 'last' : ''}`
  switch (msg.kind) {
    case 'text':
      return <div className={cls}><div className="bubble">{msg.text}</div></div>
    case 'image':
      return <div className={cls}><img className="photo" src={msg.src} alt="Sent photo" onClick={() => onView(msg.src)} /></div>
    case 'trace':
      return <div className={cls}><TraceCard title={msg.title} steps={msg.steps} /></div>
    case 'skin':
      return <div className={cls}><SkinCard msg={msg} onView={onView} /></div>
    case 'picks':
      return (
        <div className={`${cls} wide`}>
          <div className="carousel">
            {msg.items.map((p) => {
              const b = best(p.offers)
              return (
                <article className="card product" key={p.id}>
                  <div className="card-head">
                    <div className="card-title">{p.name}</div>
                    <div className="card-sub">◎ Overview <span className="chev">›</span></div>
                  </div>
                  <div className="pills">
                    {p.reviews.map((r) => <span key={r.text} className={`pill ${r.tone}`}><i />{r.text}</span>)}
                  </div>
                  <div className="sources"><span className="src-dots"><b /><b /><b /></span>{p.sources} sources</div>
                  <div className="card-art" style={{ background: p.tint }}><ProductArt kind={p.kind} tint="#fff" label={p.brand} className="art" /></div>
                  <div className="price-row">
                    <span className="tag">💸 better price found</span>
                    <span><b>${b.price}</b> at {b.store}</span>
                  </div>
                  <div className="why">For {CONCERN_LABEL[p.concern]?.toLowerCase()}: {p.why} · {p.hero}. Saves ${saved(p.offers)}</div>
                </article>
              )
            })}
          </div>
        </div>
      )
    case 'shades':
      return (
        <div className={`${cls} wide`}>
          <div className="carousel">
            {msg.items.map((s) => (
              <button className="card shade" key={s.id} onClick={() => onShade(s)} disabled={busy}>
                <Lipstick color={s.color} className="shade-art" />
                <div className="card-title">{s.name}</div>
                <div className="card-sub">{s.brand} · {s.texture}</div>
                <div className="price-row"><span><b>${best(s.offers).price}</b> at {best(s.offers).store}</span></div>
                <span className="try">Try it on me</span>
              </button>
            ))}
          </div>
        </div>
      )
    case 'garments':
      return (
        <div className={`${cls} wide`}>
          <div className="carousel">
            {msg.items.map((g) => (
              <button className="card garment" key={g.id} onClick={() => onGarment(g)} disabled={busy}>
                <img src={g.image} alt="" />
                <div className="card-title">{g.name}</div>
                <div className="card-sub">{g.brand} · was ${Math.max(...g.offers.map((o) => o.price))}</div>
                <div className="price-row"><span className="tag">💸 ${saved(g.offers)} cheaper</span><span><b>${best(g.offers).price}</b> at {best(g.offers).store}</span></div>
                <span className="try">See it on me</span>
              </button>
            ))}
          </div>
        </div>
      )
    case 'tryon':
      return <div className={cls}><TryOn msg={msg} /></div>
    case 'memory':
      return <div className={cls}><MemoryCard p={msg.profile} /></div>
  }
}

function TraceCard({ title, steps }: { title: string; steps: Step[] }) {
  const done = steps.every((s) => s.state === 'done')
  return (
    <div className={`trace ${done ? 'done' : ''}`}>
      <div className="trace-title">{done ? '✓ ' : ''}{title}</div>
      <ol>
        {steps.map((s) => (
          <li key={s.label} className={s.state}>
            <span className="dot" />
            <span className="lbl">{s.label}</span>
            {s.detail && <span className="det">{s.detail}</span>}
          </li>
        ))}
      </ol>
    </div>
  )
}

function SkinCard({ msg, onView }: { msg: Extract<Msg, { kind: 'skin' }>; onView: (s: string) => void }) {
  const { report } = msg
  const score = report.overall ?? 0
  const sorted = [...report.concerns].sort((a, b) => a.score - b.score)
  const masks = sorted.filter((c) => c.mask).slice(0, 3)
  const C = 2 * Math.PI * 34
  return (
    <div className="card skin">
      <div className="skin-top">
        <img src={msg.photo} alt="Your selfie" onClick={() => onView(msg.photo)} />
        <svg className="ring" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" stroke="#eee" strokeWidth="8" fill="none" />
          <circle cx="40" cy="40" r="34" stroke={score >= 78 ? '#34C759' : score >= 65 ? '#FF9F0A' : '#FF453A'} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${(C * score) / 100} ${C}`} transform="rotate(-90 40 40)" />
          <text x="40" y="44" textAnchor="middle" fontSize="20" fontWeight="700">{score}</text>
          <text x="40" y="57" textAnchor="middle" fontSize="7.5" fill="#888">SKIN SCORE</text>
        </svg>
        {report.skinAge != null && <div className="age"><b>{report.skinAge}</b><span>skin age</span></div>}
      </div>
      <div className="card-title">Your skin report</div>
      <div className="card-sub">YouCam Skin AI · {report.concerns.length} concerns{report.mock ? ' · demo data' : ''}</div>
      <ul className="bars">
        {sorted.map((c) => (
          <li key={c.type}>
            <span className="name">{CONCERN_LABEL[c.type] || c.type}</span>
            <span className="bar"><i style={{ width: `${c.score}%`, background: c.score >= 78 ? '#34C759' : c.score >= 65 ? '#FF9F0A' : '#FF453A' }} /></span>
            <span className="val">{c.score}</span>
          </li>
        ))}
      </ul>
      {masks.length > 0 && (
        <div className="masks">
          {masks.map((c) => (
            <button key={c.type} onClick={() => onView(c.mask!)}><img src={c.mask!} alt={`${c.type} map`} /><span>{CONCERN_LABEL[c.type]}</span></button>
          ))}
        </div>
      )}
    </div>
  )
}

function TryOn({ msg }: { msg: Extract<Msg, { kind: 'tryon' }> }) {
  const [pos, setPos] = useState(50)
  const [loaded, setLoaded] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const drag = (e: RPointerEvent) => {
    const r = box.current!.getBoundingClientRect()
    setPos(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)))
  }
  return (
    <div className="card tryon">
      <div
        className="compare"
        ref={box}
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); drag(e) }}
        onPointerMove={(e) => e.buttons && drag(e)}
        role="slider"
        aria-label="Before and after"
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5)); if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5)) }}
      >
        <img src={msg.after} alt="After try on" onLoad={() => setLoaded(true)} draggable={false} />
        <div className="before" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}><img src={msg.before} alt="Before" draggable={false} /></div>
        <div className="handle" style={{ left: `${pos}%` }}><span>‹ ›</span></div>
        <span className="lbl l">before</span>
        <span className="lbl r">after</span>
        {!loaded && <div className="shimmer" />}
        {msg.mock && <span className="demo-badge">demo preview</span>}
      </div>
      <div className="card-title">{msg.title}</div>
      <div className="card-sub">{msg.sub}</div>
    </div>
  )
}

function MemoryCard({ p }: { p: Profile }) {
  const items: [string, string][] = [
    ['Skin type', p.skinType || 'unknown'],
    ['Focus on', (p.focus || []).map((f) => CONCERN_LABEL[f]?.toLowerCase() || f).join(', ') || 'unknown'],
    ['Skin age', p.skinAge ? String(p.skinAge) : 'unknown'],
    ['Your shade', p.lipShade || 'not picked yet'],
    ['Avoid', (p.avoid || []).join(', ')],
    ['Saved so far', `$${p.saved}`],
  ]
  return (
    <div className="card memory">
      <div className="card-title">Mira remembers</div>
      <div className="card-sub">{p.scans} scan{p.scans === 1 ? '' : 's'} · stored only on this phone</div>
      <dl>{items.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      {p.history.length > 1 && (
        <div className="spark">
          {p.history.map((h, i) => <i key={i} style={{ height: `${h.score}%` }} title={`${h.date}: ${h.score}`} />)}
        </div>
      )}
    </div>
  )
}
