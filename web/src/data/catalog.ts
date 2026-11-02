// Fictional brands and stores so the demo carries no third party trademarks.

export type Offer = { store: string; price: number }

export type SkinProduct = {
  id: string
  kind: 'serum' | 'cream' | 'gel' | 'drops'
  name: string
  brand: string
  concern: string
  hero: string
  tint: string
  why: string
  offers: Offer[]
  reviews: { tone: 'good' | 'mixed' | 'bad'; text: string }[]
  sources: number
}

export type LipShade = {
  id: string
  name: string
  brand: string
  color: string
  texture: 'matte' | 'gloss' | 'satin' | 'sheer'
  vibe: string
  offers: Offer[]
}

export type Garment = {
  id: string
  name: string
  brand: string
  image: string
  category: 'full_body' | 'upper_body' | 'lower_body' | 'auto'
  offers: Offer[]
}

export const CONCERN_LABEL: Record<string, string> = {
  acne: 'Breakouts',
  redness: 'Redness',
  oiliness: 'Oiliness',
  pore: 'Pores',
  texture: 'Texture',
  wrinkle: 'Fine lines',
  moisture: 'Hydration',
  dark_circle_v2: 'Dark circles',
}

export const SKIN_PRODUCTS: SkinProduct[] = [
  { id: 'bha', kind: 'serum', name: 'Clear Days 2% BHA Serum', brand: 'Dewlab', concern: 'acne', hero: 'Salicylic acid', tint: '#E9F1FF', why: 'unclogs pores without stripping', offers: [{ store: 'Glossery', price: 24 }, { store: 'Beautyhaus', price: 19 }, { store: 'Shelf', price: 22 }], reviews: [{ tone: 'good', text: 'Calms breakouts in 2 weeks' }, { tone: 'mixed', text: 'Tingles at first' }], sources: 6 },
  { id: 'cica', kind: 'gel', name: 'Cica Calm Gel Cream', brand: 'Softform', concern: 'redness', hero: 'Centella + panthenol', tint: '#E8F6EA', why: 'cools visible redness fast', offers: [{ store: 'Glossery', price: 32 }, { store: 'Beautyhaus', price: 34 }, { store: 'Shelf', price: 27 }], reviews: [{ tone: 'good', text: 'Comfortable and soothing' }, { tone: 'good', text: 'Fragrance free' }], sources: 5 },
  { id: 'balance', kind: 'gel', name: 'Oil Balance Water Gel', brand: 'Dewlab', concern: 'oiliness', hero: 'Zinc PCA', tint: '#EAF7F7', why: 'mattifies the T zone all day', offers: [{ store: 'Glossery', price: 21 }, { store: 'Beautyhaus', price: 18 }, { store: 'Shelf', price: 21 }], reviews: [{ tone: 'good', text: 'Lightweight, no shine by noon' }, { tone: 'mixed', text: 'Not enough for dry cheeks' }], sources: 4 },
  { id: 'niacin', kind: 'drops', name: 'Niacinamide 10% Pore Drops', brand: 'Ordinal', concern: 'pore', hero: 'Niacinamide + zinc', tint: '#F4F1EA', why: 'tightens the look of pores', offers: [{ store: 'Glossery', price: 14 }, { store: 'Beautyhaus', price: 12 }, { store: 'Shelf', price: 9 }], reviews: [{ tone: 'good', text: 'Pores visibly smaller' }, { tone: 'bad', text: 'Can pill under SPF' }], sources: 9 },
  { id: 'pha', kind: 'serum', name: 'PHA Gentle Resurfacer', brand: 'Softform', concern: 'texture', hero: 'Gluconolactone', tint: '#FFF1E8', why: 'smooths texture, safe for sensitive skin', offers: [{ store: 'Glossery', price: 29 }, { store: 'Beautyhaus', price: 26 }, { store: 'Shelf', price: 29 }], reviews: [{ tone: 'good', text: 'Glassy skin after a week' }, { tone: 'mixed', text: 'Slow results' }], sources: 5 },
  { id: 'retinal', kind: 'serum', name: 'Retinal 0.1% Night Serum', brand: 'Lumen & Co', concern: 'wrinkle', hero: 'Encapsulated retinal', tint: '#F3EDFF', why: 'softens fine lines overnight', offers: [{ store: 'Glossery', price: 58 }, { store: 'Beautyhaus', price: 52 }, { store: 'Shelf', price: 48 }], reviews: [{ tone: 'good', text: 'Real results in a month' }, { tone: 'mixed', text: 'Start twice a week' }], sources: 7 },
  { id: 'ceramide', kind: 'cream', name: 'Ceramide Barrier Cream', brand: 'Ordinal', concern: 'moisture', hero: 'Ceramides + squalane', tint: '#FFF6E5', why: 'locks in hydration for 72h', offers: [{ store: 'Glossery', price: 19 }, { store: 'Beautyhaus', price: 22 }, { store: 'Shelf', price: 16 }], reviews: [{ tone: 'good', text: 'Rich but not greasy' }, { tone: 'good', text: 'Fixed my flaky patches' }], sources: 8 },
  { id: 'caffeine', kind: 'gel', name: 'Caffeine Wake Up Eye Gel', brand: 'Lumen & Co', concern: 'dark_circle_v2', hero: 'Caffeine 5%', tint: '#EFEAF8', why: 'brightens and depuffs under eyes', offers: [{ store: 'Glossery', price: 26 }, { store: 'Beautyhaus', price: 21 }, { store: 'Shelf', price: 26 }], reviews: [{ tone: 'good', text: 'Cooling, depuffs fast' }, { tone: 'mixed', text: 'Mild on deep circles' }], sources: 4 },
]

