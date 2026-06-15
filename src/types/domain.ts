export type PlatformId = 'steam' | 'xbox' | 'psn' | 'switch' | 'epic'

export type GameStatus =
  | 'owned'
  | 'played'
  | 'finished'
  | 'platinum'
  | 'abandoned'
  | 'want_to_play'
  | 'want_to_platinum'

export type ConnectionStatus =
  | 'not_configured'
  | 'configured'
  | 'connected'
  | 'syncing'
  | 'error'

export type ThemePreference = 'dark' | 'light' | 'system'

export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error'

export type ProviderFieldType = 'text' | 'password' | 'url' | 'textarea' | 'checkbox'

export interface ProviderField {
  key: string
  label: string
  type: ProviderFieldType
  required?: boolean
  secret?: boolean
  placeholder?: string
  helpText?: string
}

export interface ProviderConnection {
  providerId: PlatformId
  status: ConnectionStatus
  values: Record<string, string | boolean>
  updatedAt: string
  lastSyncAt?: string
  lastError?: string
}

export interface PlatformOwnership {
  platform: PlatformId
  owned: boolean
  externalId?: string
  playtimeMinutes?: number
  achievementsEarned?: number
  achievementsTotal?: number
  completionPercent?: number
  subscriptionSource?: 'ps_plus' | 'game_pass' | 'nintendo_switch_online' | 'epic_free' | 'other'
  lastPlayedAt?: string
}

export interface GameGuideSummary {
  status: 'available' | 'unavailable' | 'requires_configuration' | 'error'
  difficulty?: string
  estimatedHours?: string
  reason?: string
  sourceUrl?: string
}

export interface GamePromotion {
  source: string
  label?: string
  currentPrice?: string
  originalPrice?: string
  discountPercent?: number
  url?: string
  checkedAt: string
}

export interface UserGame {
  id: string
  title: string
  normalizedTitle: string
  status: GameStatus
  platforms: PlatformOwnership[]
  genres?: string[]
  tags?: string[]
  promotion?: GamePromotion
  importedFrom: PlatformId
  importedAt: string
  updatedAt: string
  guide?: GameGuideSummary
}

export type SwipeChoice = 'ignore' | 'maybe' | 'want_to_play' | 'want_to_platinum'

export interface SwipeDecision {
  id: string
  gameId: string
  choice: SwipeChoice
  createdAt: string
}

export interface Recommendation {
  game: UserGame
  score: number
  reasons: string[]
}

export interface TrophyChecklistItem {
  id: string
  title: string
  description?: string
  missable?: boolean
  online?: boolean
  completed?: boolean
}

export interface TrophyGuide {
  gameId: string
  status: 'available' | 'unavailable' | 'requires_configuration' | 'error'
  difficulty?: string
  estimatedHours?: string
  missableTrophies?: string[]
  onlineTrophies?: string[]
  multipleRuns?: boolean
  roadmap?: string[]
  tips?: string[]
  checklist?: TrophyChecklistItem[]
  links: Array<{ label: string; url: string }>
  reason?: string
  updatedAt: string
}

export interface GamerProfile {
  displayName?: string
  email?: string
  photoURL?: string
  mode: 'guest' | 'cloud'
  updatedAt: string
}

export interface AppSettings {
  theme: ThemePreference
  trophyGuideApiBaseUrl: string
  updatedAt: string
}

export interface AppState {
  version: number
  profile: GamerProfile
  connections: Record<PlatformId, ProviderConnection>
  games: UserGame[]
  swipeDecisions: SwipeDecision[]
  settings: AppSettings
  updatedAt: string
  lastCloudSyncAt?: string
}

export interface ProviderImportResult {
  games: UserGame[]
  importedCount: number
  message?: string
}

export interface ProviderAdapter {
  id: PlatformId
  displayName: string
  description: string
  docsUrl?: string
  fields: ProviderField[]
  capabilities: string[]
  setupNotes: string[]
  importLibrary(values: Record<string, string | boolean>): Promise<ProviderImportResult>
}
