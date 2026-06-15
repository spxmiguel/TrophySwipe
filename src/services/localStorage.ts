import { createDefaultState } from '../data/defaultState'
import type { AppState } from '../types/domain'
import { mergeAppState } from '../utils/mergeState'

const STORAGE_KEY = 'trophyswipe:state:v1'

export function loadLocalState(): AppState {
  const fallback = createDefaultState()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback

    const parsed = JSON.parse(raw) as AppState
    return {
      ...fallback,
      ...parsed,
      profile: { ...fallback.profile, ...parsed.profile },
      settings: { ...fallback.settings, ...parsed.settings },
      connections: { ...fallback.connections, ...parsed.connections },
      games: parsed.games ?? [],
      swipeDecisions: parsed.swipeDecisions ?? [],
    }
  } catch {
    return fallback
  }
}

export function saveLocalState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearLocalState() {
  localStorage.removeItem(STORAGE_KEY)
}

export function exportStateJson(state: AppState) {
  return JSON.stringify(state, null, 2)
}

export function parseImportedState(raw: string): AppState {
  const parsed = JSON.parse(raw) as AppState

  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.games)) {
    throw new Error('Arquivo JSON invalido para o TrophySwipe.')
  }

  const fallback = createDefaultState()

  return mergeAppState(
    {
      ...fallback,
      updatedAt: '1970-01-01T00:00:00.000Z',
      profile: { ...fallback.profile, updatedAt: '1970-01-01T00:00:00.000Z' },
      settings: { ...fallback.settings, updatedAt: '1970-01-01T00:00:00.000Z' },
    },
    parsed,
  )
}
