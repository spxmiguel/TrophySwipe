import { allPlatforms } from './platforms'
import type { AppState, PlatformId, ProviderConnection } from '../types/domain'
import { nowIso } from '../utils/date'

function emptyConnection(providerId: PlatformId, timestamp: string): ProviderConnection {
  return {
    providerId,
    status: 'not_configured',
    values: {},
    updatedAt: timestamp,
  }
}

export function createDefaultState(): AppState {
  const timestamp = nowIso()

  return {
    version: 1,
    profile: {
      mode: 'guest',
      updatedAt: timestamp,
    },
    connections: allPlatforms.reduce((acc, providerId) => {
      acc[providerId] = emptyConnection(providerId, timestamp)
      return acc
    }, {} as AppState['connections']),
    games: [],
    swipeDecisions: [],
    settings: {
      theme: 'dark',
      trophyGuideApiBaseUrl: '',
      discoveryApiBaseUrl: '',
      updatedAt: timestamp,
    },
    updatedAt: timestamp,
  }
}
