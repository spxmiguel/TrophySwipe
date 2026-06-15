import type { TrophyGuide, UserGame } from '../types/domain'
import { nowIso } from '../utils/date'

interface GuideApiResponse {
  difficulty?: string
  estimatedHours?: string
  missableTrophies?: string[]
  onlineTrophies?: string[]
  multipleRuns?: boolean
  roadmap?: string[]
  tips?: string[]
  checklist?: Array<{
    id?: string
    title: string
    description?: string
    missable?: boolean
    online?: boolean
    completed?: boolean
  }>
  links?: Array<{ label: string; url: string }>
}

export async function getTrophyGuide(game: UserGame, guideApiBaseUrl?: string): Promise<TrophyGuide> {
  if (!guideApiBaseUrl) {
    return {
      gameId: game.id,
      status: 'unavailable',
      links: [],
      reason:
        'Guia indisponível: nenhuma fonte/API de guias foi configurada. O app não faz scraping de PSNProfiles, PowerPyx, TrueAchievements, Steam Guides ou HowLongToBeat.',
      updatedAt: nowIso(),
    }
  }

  try {
    const url = new URL('/guide', guideApiBaseUrl.endsWith('/') ? guideApiBaseUrl : `${guideApiBaseUrl}/`)
    url.searchParams.set('title', game.title)
    url.searchParams.set('platforms', game.platforms.map((item) => item.platform).join(','))

    const response = await fetch(url.toString())
    if (!response.ok) {
      return {
        gameId: game.id,
        status: 'error',
        links: [],
        reason: `A fonte de guias retornou ${response.status}.`,
        updatedAt: nowIso(),
      }
    }

    const payload = (await response.json()) as GuideApiResponse

    return {
      gameId: game.id,
      status: 'available',
      difficulty: payload.difficulty,
      estimatedHours: payload.estimatedHours,
      missableTrophies: payload.missableTrophies ?? [],
      onlineTrophies: payload.onlineTrophies ?? [],
      multipleRuns: payload.multipleRuns,
      roadmap: payload.roadmap ?? [],
      tips: payload.tips ?? [],
      checklist: (payload.checklist ?? []).map((item, index) => ({
        id: item.id ?? `${game.id}-guide-${index}`,
        title: item.title,
        description: item.description,
        missable: item.missable,
        online: item.online,
        completed: item.completed,
      })),
      links: payload.links ?? [],
      updatedAt: nowIso(),
    }
  } catch (error) {
    return {
      gameId: game.id,
      status: 'error',
      links: [],
      reason: error instanceof Error ? error.message : 'Falha desconhecida ao consultar guia.',
      updatedAt: nowIso(),
    }
  }
}
