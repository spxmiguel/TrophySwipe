import {
  Gamepad2,
  Monitor,
  type LucideIcon,
  Network,
  Shield,
  Trophy,
} from 'lucide-react'
import type { PlatformId } from '../types/domain'

export interface PlatformInfo {
  id: PlatformId
  name: string
  shortName: string
  icon: LucideIcon
  accentClass: string
  borderClass: string
}

export const platformInfo: Record<PlatformId, PlatformInfo> = {
  steam: {
    id: 'steam',
    name: 'Steam',
    shortName: 'Steam',
    icon: Monitor,
    accentClass: 'text-signal-blue',
    borderClass: 'border-signal-blue/40',
  },
  xbox: {
    id: 'xbox',
    name: 'Xbox',
    shortName: 'Xbox',
    icon: Gamepad2,
    accentClass: 'text-signal-green',
    borderClass: 'border-signal-green/40',
  },
  psn: {
    id: 'psn',
    name: 'PlayStation / PSN',
    shortName: 'PSN',
    icon: Trophy,
    accentClass: 'text-signal-cyan',
    borderClass: 'border-signal-cyan/40',
  },
  switch: {
    id: 'switch',
    name: 'Nintendo Switch',
    shortName: 'Switch',
    icon: Shield,
    accentClass: 'text-signal-red',
    borderClass: 'border-signal-red/40',
  },
  epic: {
    id: 'epic',
    name: 'Epic Games',
    shortName: 'Epic',
    icon: Network,
    accentClass: 'text-signal-amber',
    borderClass: 'border-signal-amber/40',
  },
}

export const primaryPlatforms: PlatformId[] = ['steam', 'xbox', 'psn', 'switch']
export const allPlatforms: PlatformId[] = ['steam', 'xbox', 'psn', 'switch', 'epic']
