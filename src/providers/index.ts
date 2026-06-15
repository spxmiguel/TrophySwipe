import type { PlatformId, ProviderAdapter } from '../types/domain'
import { epicProvider } from './epicProvider'
import { psnProvider } from './psnProvider'
import { steamProvider } from './steamProvider'
import { switchProvider } from './switchProvider'
import { xboxProvider } from './xboxProvider'

export const providerAdapters: Record<PlatformId, ProviderAdapter> = {
  steam: steamProvider,
  xbox: xboxProvider,
  psn: psnProvider,
  switch: switchProvider,
  epic: epicProvider,
}
