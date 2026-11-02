// Thin client for the YouCam S2S API v2 (https://docs.perfectcorp.com).
// Flow for every feature: register file -> PUT bytes to presigned URL -> create task -> poll.

import { AsyncLocalStorage } from 'node:async_hooks'

const BASE = process.env.YOUCAM_BASE || 'https://yce-api-01.makeupar.com'
const POLL_MS = 2000
const POLL_TIMEOUT_MS = 120_000

// A user may bring their own YouCam key (sent per request, never stored or logged);
// otherwise the server's key is used.
export const requestKey = new AsyncLocalStorage()
// An empty string in the store means demo mode: no key at all, not even the server's.
const currentKey = () => {
  const own = requestKey.getStore()
  return own === undefined ? process.env.YOUCAM_API_KEY : own
}
export const hasKey = () => Boolean(currentKey())

export class YouCamError extends Error {
  constructor(message, code, status) {
    super(message)
    this.code = code
    this.status = status
  }
}

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      Authorization: `Bearer ${currentKey()}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }
  if (!res.ok) {
    const code = json?.error_code || json?.error || json?.data?.error || `http_${res.status}`
    throw new YouCamError(json?.error_message || json?.message || text.slice(0, 200), code, res.status)
  }
  return json
}

// Registers the image with YouCam and uploads the bytes. Returns a file_id.
// Current docs use the generic /file path; older docs use /file/<feature>, so we fall back to it.
export async function uploadImage(buf, contentType, feature) {
  const ext = contentType.includes('png') ? 'png' : 'jpg'
  const body = { files: [{ content_type: contentType, file_name: `mira-${Date.now()}.${ext}`, file_size: buf.length }] }
  let reg
  try {
    reg = await call('POST', '/s2s/v2.0/file', body)
  } catch (err) {
    if (err.status && err.status < 500) reg = await call('POST', `/s2s/v2.0/file/${feature}`, body)
    else throw err
  }
  const file = reg?.data?.files?.[0]
  const put = file?.requests?.[0]
  if (!file?.file_id || !put?.url) throw new YouCamError('Upload registration returned no URL', 'upload_failed')
  const headers = { ...(put.headers || {}) }
  headers['Content-Type'] = headers['Content-Type'] || contentType
  delete headers['Content-Length']
  const up = await fetch(put.url, { method: put.method || 'PUT', headers, body: buf })
  if (!up.ok) throw new YouCamError(`Upload PUT failed with ${up.status}`, 'upload_failed', up.status)
  return file.file_id
}

export async function runTask(feature, body, onStatus) {
  const created = await call('POST', `/s2s/v2.0/task/${feature}`, body)
  const taskId = created?.data?.task_id
  if (!taskId) throw new YouCamError('Task creation returned no task_id', 'task_failed')
  onStatus?.('running')
  const started = Date.now()
  while (Date.now() - started < POLL_TIMEOUT_MS) {
    await new Promise((r) => setTimeout(r, POLL_MS))
    const polled = await call('GET', `/s2s/v2.0/task/${feature}/${encodeURIComponent(taskId)}`)
    const data = polled?.data || {}
    if (data.task_status === 'success') return data
    if (data.task_status === 'error') {
      throw new YouCamError(data.error_message || data.error || 'Task failed', data.error || 'task_error')
    }
  }
  throw new YouCamError('YouCam task timed out', 'timeout')
}

// Pulls a result image URL out of the shapes the docs describe (results.url or results[].download_url).
export function resultUrl(data) {
  const r = data?.results
  if (!r) return null
  if (typeof r === 'string') return r
  if (r.url) return r.url
  if (Array.isArray(r)) return r[0]?.url || r[0]?.download_url || null
  return r.download_url || null
}

export const SKIN_ACTIONS = ['acne', 'redness', 'oiliness', 'pore', 'texture', 'wrinkle', 'moisture', 'dark_circle_v2']

// Normalises skin-analysis json output into { concerns: [{type, score, mask}], skinAge, overall }.
export function parseSkin(data) {
  const output = data?.results?.output || []
  const byType = new Map()
  let skinAge = null
  let overall = null
  for (const item of output) {
    if (item.type === 'skin_age') {
      skinAge = item.score ?? item.ui_score ?? null
      continue
    }
    if (item.type === 'all') {
      overall = item.score ?? item.ui_score ?? null
      continue
    }
    // Only keep scored concerns; the API also returns helper rows such as resize_image.
    if (!SKIN_ACTIONS.includes(item.type) && !item.type?.startsWith('hd_')) continue
    const prev = byType.get(item.type)
    // Region split concerns report several rows; prefer the "whole" region.
    if (!prev || item.region === 'whole') {
      byType.set(item.type, {
        type: item.type,
        score: Math.round(item.ui_score ?? item.score ?? 0),
        mask: item.mask_urls?.[0] || null,
      })
    }
  }
  const concerns = [...byType.values()]
  if (overall == null && concerns.length) {
    overall = Math.round(concerns.reduce((s, c) => s + c.score, 0) / concerns.length)
  }
  return { concerns, skinAge, overall: overall == null ? null : Math.round(overall) }
}
