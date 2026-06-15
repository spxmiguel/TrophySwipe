import type { GameStatus } from '../types/domain'

const options: Array<{ value: GameStatus; label: string }> = [
  { value: 'owned', label: 'Possui' },
  { value: 'played', label: 'Jogado' },
  { value: 'finished', label: 'Zerado' },
  { value: 'platinum', label: 'Platinado/100%' },
  { value: 'abandoned', label: 'Abandonado' },
  { value: 'want_to_play', label: 'Quero jogar' },
  { value: 'want_to_platinum', label: 'Quero platinar' },
]

export function GameStatusSelect({
  value,
  onChange,
}: {
  value: GameStatus
  onChange(status: GameStatus): void
}) {
  return (
    <label className="block">
      <span className="sr-only">Status do jogo</span>
      <select
        className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/30 dark:border-white/12 dark:bg-ink-900 dark:text-white"
        value={value}
        onChange={(event) => onChange(event.target.value as GameStatus)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
