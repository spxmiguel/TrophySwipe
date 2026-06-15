import { allPlatforms } from '../data/platforms'
import type {
  AppState,
  PlatformId,
  PlatformOwnership,
  ProviderConnection,
  SwipeDecision,
  UserGame,
} from '../types/domain'
import { nowIso } from './date'
import { normalizeTitle } from './normalize'

function newer<T extends { updatedAt?: string }>(a: T, b: T) {
  const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0
  const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0
  return bTime > aTime ? b : a
}

function mergePlatformOwnership(existing: PlatformOwnership[], incoming: PlatformOwnership[]) {
  const merged = new Map<PlatformId, PlatformOwnership>()

  for (const item of [...existing, ...incoming]) {
    const previous = merged.get(item.platform)
    merged.set(item.platform, { ...previous, ...item, owned: previous?.owned || item.owned })
  }

  return Array.from(merged.values())
}

export function mergeGames(existing: UserGame[], incoming: UserGame[]) {
  const merged = new Map<string, UserGame>()

  for (const game of [...existing, ...incoming]) {
    const key = normalizeTitle(game.title)
    const previous = merged.get(key)

    if (!previous) {
      merged.set(key, { ...game, normalizedTitle: key })
      continue
    }

    const mostRecent = newer(previous, game)
    merged.set(key, {
      ...previous,
      ...mostRecent,
      id: previous.id,
      title: previous.title || game.title,
      normalizedTitle: key,
      platforms: mergePlatformOwnership(previous.platforms, game.platforms),
      genres: Array.from(new Set([...(previous.genres ?? []), ...(game.genres ?? [])])),
      tags: Array.from(new Set([...(previous.tags ?? []), ...(game.tags ?? [])])),
      promotion: mostRecent.promotion ?? previous.promotion ?? game.promotion,
      importedAt: previous.importedAt < game.importedAt ? previous.importedAt : game.importedAt,
      updatedAt: mostRecent.updatedAt,
    })
  }

  return Array.from(merged.values()).sort((a, b) => a.title.localeCompare(b.title))
}

function mergeConnections(
  a: AppState['connections'],
  b: AppState['connections'],
): AppState['connections'] {
  return allPlatforms.reduce((acc, platform) => {
    acc[platform] = newer(a[platform], b[platform]) as ProviderConnection
    return acc
  }, {} as AppState['connections'])
}

function mergeSwipeDecisions(a: SwipeDecision[], b: SwipeDecision[]) {
  const merged = new Map<string, SwipeDecision>()
  for (const decision of [...a, ...b]) {
    merged.set(decision.id, decision)
  }
  return Array.from(merged.values()).sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  )
}

export function mergeAppState(local: AppState, remote?: AppState | null): AppState {
  if (!remote) return local

  const profile = newer(local.profile, remote.profile)
  const settings = newer(local.settings, remote.settings)

  return {
    version: Math.max(local.version, remote.version),
    profile,
    settings,
    connections: mergeConnections(local.connections, remote.connections),
    games: mergeGames(local.games, remote.games),
    swipeDecisions: mergeSwipeDecisions(local.swipeDecisions, remote.swipeDecisions),
    updatedAt: nowIso(),
    lastCloudSyncAt: remote.lastCloudSyncAt || local.lastCloudSyncAt,
  }
}
