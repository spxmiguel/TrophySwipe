import { platformInfo } from '../data/platforms'
import type { PlatformId } from '../types/domain'
import { cn } from '../utils/cn'

export function PlatformBadge({ platform }: { platform: PlatformId }) {
  const info = platformInfo[platform]
  const Icon = info.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 dark:bg-white/5 dark:text-white',
        info.borderClass,
      )}
    >
      <Icon className={cn('size-3.5', info.accentClass)} />
      {info.shortName}
    </span>
  )
}
