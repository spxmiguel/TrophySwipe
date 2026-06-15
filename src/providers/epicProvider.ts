import type { ProviderAdapter } from '../types/domain'
import { importFromBridge } from './providerBridge'

export const epicProvider: ProviderAdapter = {
  id: 'epic',
  displayName: 'Epic Games',
  description:
    'Integração preparada para biblioteca Epic por bridge próprio, mantendo o escopo original do projeto.',
  capabilities: ['Biblioteca', 'Jogos resgatados', 'Progresso quando disponível'],
  setupNotes: [
    'A UI principal destaca Steam, Xbox, PSN e Switch, mas Epic permanece preparada como provider opcional.',
    'Use bridge autorizado; não faça scraping de conta ou loja.',
  ],
  fields: [
    {
      key: 'bridgeBaseUrl',
      label: 'Bridge/API Epic',
      type: 'url',
      required: true,
      placeholder: 'https://sua-api.example.com/epic',
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
    return importFromBridge('epic', values)
  },
}
