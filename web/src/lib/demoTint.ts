// Demo mode only: a local lip tint preview for the bundled demo selfie, so the UI can be
// explored without a YouCam key. Real photos and live mode always use YouCam Makeup VTO.

const DEMO_SIZE = { w: 720, h: 849 }
const LIPS = { cx: 365, cy: 317, rx: 34, ry: 15 }

export async function demoLipPreview(src: string, color: string, gloss: boolean): Promise<string | null> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = src
  })
  if (img.naturalWidth !== DEMO_SIZE.w || img.naturalHeight !== DEMO_SIZE.h) return null

  const mask = document.createElement('canvas')
  mask.width = img.naturalWidth
  mask.height = img.naturalHeight
  const m = mask.getContext('2d')!
  m.filter = 'blur(3px)'
  m.fillStyle = color
  m.beginPath()
  m.ellipse(LIPS.cx, LIPS.cy, LIPS.rx, LIPS.ry, 0, 0, Math.PI * 2)
  m.fill()

  const out = document.createElement('canvas')
  out.width = img.naturalWidth
  out.height = img.naturalHeight
  const o = out.getContext('2d')!
  o.drawImage(img, 0, 0)
  o.globalCompositeOperation = 'multiply'
  o.globalAlpha = 0.75
  o.drawImage(mask, 0, 0)
  o.globalCompositeOperation = 'soft-light'
  o.globalAlpha = 0.6
  o.drawImage(mask, 0, 0)
  if (gloss) {
    o.globalCompositeOperation = 'screen'
    o.globalAlpha = 0.35
    o.filter = 'blur(2px)'
    o.fillStyle = '#fff'
    o.beginPath()
    o.ellipse(LIPS.cx + 4, LIPS.cy + 7, 12, 3, 0, 0, Math.PI * 2)
    o.fill()
  }
  return out.toDataURL('image/jpeg', 0.92)
}
