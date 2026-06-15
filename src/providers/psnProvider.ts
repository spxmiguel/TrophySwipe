import type { ProviderAdapter } from '../types/domain'
import { importFromBridge } from './providerBridge'

export const psnProvider: ProviderAdapter = {
  id: 'psn',
  displayName: 'PlayStation / PSN',
  description:
    'Prepara importação da biblioteca PlayStation, PS Plus e troféus por API/bridge autorizado.',
  capabilities: ['Biblioteca', 'PS Plus', 'Troféus', 'Progresso de platina'],
  setupNotes: [
    'Voce pode salvar apenas a PSN ID primeiro; isso deixa a conta pronta sem pedir senha.',
    'A PSN nao deve ser lida por scraping. Use apenas API/bridge com autorizacao do usuario.',
    'Quando o bridge nao estiver configurado, a tela mostra exatamente o que falta configurar.',
  ],
  fields: [
    {
      key: 'accountName',
      label: 'PSN ID',
      type: 'text',
      required: true,
      placeholder: 'Seu ID online da PSN',
      helpText: 'Salva o identificador da conta sem buscar dados privados.',
    },
    {
      key: 'bridgeBaseUrl',
      label: 'Bridge/API PSN',
      type: 'url',
      advanced: true,
      placeholder: 'https://sua-api.example.com/psn',
      helpText: 'Endpoint autenticado que retorna biblioteca e troféus reais.',
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
    return importFromBridge('psn', values)
  },
}
