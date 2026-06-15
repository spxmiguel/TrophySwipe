import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { GameStatusSelect } from '../components/GameStatusSelect'
import { PageHeader } from '../components/PageHeader'
import { PlatformBadge } from '../components/PlatformBadge'
import { StatusPill } from '../components/StatusPill'
import { useAppState } from '../hooks/useAppState'

export function LibraryPage() {
  const { state, updateGameStatus } = useAppState()
  const [query, setQuery] = useState('')

  const games = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return state.games
    return state.games.filter((game) => game.title.toLowerCase().includes(normalized))
  }, [query, state.games])

  return (
    <>
      <PageHeader
        eyebrow="Biblioteca"
        title="Jogos unificados por plataforma"
        description="A biblioteca mostra apenas jogos importados de providers configurados ou dados que voce importou por JSON. Duplicados sao unidos pelo titulo normalizado."
      />

      {state.games.length === 0 ? (
        <EmptyState
          title="Biblioteca vazia"
          description="Nenhum provider importou jogos reais ainda. Configure Steam, Xbox, PSN ou Switch para listar onde cada jogo esta disponivel."
          actionLabel="Conectar contas"
          actionTo="/conectar"
        />
      ) : (
        <>
          <label className="mb-4 flex min-h-11 max-w-xl items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 dark:border-white/12 dark:bg-ink-900">
            <Search className="size-4 text-slate-500" />
            <span className="sr-only">Buscar jogo</span>
            <input
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500 dark:text-white"
              placeholder="Buscar na biblioteca"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <div className="grid gap-3">
            {games.map((game) => (
              <article
                key={game.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950 dark:text-white">{game.title}</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {game.platforms.map((platform) => (
                        <PlatformBadge key={platform.platform} platform={platform.platform} />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <StatusPill value={game.status} />
                    <GameStatusSelect
                      value={game.status}
                      onChange={(status) => updateGameStatus(game.id, status)}
                    />
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-3">
                  <div>
                    <dt className="font-semibold text-slate-800 dark:text-slate-100">Tempo</dt>
                    <dd>
                      {game.platforms.some((platform) => platform.playtimeMinutes)
                        ? `${Math.round(
                            game.platforms.reduce(
                              (total, platform) => total + (platform.playtimeMinutes ?? 0),
                              0,
                            ) / 60,
                          )}h`
                        : 'Nao informado pela API'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-800 dark:text-slate-100">Conquistas</dt>
                    <dd>
                      {game.platforms.some((platform) => platform.achievementsTotal)
                        ? game.platforms
                            .map((platform) =>
                              platform.achievementsTotal
                                ? `${platform.achievementsEarned ?? 0}/${platform.achievementsTotal}`
                                : null,
                            )
                            .filter(Boolean)
                            .join(' | ')
                        : 'Nao informado pela API'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-800 dark:text-slate-100">Assinatura</dt>
                    <dd>
                      {game.platforms
                        .map((platform) => platform.subscriptionSource)
                        .filter(Boolean)
                        .join(', ') || 'Nao detectada'}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  )
}
