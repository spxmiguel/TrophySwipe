import type {
  DiscoveryGame,
  GameStatus,
  PlatformId,
  PlatformOwnership,
  UserGame,
} from '../types/domain'
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
  genres?: string[]
  tags?: string[]
  promotion?: UserGame['promotion']
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
    genres: input.genres,
    tags: input.tags,
    promotion: input.promotion,
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

export function createGameFromDiscovery(game: DiscoveryGame, status: GameStatus): UserGame {
  const timestamp = nowIso()

  return {
    id: game.id,
    title: game.title,
    normalizedTitle: game.normalizedTitle,
    status,
    genres: game.genres,
    tags: game.tags,
    platforms: game.platforms.map((platform) => ({
      platform,
      owned: false,
    })),
    importedFrom: game.platforms[0] ?? 'steam',
    importedAt: timestamp,
    updatedAt: timestamp,
    guide: game.trophyProfile
      ? {
          status: 'requires_configuration',
          difficulty: game.trophyProfile.difficulty,
          estimatedHours: game.trophyProfile.estimatedHours,
          reason:
            'Perfil de platina estimado pelo catalogo real inicial. Configure uma fonte de guias para checklist detalhado.',
        }
      : undefined,
  }
}