export const LIP_SHADES: LipShade[] = [
  { id: 'rosewood', name: 'Rosewood Satin', brand: 'Velvet Theory', color: '#A24A57', texture: 'satin', vibe: 'everyday your lips but better', offers: [{ store: 'Glossery', price: 28 }, { store: 'Beautyhaus', price: 24 }, { store: 'Shelf', price: 26 }] },
  { id: 'cherry', name: 'Cherry Glass Gloss', brand: 'Velvet Theory', color: '#C8183A', texture: 'gloss', vibe: 'date night red', offers: [{ store: 'Glossery', price: 22 }, { store: 'Beautyhaus', price: 22 }, { store: 'Shelf', price: 18 }] },
  { id: 'petal', name: 'Nude Petal Matte', brand: 'Bare Edit', color: '#C0816F', texture: 'matte', vibe: 'soft office nude', offers: [{ store: 'Glossery', price: 19 }, { store: 'Beautyhaus', price: 16 }, { store: 'Shelf', price: 19 }] },
  { id: 'berry', name: 'Berry Velvet', brand: 'Bare Edit', color: '#7A1F3D', texture: 'matte', vibe: 'moody autumn berry', offers: [{ store: 'Glossery', price: 21 }, { store: 'Beautyhaus', price: 21 }, { store: 'Shelf', price: 17 }] },
]

export const GARMENTS: Garment[] = [
  { id: 'furset', name: 'Faux Fur Crop Jacket Look', brand: 'North Row', image: '/samples/garment-full.png', category: 'full_body', offers: [{ store: 'Glossery', price: 129 }, { store: 'Beautyhaus', price: 112 }, { store: 'Shelf', price: 98 }] },
]

export const best = (offers: Offer[]) => offers.reduce((a, b) => (b.price < a.price ? b : a))
export const worst = (offers: Offer[]) => offers.reduce((a, b) => (b.price > a.price ? b : a))
export const saved = (offers: Offer[]) => worst(offers).price - best(offers).price

// Turns a shade into the YouCam makeup-vto lip_color effect.
export function lipEffect(s: LipShade) {
  const palette: Record<string, unknown> = { color: s.color, texture: s.texture, colorIntensity: 70 }
  if (s.texture === 'gloss') Object.assign(palette, { gloss: 70, transparencyIntensity: 30 })
  if (s.texture === 'sheer') Object.assign(palette, { gloss: 40, transparencyIntensity: 50 })
  return { category: 'lip_color', shape: { name: 'original' }, style: { type: 'full' }, palettes: [palette] }
}
