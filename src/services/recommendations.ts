import { discoveryCatalog } from '../data/discoveryCatalog'
import type {
  DiscoveryGame,
  GameStatus,
  PlatformId,
  Recommendation,
  SwipeChoice,
  SwipeDecision,
  UserGame,
} from '../types/domain'

const positiveStatusWeights: Partial<Record<GameStatus, number>> = {
  platinum: 8,
  finished: 7,
  played: 4,
  want_to_platinum: 4,
  want_to_play: 3,
  owned: 1,
}

const negativeStatusWeights: Partial<Record<GameStatus, number>> = {
  abandoned: -5,
}

const decisionWeights: Record<SwipeChoice, number> = {
  want_to_platinum: 5,
  want_to_play: 4,
  maybe: 1,
  ignore: -6,
}

function alreadyDecided(recommendationId: string, decisions: SwipeDecision[]) {
  return decisions.some((decision) => decision.gameId === recommendationId)
}

function catalogByTitle(catalog: DiscoveryGame[]) {
  return new Map(catalog.map((game) => [game.normalizedTitle, game]))
}

function signalsForGame(game: UserGame, catalogMap: Map<string, DiscoveryGame>) {
  const catalogMatch = catalogMap.get(game.normalizedTitle)
  return {
    genres: [...new Set([...(game.genres ?? []), ...(catalogMatch?.genres ?? [])])],
    tags: [...new Set([...(game.tags ?? []), ...(catalogMatch?.tags ?? [])])],
  }
}

function addSignalWeight(weights: Map<string, number>, signal: string, amount: number) {
  const normalized = signal.toLowerCase()
  weights.set(normalized, (weights.get(normalized) ?? 0) + amount)
}

function buildTasteProfile(
  games: UserGame[],
  decisions: SwipeDecision[],
  catalog: DiscoveryGame[],
) {
  const catalogMap = catalogByTitle(catalog)
  const gameById = new Map(games.map((game) => [game.id, game]))
  const discoveryById = new Map(catalog.map((game) => [game.id, game]))
  const weights = new Map<string, number>()
  const preferredPlatforms = new Map<PlatformId, number>()
  let positiveTasteCount = 0
  let platinumIntent = 0

  for (const game of games) {
    const statusWeight = positiveStatusWeights[game.status] ?? negativeStatusWeights[game.status] ?? 0
    if (statusWeight === 0) continue

    const { genres, tags } = signalsForGame(game, catalogMap)
    const allSignals = [...genres, ...tags]

    if (statusWeight > 1 && allSignals.length > 0) positiveTasteCount += 1
    if (game.status === 'platinum' || game.status === 'want_to_platinum') platinumIntent += 1

    for (const signal of allSignals) addSignalWeight(weights, signal, statusWeight)
    for (const platform of game.platforms) {
      preferredPlatforms.set(
        platform.platform,
        (preferredPlatforms.get(platform.platform) ?? 0) + Math.max(statusWeight, 0),
      )
    }
  }

  for (const decision of decisions) {
    const decisionWeight = decisionWeights[decision.choice]
    const libraryGame = gameById.get(decision.gameId)
    const discoveryGame = discoveryById.get(decision.gameId)
    const signals = libraryGame
      ? signalsForGame(libraryGame, catalogMap)
      : discoveryGame
        ? { genres: discoveryGame.genres, tags: discoveryGame.tags }
        : null

    if (!signals) continue
    if (decisionWeight > 1) positiveTasteCount += 1
    if (decision.choice === 'want_to_platinum') platinumIntent += 1

    for (const signal of [...signals.genres, ...signals.tags]) {
      addSignalWeight(weights, signal, decisionWeight)
    }
  }

  return { weights, preferredPlatforms, positiveTasteCount, platinumIntent, catalogMap }
}

function matchingSignals(
  genres: string[],
  tags: string[],
  weights: Map<string, number>,
) {
  return [...genres, ...tags]
    .map((signal) => ({
      label: signal,
      weight: weights.get(signal.toLowerCase()) ?? 0,
    }))
    .filter((signal) => signal.weight > 0)
    .sort((a, b) => b.weight - a.weight)
}

