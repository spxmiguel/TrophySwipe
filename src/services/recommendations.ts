import type { Recommendation, SwipeDecision, UserGame } from '../types/domain'

function alreadyDecided(gameId: string, decisions: SwipeDecision[]) {
  return decisions.some((decision) => decision.gameId === gameId && decision.choice !== 'maybe')
}

export function buildRecommendations(games: UserGame[], decisions: SwipeDecision[]): Recommendation[] {
  const playedSignals = new Set(
    games
      .filter((game) => game.status === 'played' || game.status === 'finished' || game.status === 'platinum')
      .flatMap((game) => [...(game.genres ?? []), ...(game.tags ?? [])].map((value) => value.toLowerCase())),
  )

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

      const sharedSignals = [...(game.genres ?? []), ...(game.tags ?? [])].filter((value) =>
        playedSignals.has(value.toLowerCase()),
      )

      if (sharedSignals.length > 0) {
        score += 14
        reasons.push(`Parecido com jogos do seu historico: ${sharedSignals.slice(0, 3).join(', ')}`)
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

      return { game, score, reasons }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.game.title.localeCompare(b.game.title))
}
