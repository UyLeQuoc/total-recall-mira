// What Mira remembers about you between chats ("learns how you buy"). Lives in localStorage only.

export type Profile = {
  skinType?: string
  focus?: string[]
  skinAge?: number
  lastScore?: number
  lipShade?: string
  avoid?: string[]
  budget?: string
  saved: number
  scans: number
  history: { date: string; score: number }[]
}

const KEY = 'mira.profile.v1'
const EMPTY: Profile = { saved: 0, scans: 0, history: [], avoid: ['fragrance'] }

export function loadProfile(): Profile {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { ...EMPTY }
  }
}

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    // storage blocked (private mode); memory stays in this session only
  }
}

export function resetProfile() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // storage blocked (private mode); memory stays in this session only
  }
}