function buildLibraryRecommendations(
  games: UserGame[],
  decisions: SwipeDecision[],
  profile: ReturnType<typeof buildTasteProfile>,
): Recommendation[] {
  return games
    .filter((game) => !alreadyDecided(game.id, decisions))
    .map((game) => {
      const reasons: string[] = []
      let score = 0

      if (game.platforms.some((platform) => platform.owned)) {
        score += 50
        reasons.push('Voce ja possui este jogo')
      }

      if (game.platforms.some((platform) => platform.subscriptionSource === 'ps_plus')) {
        score += 18
        reasons.push('Disponivel no PS Plus')
      }

      if (game.platforms.some((platform) => platform.subscriptionSource === 'game_pass')) {
        score += 18
        reasons.push('Disponivel no Game Pass')
      }

      const enrichedSignals = signalsForGame(game, profile.catalogMap)
      const sharedSignals = matchingSignals(enrichedSignals.genres, enrichedSignals.tags, profile.weights)

      if (sharedSignals.length > 0) {
        score += Math.min(
          30,
          sharedSignals.reduce((total, signal) => total + signal.weight, 0),
        )
        reasons.push(
          `Bate com seu gosto: ${sharedSignals
            .slice(0, 3)
            .map((signal) => signal.label)
            .join(', ')}`,
        )
      }

      if (game.guide?.difficulty?.toLowerCase().includes('facil')) {
        score += 12
        reasons.push('Platina marcada como facil pela fonte configurada')
      }

      if (game.guide?.estimatedHours && /\b([1-9]|1[0-9]|20)\b/.test(game.guide.estimatedHours)) {
        score += 10
        reasons.push('Platina rapida pela fonte configurada')
      }

      if (game.promotion) {
        score += 8
        reasons.push(game.promotion.label || 'Promocao detectada por fonte configurada')
      }

      const playedMinutes = game.platforms.reduce(
        (total, platform) => total + (platform.playtimeMinutes ?? 0),
        0,
      )

      if (playedMinutes > 0) {
        score += 10
        reasons.push('Historico de jogo detectado')
      }

      return {
        id: game.id,
        title: game.title,
        normalizedTitle: game.normalizedTitle,
        platforms: game.platforms.map((platform) => platform.platform),
        source: 'library' as const,
        game,
        score,
        reasons,
      }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
}

function buildDiscoveryRecommendations(
  games: UserGame[],
  decisions: SwipeDecision[],
  profile: ReturnType<typeof buildTasteProfile>,
  catalog: DiscoveryGame[],
): Recommendation[] {
  if (profile.positiveTasteCount === 0 || profile.weights.size === 0) return []

  const ownedTitles = new Set(games.map((game) => game.normalizedTitle))

  return catalog
    .filter((game) => !ownedTitles.has(game.normalizedTitle))
    .filter((game) => !alreadyDecided(game.id, decisions))
    .map((game) => {
      const reasons: string[] = []
      let score = 0
      const matches = matchingSignals(game.genres, game.tags, profile.weights)

      if (matches.length === 0) {
        return {
          id: game.id,
          title: game.title,
          normalizedTitle: game.normalizedTitle,
          platforms: game.platforms,
          source: 'discovery' as const,
          discoveryGame: game,
          score: 0,
          reasons: [],
        }
      }

      const tasteScore = matches.reduce((total, signal) => total + signal.weight, 0)
      score += Math.min(70, tasteScore)
      reasons.push(
        `Jogo novo alinhado com: ${matches
          .slice(0, 3)
          .map((signal) => signal.label)
          .join(', ')}`,
      )

      const preferredPlatformMatches = game.platforms.filter((platform) =>
        profile.preferredPlatforms.has(platform),
      )
      if (preferredPlatformMatches.length > 0) {
        score += Math.min(
          18,
          preferredPlatformMatches.reduce(
            (total, platform) => total + (profile.preferredPlatforms.get(platform) ?? 0),
            0,
          ),
        )
        reasons.push(`Sai nas plataformas do seu perfil: ${preferredPlatformMatches.join(', ')}`)
      }

      if (profile.platinumIntent > 0 && game.trophyProfile?.difficulty) {
        score += game.trophyProfile.difficulty.includes('facil') ? 14 : 6
        reasons.push(
          `Perfil de platina: ${game.trophyProfile.difficulty}${
            game.trophyProfile.estimatedHours ? `, ${game.trophyProfile.estimatedHours}` : ''
          }`,
        )
      }

      if (game.notes?.length) {
        reasons.push(...game.notes.slice(0, 1))
      }

      return {
        id: game.id,
        title: game.title,
        normalizedTitle: game.normalizedTitle,
        platforms: game.platforms,
        source: 'discovery' as const,
        discoveryGame: game,
        score,
        reasons,
      }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
}

export function buildRecommendations(
  games: UserGame[],
  decisions: SwipeDecision[],
  catalog: DiscoveryGame[] = discoveryCatalog,
): Recommendation[] {
  const profile = buildTasteProfile(games, decisions, catalog)
  const libraryRecommendations = buildLibraryRecommendations(games, decisions, profile)

  if (libraryRecommendations.length > 0) {
    return libraryRecommendations
  }

  return buildDiscoveryRecommendations(games, decisions, profile, catalog)
}
