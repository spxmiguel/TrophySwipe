import { ExternalLink, RefreshCw, Trophy } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { PlatformBadge } from '../components/PlatformBadge'
import { getTrophyGuide } from '../providers/trophyGuideProvider'
import type { TrophyGuide } from '../types/domain'
import { useAppState } from '../hooks/useAppState'

export function PlatinumModePage() {
  const { state } = useAppState()
  const platinumCandidates = useMemo(
    () =>
      state.games.filter(
        (game) => game.status === 'want_to_platinum' || game.status === 'platinum' || game.status === 'owned',
      ),
    [state.games],
  )
  const [selectedId, setSelectedId] = useState<string | null>(platinumCandidates[0]?.id ?? null)
  const [guide, setGuide] = useState<TrophyGuide | null>(null)
  const [loading, setLoading] = useState(false)
  const selectedGame = platinumCandidates.find((game) => game.id === selectedId) ?? null

  useEffect(() => {
    if (!selectedGame) {
      setGuide(null)
      return
    }

    let cancelled = false
    setLoading(true)
    getTrophyGuide(selectedGame, state.settings.trophyGuideApiBaseUrl)
      .then((nextGuide) => {
        if (!cancelled) setGuide(nextGuide)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedGame, state.settings.trophyGuideApiBaseUrl])

  return (
    <>
      <PageHeader
        eyebrow="Modo Platina"
        title="Roadmap de trofeus e conquistas"
        description="Guias aparecem apenas quando uma fonte permitida estiver configurada. Sem scraping ilegal e sem dados inventados."
      />

      {platinumCandidates.length === 0 ? (
        <EmptyState
          title="Nenhum jogo elegivel"
          description="Importe a biblioteca e marque jogos como quero platinar para carregar guias reais quando houver uma fonte configurada."
          actionLabel="Abrir biblioteca"
          actionTo="/biblioteca"
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Jogos
            </h2>
            <div className="mt-4 grid gap-2">
              {platinumCandidates.map((game) => (
                <button
                  key={game.id}
                  className={`rounded-lg border p-3 text-left transition ${
                    game.id === selectedId
                      ? 'border-signal-cyan bg-signal-cyan/10'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/[0.06]'
                  }`}
                  type="button"
                  onClick={() => setSelectedId(game.id)}
                >
                  <span className="block font-semibold text-slate-950 dark:text-white">{game.title}</span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {game.platforms.map((platform) => (
                      <PlatformBadge key={platform.platform} platform={platform.platform} />
                    ))}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            {!selectedGame || !guide ? (
              <EmptyState
                title="Selecione um jogo"
                description="Escolha um jogo da lista para verificar se existe guia configurado."
              />
            ) : (
              <>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-signal-cyan">
                      <Trophy className="size-5" />
                      <span className="text-sm font-bold uppercase tracking-[0.16em]">Guia</span>
                    </div>
                    <h2 className="mt-3 text-3xl font-black tracking-normal text-slate-950 dark:text-white">
                      {selectedGame.title}
                    </h2>
                  </div>
                  <Button
                    variant="secondary"
                    icon={<RefreshCw className="size-4" />}
                    disabled={loading}
                    onClick={() => {
                      if (!selectedGame) return
                      setLoading(true)
                      getTrophyGuide(selectedGame, state.settings.trophyGuideApiBaseUrl)
                        .then(setGuide)
                        .finally(() => setLoading(false))
                    }}
                  >
                    Atualizar
                  </Button>
                </div>

                {guide.status !== 'available' ? (
                  <div className="mt-6 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-800 dark:text-amber-100">
                    {guide.reason || 'Guia indisponivel para este jogo.'}
                  </div>
                ) : (
                  <div className="mt-6 grid gap-5">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Dificuldade</p>
                        <p className="mt-1 font-bold text-slate-950 dark:text-white">
                          {guide.difficulty || 'Nao informado'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tempo estimado</p>
                        <p className="mt-1 font-bold text-slate-950 dark:text-white">
                          {guide.estimatedHours || 'Nao informado'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Multiplas runs</p>
                        <p className="mt-1 font-bold text-slate-950 dark:text-white">
                          {typeof guide.multipleRuns === 'boolean'
                            ? guide.multipleRuns
                              ? 'Sim'
                              : 'Nao'
                            : 'Nao informado'}
                        </p>
                      </div>
                    </div>

                    <GuideList title="Trofeus perdiveis" items={guide.missableTrophies ?? []} />
                    <GuideList title="Trofeus online" items={guide.onlineTrophies ?? []} />
                    <GuideList title="Roadmap" items={guide.roadmap ?? []} ordered />
                    <GuideList title="Dicas" items={guide.tips ?? []} />

                    <div>
                      <h3 className="text-lg font-bold text-slate-950 dark:text-white">Links reais</h3>
                      {guide.links.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          A fonte configurada nao retornou links.
                        </p>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {guide.links.map((link) => (
                            <a
                              key={link.url}
                              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:text-white dark:hover:bg-white/[0.08]"
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {link.label}
                              <ExternalLink className="size-4" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </>
  )
}

function GuideList({
  title,
  items,
  ordered,
}: {
  title: string
  items: string[]
  ordered?: boolean
}) {
  const ListTag = ordered ? 'ol' : 'ul'

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Nao informado pela fonte.</p>
      ) : (
        <ListTag className="mt-3 grid gap-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]"
            >
              {item}
            </li>
          ))}
        </ListTag>
      )}
    </div>
  )
}
