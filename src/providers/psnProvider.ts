import type { ProviderAdapter } from '../types/domain'
import { importFromBridge } from './providerBridge'

export const psnProvider: ProviderAdapter = {
  id: 'psn',
  displayName: 'PlayStation / PSN',
  description:
    'Prepara importação da biblioteca PlayStation, PS Plus e troféus por API/bridge autorizado.',
  capabilities: ['Biblioteca', 'PS Plus', 'Troféus', 'Progresso de platina'],
  setupNotes: [
    'A PSN não deve ser lida por scraping. Use apenas API/bridge com autorização do usuário.',
    'Quando o bridge não estiver configurado, a tela mostra exatamente o que falta configurar.',
  ],
  fields: [
    {
      key: 'bridgeBaseUrl',
      label: 'Bridge/API PSN',
      type: 'url',
      required: true,
      placeholder: 'https://sua-api.example.com/psn',
      helpText: 'Endpoint autenticado que retorna biblioteca e troféus reais.',
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
    return importFromBridge('psn', values)
  },
}
