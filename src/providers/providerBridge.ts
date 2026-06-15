import type { PlatformId, ProviderImportResult } from '../types/domain'
import { createGameFromProvider } from '../utils/normalize'
import { ProviderConfigurationError, ProviderRequestError } from './providerErrors'

interface BridgeGame {
  id?: string | number
  title?: string
  name?: string
  playtimeMinutes?: number
  achievementsEarned?: number
  achievementsTotal?: number
  completionPercent?: number
  subscriptionSource?: 'ps_plus' | 'game_pass' | 'nintendo_switch_online' | 'epic_free' | 'other'
  lastPlayedAt?: string
  genres?: string[]
  tags?: string[]
  promotion?: {
    source: string
    label?: string
    currentPrice?: string
    originalPrice?: string
    discountPercent?: number
    url?: string
    checkedAt?: string
  }
}

interface BridgeResponse {
  games?: BridgeGame[]
  library?: BridgeGame[]
  items?: BridgeGame[]
}

function stringValue(values: Record<string, string | boolean>, key: string) {
  const value = values[key]
  return typeof value === 'string' ? value.trim() : ''
}

export function getStringValue(values: Record<string, string | boolean>, key: string) {
  return stringValue(values, key)
}

export async function importFromBridge(
  platform: PlatformId,
  values: Record<string, string | boolean>,
): Promise<ProviderImportResult> {
  const bridgeBaseUrl = stringValue(values, 'bridgeBaseUrl')
  const accessToken = stringValue(values, 'accessToken')
  const accountName = stringValue(values, 'accountName')

  if (!bridgeBaseUrl) {
    throw new ProviderConfigurationError(
      'Configure a URL do bridge/API para importar dados reais desta plataforma.',
    )
  }

  const url = new URL('/library', bridgeBaseUrl.endsWith('/') ? bridgeBaseUrl : `${bridgeBaseUrl}/`)
  url.searchParams.set('platform', platform)
  if (accountName) url.searchParams.set('accountName', accountName)

  const response = await fetch(url.toString(), {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  })

  if (!response.ok) {
    throw new ProviderRequestError(
      `A API retornou ${response.status}. Verifique credenciais e permissões.`,
    )
  }

  const payload = (await response.json()) as BridgeResponse | BridgeGame[]
  const items = Array.isArray(payload)
    ? payload
    : (payload.games ?? payload.library ?? payload.items ?? [])

  const games = items
    .map((item) => {
      const title = (item.title ?? item.name ?? '').trim()
      if (!title) return null

      return createGameFromProvider({
        title,
        platform,
        externalId: item.id ? String(item.id) : undefined,
        playtimeMinutes: item.playtimeMinutes,
        achievementsEarned: item.achievementsEarned,
        achievementsTotal: item.achievementsTotal,
        completionPercent: item.completionPercent,
        subscriptionSource: item.subscriptionSource,
        lastPlayedAt: item.lastPlayedAt,
        genres: item.genres,
        tags: item.tags,
        promotion: item.promotion
          ? {
              ...item.promotion,
              checkedAt: item.promotion.checkedAt ?? new Date().toISOString(),
            }
          : undefined,
      })
    })
    .filter((game): game is NonNullable<typeof game> => Boolean(game))

  return {
    games,
    importedCount: games.length,
    message:
      games.length === 0
        ? 'A API respondeu sem jogos. Nenhum item foi salvo.'
        : `${games.length} jogo(s) importado(s) da plataforma.`,
  }
}
