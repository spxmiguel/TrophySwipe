import type { ProviderAdapter } from '../types/domain'
import { importFromBridge } from './providerBridge'

export const switchProvider: ProviderAdapter = {
  id: 'switch',
  displayName: 'Nintendo Switch',
  description:
    'Prepara conexão com dados reais do Switch por bridge/export autorizado, sem scraping da conta.',
  capabilities: ['Biblioteca', 'Nintendo Switch Online', 'Status manual autorizado'],
  setupNotes: [
    'Voce pode salvar apenas o nome da conta/friend code primeiro; isso deixa a conta pronta no perfil.',
    'A Nintendo nao oferece uma API publica simples para biblioteca completa do usuario em app estatico.',
    'Use um bridge proprio, export autorizado ou integracao futura permitida pelos termos da plataforma.',
  ],
  fields: [
    {
      key: 'accountName',
      label: 'Nome da conta ou friend code',
      type: 'text',
      required: true,
      placeholder: 'SW-0000-0000-0000 ou nome da conta',
      helpText: 'Salva o identificador da conta sem pedir senha Nintendo.',
    },
    {
      key: 'bridgeBaseUrl',
      label: 'Bridge/API Switch',
      type: 'url',
      advanced: true,
      placeholder: 'https://sua-api.example.com/switch',
      helpText: 'Endpoint que devolve biblioteca real ou export autorizado do usuário.',
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
    return importFromBridge('switch', values)
  },
}
