import type { ConnectionStatus, GameStatus, SyncStatus } from '../types/domain'
import { cn } from '../utils/cn'

const labels: Record<ConnectionStatus | GameStatus | SyncStatus, string> = {
  not_configured: 'Nao configurado',
  configured: 'Conta salva',
  connected: 'Biblioteca importada',
  syncing: 'Sincronizando',
  error: 'Erro',
  owned: 'Possui',
  played: 'Jogado',
  finished: 'Zerado',
  platinum: 'Platinado/100%',
  abandoned: 'Abandonado',
  want_to_play: 'Quero jogar',
  want_to_platinum: 'Quero platinar',
  idle: 'Em dia',
  offline: 'Offline',
}

const tones: Record<string, string> = {
  connected: 'border-emerald-400/40 bg-emerald-400/12 text-emerald-700 dark:text-emerald-200',
  configured: 'border-blue-400/40 bg-blue-400/12 text-blue-700 dark:text-blue-200',
  syncing: 'border-cyan-400/40 bg-cyan-400/12 text-cyan-700 dark:text-cyan-200',
  error: 'border-red-400/40 bg-red-400/12 text-red-700 dark:text-red-200',
  offline: 'border-amber-400/40 bg-amber-400/12 text-amber-700 dark:text-amber-200',
  idle: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-white/15 dark:bg-white/[0.08] dark:text-slate-200',
}

export function StatusPill({ value }: { value: ConnectionStatus | GameStatus | SyncStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
        tones[value] ??
          'border-slate-300 bg-slate-100 text-slate-700 dark:border-white/15 dark:bg-white/[0.08] dark:text-slate-200',
      )}
    >
      {labels[value]}
    </span>
  )
}
