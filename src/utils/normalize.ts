import type { PlatformId, PlatformOwnership, UserGame } from '../types/domain'
import { nowIso } from './date'

export function normalizeTitle(title: string) {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function createGameId(title: string) {
  return normalizeTitle(title).replace(/\s+/g, '-')
}

export function createGameFromProvider(input: {
  title: string
  platform: PlatformId
  externalId?: string
  playtimeMinutes?: number
  achievementsEarned?: number
  achievementsTotal?: number
  completionPercent?: number
  subscriptionSource?: PlatformOwnership['subscriptionSource']
  lastPlayedAt?: string
}): UserGame {
  const timestamp = nowIso()
  const normalizedTitle = normalizeTitle(input.title)
  const completionPercent =
    input.completionPercent ??
    (typeof input.achievementsEarned === 'number' &&
    typeof input.achievementsTotal === 'number' &&
    input.achievementsTotal > 0
      ? Math.round((input.achievementsEarned / input.achievementsTotal) * 100)
      : undefined)

  return {
    id: createGameId(input.title),
    title: input.title.trim(),
    normalizedTitle,
    status: 'owned',
    platforms: [
      {
        platform: input.platform,
        owned: true,
        externalId: input.externalId,
        playtimeMinutes: input.playtimeMinutes,
        achievementsEarned: input.achievementsEarned,
        achievementsTotal: input.achievementsTotal,
        completionPercent,
        subscriptionSource: input.subscriptionSource,
        lastPlayedAt: input.lastPlayedAt,
      },
    ],
    importedFrom: input.platform,
    importedAt: timestamp,
    updatedAt: timestamp,
  }
}
