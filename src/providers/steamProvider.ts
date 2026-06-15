import type { ProviderAdapter } from '../types/domain'
import { createGameFromProvider } from '../utils/normalize'
import { getStringValue } from './providerBridge'
import { ProviderConfigurationError, ProviderRequestError } from './providerErrors'

interface SteamOwnedGame {
  appid: number
  name?: string
  playtime_forever?: number
}

interface SteamOwnedGamesResponse {
  response?: {
    game_count?: number
    games?: SteamOwnedGame[]
  }
}

export const steamProvider: ProviderAdapter = {
  id: 'steam',
  displayName: 'Steam',
  description:
    'Importa biblioteca real da Steam por Steam Web API ou por um bridge próprio para produção.',
  docsUrl: 'https://steamcommunity.com/dev',
  capabilities: ['Biblioteca', 'Tempo jogado', 'IDs reais de apps'],
  setupNotes: [
    'Para GitHub Pages, o modo mais seguro é apontar para um bridge/API próprio que proteja a Steam Web API key.',
    'O modo direto existe para testes pessoais, mas pode falhar por CORS e expõe a chave no navegador.',
  ],
  fields: [
    {
      key: 'steamId',
      label: 'SteamID64',
      type: 'text',
      required: true,
      placeholder: '7656119...',
      helpText: 'Identificador público da conta Steam.',
    },
    {
      key: 'apiKey',
      label: 'Steam Web API key',
      type: 'password',
      secret: true,
      placeholder: 'Chave da Steam Web API',
      helpText: 'Use somente em ambiente pessoal. Em produção, prefira bridgeBaseUrl.',
    },
    {
      key: 'bridgeBaseUrl',
      label: 'Bridge/API opcional',
      type: 'url',
      placeholder: 'https://sua-api.example.com/steam',
      helpText: 'Endpoint que devolve a biblioteca real sem expor segredos no cliente.',
    },
  ],
  async importLibrary(values) {
    const steamId = getStringValue(values, 'steamId')
    const apiKey = getStringValue(values, 'apiKey')
    const bridgeBaseUrl = getStringValue(values, 'bridgeBaseUrl')

    if (!steamId) {
      throw new ProviderConfigurationError('Informe o SteamID64 para buscar a biblioteca real.')
    }

    if (bridgeBaseUrl) {
      const url = new URL('/library', bridgeBaseUrl.endsWith('/') ? bridgeBaseUrl : `${bridgeBaseUrl}/`)
      url.searchParams.set('steamId', steamId)

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new ProviderRequestError(`Bridge Steam retornou ${response.status}.`)
      }

      const payload = (await response.json()) as { games?: SteamOwnedGame[] }
      const games = (payload.games ?? [])
        .map((game) =>
          game.name
            ? createGameFromProvider({
                title: game.name,
                platform: 'steam',
                externalId: String(game.appid),
                playtimeMinutes: game.playtime_forever,
              })
            : null,
        )
        .filter((game): game is NonNullable<typeof game> => Boolean(game))

      return { games, importedCount: games.length }
    }

    if (!apiKey) {
      throw new ProviderConfigurationError(
        'Informe a Steam Web API key ou configure um bridge/API seguro.',
      )
    }

    const url = new URL('https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('steamid', steamId)
    url.searchParams.set('format', 'json')
    url.searchParams.set('include_appinfo', 'true')

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new ProviderRequestError(`Steam Web API retornou ${response.status}.`)
    }

    const payload = (await response.json()) as SteamOwnedGamesResponse
    const games = (payload.response?.games ?? [])
      .map((game) =>
        game.name
          ? createGameFromProvider({
              title: game.name,
              platform: 'steam',
              externalId: String(game.appid),
              playtimeMinutes: game.playtime_forever,
            })
          : null,
      )
      .filter((game): game is NonNullable<typeof game> => Boolean(game))

    return {
      games,
      importedCount: games.length,
      message:
        games.length === 0
          ? 'A Steam respondeu sem jogos para essa conta/permissão.'
          : `${games.length} jogo(s) importado(s) da Steam.`,
    }
  },
}
