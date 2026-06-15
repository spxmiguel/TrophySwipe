import type { ProviderAdapter } from '../types/domain'
import { importFromBridge } from './providerBridge'

export const xboxProvider: ProviderAdapter = {
  id: 'xbox',
  displayName: 'Xbox',
  description:
    'Prepara conexão com biblioteca Xbox/Game Pass via bridge autenticado com a conta do usuário.',
  capabilities: ['Biblioteca', 'Game Pass', 'Conquistas', 'Progresso'],
  setupNotes: [
    'Voce pode salvar apenas a gamertag primeiro; isso deixa a conta pronta para sync quando houver OAuth/bridge.',
    'A importacao real exige um bridge/OAuth proprio autorizado pelo usuario.',
    'O app não faz scraping nem armazena senha da conta Xbox.',
  ],
  fields: [
    {
      key: 'accountName',
      label: 'Gamertag',
      type: 'text',
      required: true,
      placeholder: 'Sua gamertag Xbox',
      helpText: 'Salva o identificador da conta sem pedir senha.',
    },
    {
      key: 'bridgeBaseUrl',
      label: 'Bridge/API Xbox',
      type: 'url',
      advanced: true,
      placeholder: 'https://sua-api.example.com/xbox',
      helpText: 'Endpoint autenticado que retorna jogos reais do usuário.',
    },
    {
      key: 'accessToken',
      label: 'Token do bridge',
      type: 'password',
      secret: true,
      advanced: true,
      placeholder: 'Bearer token opcional',
    },
  ],
  importLibrary(values) {
    return importFromBridge('xbox', values)
  },
}
