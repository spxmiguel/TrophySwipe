import type { ProviderAdapter } from '../types/domain'
import { importFromBridge } from './providerBridge'

export const switchProvider: ProviderAdapter = {
  id: 'switch',
  displayName: 'Nintendo Switch',
  description:
    'Prepara conexão com dados reais do Switch por bridge/export autorizado, sem scraping da conta.',
  capabilities: ['Biblioteca', 'Nintendo Switch Online', 'Status manual autorizado'],
  setupNotes: [
    'A Nintendo não oferece uma API pública simples para biblioteca completa do usuário em app estático.',
    'Use um bridge próprio, export autorizado ou integração futura permitida pelos termos da plataforma.',
  ],
  fields: [
    {
      key: 'bridgeBaseUrl',
      label: 'Bridge/API Switch',
      type: 'url',
      required: true,
      placeholder: 'https://sua-api.example.com/switch',
      helpText: 'Endpoint que devolve biblioteca real ou export autorizado do usuário.',
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
    return importFromBridge('switch', values)
  },
}
