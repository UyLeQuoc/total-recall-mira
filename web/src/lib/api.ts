export type SkinReport = {
  mock: boolean
  concerns: { type: string; score: number; mask: string | null }[]
  skinAge: number | null
  overall: number | null
}

export class ApiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

async function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new ApiError('offline', "I can't reach the server right now. Check your connection and try again.")
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(json.error || 'failed', friendly(json.error, json.message))
  return json as T
}

function friendly(code?: string, message?: string) {
  const c = (code || '').toLowerCase()
  if (c.includes('face') && c.includes('small')) return 'Your face looks a bit far away. Try a closer selfie, face filling most of the frame.'
  if (c.includes('face')) return "I couldn't find a clear, front facing face. Try again looking straight at the camera."
  if (c.includes('lighting')) return 'It is a little dark. Try again near a window.'
  if (c.includes('size')) return 'That photo is too small. Send one at least 600px wide.'
  if (c.includes('pose')) return 'For outfits I need a full body photo, standing, arms relaxed.'
  if (c.includes('credit') || c.includes('unit')) return 'My YouCam units ran out for today.'
  if (c === 'timeout') return 'YouCam is taking longer than usual. Try once more?'
  return message || 'Something went wrong on my side. Try again?'
}

export const api = {
  health: () => fetch('/api/health').then((r) => r.json() as Promise<{ ok: boolean; live: boolean }>),
  skin: (image: string, signal?: AbortSignal) => post<SkinReport>('/api/skin', { image }, signal),
  makeup: (image: string, effect: unknown, signal?: AbortSignal) => post<{ mock: boolean; url: string }>('/api/makeup', { image, effect }, signal),
  cloth: (image: string, garment: string, category: string, signal?: AbortSignal) =>
    post<{ mock: boolean; url: string }>('/api/cloth', { image, garment, category }, signal),
}

// Loads any image source and re-encodes it as JPEG within YouCam's size window.
export async function prepareImage(src: string | Blob, opts: { minShort?: number; maxLong?: number } = {}) {
  const { minShort = 600, maxLong = 1800 } = opts
  const url = typeof src === 'string' ? src : URL.createObjectURL(src)
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.crossOrigin = 'anonymous'
    i.onload = () => resolve(i)
    i.onerror = () => reject(new ApiError('bad_image', "I couldn't open that image. Try a JPG or PNG."))
    i.src = url
  })
  const w = img.naturalWidth
  const h = img.naturalHeight
  let scale = Math.min(1, maxLong / Math.max(w, h))
  if (Math.min(w, h) * scale < minShort) scale = Math.min(minShort / Math.min(w, h), maxLong / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  if (typeof src !== 'string') URL.revokeObjectURL(url)
  return canvas.toDataURL('image/jpeg', 0.9)
}

// Crops toward the face (center, upper part) so it fills more of the frame; YouCam Skin AI
// needs the face to cover over 60% of the image width.
export async function zoomToFace(src: string) {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = src
  })
  const w = img.naturalWidth * 0.5
  const h = Math.min(img.naturalHeight, w * 1.2)
  const x = (img.naturalWidth - w) / 2
  const y = Math.max(0, img.naturalHeight * 0.38 - h / 2)
  const canvas = document.createElement('canvas')
  const scale = Math.max(1, 640 / w)
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  canvas.getContext('2d')!.drawImage(img, x, y, w, h, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.92)
}
