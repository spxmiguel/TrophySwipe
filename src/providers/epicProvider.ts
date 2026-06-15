import type { ProviderAdapter } from '../types/domain'
import { importFromBridge } from './providerBridge'

export const epicProvider: ProviderAdapter = {
  id: 'epic',
  displayName: 'Epic Games',
  description:
    'Integração preparada para biblioteca Epic por bridge próprio, mantendo o escopo original do projeto.',
  capabilities: ['Biblioteca', 'Jogos resgatados', 'Progresso quando disponível'],
  setupNotes: [
    'Voce pode salvar apenas o nome da conta primeiro; Epic permanece como provider opcional preparado.',
    'Use bridge autorizado; nao faça scraping de conta ou loja.',
  ],
  fields: [
    {
      key: 'accountName',
      label: 'Nome da conta Epic',
      type: 'text',
      required: true,
      placeholder: 'Seu usuario Epic',
    },
    {
      key: 'bridgeBaseUrl',
      label: 'Bridge/API Epic',
      type: 'url',
      advanced: true,
      placeholder: 'https://sua-api.example.com/epic',
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
    return importFromBridge('epic', values)
  },
}
