// Mira API server: keeps the YouCam key server side, proxies the three skills the agent uses,
// and serves the built web app. Runs in demo mode (deterministic mock results) when no key is set.
import http from 'node:http'
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { hasKey, requestKey, uploadImage, runTask, resultUrl, parseSkin, SKIN_ACTIONS, YouCamError } from './youcam.mjs'

const root = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(root, '..', 'web', 'dist')
const PORT = Number(process.env.PORT || 8787)
const MAX_BODY = 14 * 1024 * 1024
const CACHE = path.join(root, '..', '.cache')

try {
  const env = await readFile(path.join(root, '..', '.env'), 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {}

// YOUCAM_DEMO=1 forces demo mode even when .env holds a key (used for offline recordings).
if (process.env.YOUCAM_DEMO === '1') delete process.env.YOUCAM_API_KEY

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.webp': 'image/webp', '.json': 'application/json', '.webmanifest': 'application/manifest+json' }

function send(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(obj))
}

async function readJson(req) {
  let size = 0
  const chunks = []
  for await (const c of req) {
    size += c.length
    if (size > MAX_BODY) throw new YouCamError('Image is larger than 10 MB', 'too_large', 413)
    chunks.push(c)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

function decodeImage(dataUrl) {
  const m = /^data:(image\/(?:jpeg|jpg|png));base64,(.+)$/.exec(dataUrl || '')
  if (!m) throw new YouCamError('Send a JPG or PNG photo', 'bad_image', 400)
  return { buf: Buffer.from(m[2], 'base64'), type: m[1] === 'image/jpg' ? 'image/jpeg' : m[1] }
}

// Deterministic per photo so the demo feels consistent across reloads.
function seeded(buf) {
  const h = createHash('sha256').update(buf).digest()
  let i = 0
  return (lo, hi) => lo + (h[i++ % h.length] % (hi - lo + 1))
}

// Identical requests (same photo, same effect) reuse the stored YouCam result instead of
// spending units again. Result images are downloaded because YouCam URLs expire after 2 hours.
async function cached(name, body, run) {
  const key = createHash('sha256').update(name + JSON.stringify(body)).digest('hex').slice(0, 24)
  const file = path.join(CACHE, `${key}.json`)
  try {
    return { ...JSON.parse(await readFile(file, 'utf8')), cached: true }
  } catch {
    // not cached yet
  }
  const out = await run()
  if (out.mock) return out
  await mkdir(path.join(CACHE, 'files'), { recursive: true })
  const keep = async (url, suffix) => {
    if (!url?.startsWith('http')) return url
    try {
      const res = await fetch(url)
      if (!res.ok) return url
      const name = `${key}-${suffix}.jpg`
      await writeFile(path.join(CACHE, 'files', name), Buffer.from(await res.arrayBuffer()))
      return `/cache/${name}`
    } catch {
      return url
    }
  }
  if (out.url) out.url = await keep(out.url, 'result')
  if (out.concerns) for (const c of out.concerns) c.mask = await keep(c.mask, c.type)
  await writeFile(file, JSON.stringify(out))
  return out
}

const handlers = {
  async skin({ image }) {
    const { buf, type } = decodeImage(image)
    if (!hasKey()) {
      const r = seeded(buf)
      const concerns = SKIN_ACTIONS.map((t) => ({ type: t, score: r(52, 93), mask: null }))
      const overall = Math.round(concerns.reduce((s, c) => s + c.score, 0) / concerns.length)
      return { mock: true, concerns, skinAge: r(22, 34), overall }
    }
    const fileId = await uploadImage(buf, type, 'skin-analysis')
    const data = await runTask('skin-analysis', {
      src_file_id: fileId,
      dst_actions: SKIN_ACTIONS,
      miniserver_args: { enable_mask_overlay: true },
      format: 'json',
    })
    return { mock: false, ...parseSkin(data) }
  },

  async makeup({ image, effect }) {
    const { buf, type } = decodeImage(image)
    if (!effect?.category) throw new YouCamError('Missing makeup effect', 'bad_request', 400)
    if (!hasKey()) return { mock: true, url: image }
    const fileId = await uploadImage(buf, type, 'makeup-vto')
    const data = await runTask('makeup-vto', { src_file_id: fileId, version: '1.0', effects: [effect] })
    return { mock: false, url: resultUrl(data) }
  },

  async cloth({ image, garment, category }) {
    const person = decodeImage(image)
    const ref = decodeImage(garment)
    if (!hasKey()) return { mock: true, url: image }
    const [srcId, refId] = await Promise.all([
      uploadImage(person.buf, person.type, 'cloth'),
      uploadImage(ref.buf, ref.type, 'cloth'),
    ])
    const body = { src_file_id: srcId, ref_file_id: refId, garment_category: category || 'auto' }
    let data
    try {
      data = await runTask('cloth-v4', body)
    } catch (err) {
      // Fall back to the v2 endpoint if v4 is not enabled for this account.
      if (err.status === 404 || err.code === 'http_404') data = await runTask('cloth', body)
      else throw err
    }
    return { mock: false, url: resultUrl(data) }
  },
}

async function serveStatic(req, res) {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (p.endsWith('/')) p += 'index.html'
  let file = path.join(DIST, path.normalize(p).replace(/^(\.\.[/\\])+/, ''))
  try {
    if (!(await stat(file)).isFile()) throw 0
  } catch {
    file = path.join(DIST, 'index.html')
  }
  try {
    const buf = await readFile(file)
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' })
    res.end(buf)
  } catch {
    res.writeHead(404).end('Run `npm run build` first')
  }
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x')
    if (url.pathname.startsWith('/cache/')) {
      const name = path.basename(url.pathname)
      try {
        const buf = await readFile(path.join(CACHE, 'files', name))
        res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' })
        return res.end(buf)
      } catch {
        return send(res, 404, { error: 'not_found' })
      }
    }
    if (url.pathname === '/api/health') return send(res, 200, { ok: true, live: hasKey() })
    const name = url.pathname.match(/^\/api\/(skin|makeup|cloth)$/)?.[1]
    if (!name) return serveStatic(req, res)
    if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' })
    const t0 = Date.now()
    try {
      const body = await readJson(req)
      // X-Mira-Demo forces demo mode; X-YouCam-Key runs this request on the user's own key.
      const userKey = String(req.headers['x-youcam-key'] || '').trim().slice(0, 200)
      const demo = req.headers['x-mira-demo'] === '1'
      const run = () => cached(name, body, () => handlers[name](body))
      const out = await requestKey.run(demo ? '' : userKey || undefined, run)
      console.log(`[api] ${name} ok ${Date.now() - t0}ms${out.mock ? ' (demo)' : ''}${out.cached ? ' (cached)' : ''}`)
      send(res, 200, out)
    } catch (err) {
      console.error(`[api] ${name} failed`, err.code, err.message)
      send(res, err.status && err.status < 500 ? err.status : 502, { error: err.code || 'failed', message: err.message })
    }
  })
  .listen(PORT, () => console.log(`Mira server on http://localhost:${PORT} (${hasKey() ? 'live YouCam' : 'demo mode'})`))
