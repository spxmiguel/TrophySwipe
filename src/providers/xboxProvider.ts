import type { ProviderAdapter } from '../types/domain'
import { importFromBridge } from './providerBridge'

export const xboxProvider: ProviderAdapter = {
  id: 'xbox',
  displayName: 'Xbox',
  description:
    'Prepara conexão com biblioteca Xbox/Game Pass via bridge autenticado com a conta do usuário.',
  capabilities: ['Biblioteca', 'Game Pass', 'Conquistas', 'Progresso'],
  setupNotes: [
    'A importação real exige um bridge/OAuth próprio autorizado pelo usuário.',
    'O app não faz scraping nem armazena senha da conta Xbox.',
  ],
  fields: [
    {
      key: 'bridgeBaseUrl',
      label: 'Bridge/API Xbox',
      type: 'url',
      required: true,
      placeholder: 'https://sua-api.example.com/xbox',
      helpText: 'Endpoint autenticado que retorna jogos reais do usuário.',
    },
    {
      key: 'accessToken',
      label: 'Token do bridge',
      type: 'password',
      secret: true,
      placeholder: 'Bearer token opcional',
    },
  ],
  importLibrary(values) {
    return importFromBridge('xbox', values)
  },
}
