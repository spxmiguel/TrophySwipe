import { Clock, Heart, Sparkles, Target, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { PlatformBadge } from '../components/PlatformBadge'
import { useAppState } from '../hooks/useAppState'
import { buildRecommendations } from '../services/recommendations'
import type { SwipeChoice } from '../types/domain'
import { createGameFromDiscovery } from '../utils/normalize'

export function SwipePage() {
  const { state, recordSwipe, upsertGame } = useAppState()
  const [index, setIndex] = useState(0)
  const recommendations = useMemo(
    () => buildRecommendations(state.games, state.swipeDecisions),
    [state.games, state.swipeDecisions],
  )
  const current = recommendations[index]

  function choose(choice: SwipeChoice) {
    if (!current) return
    if (
      current.source === 'discovery' &&
      current.discoveryGame &&
      (choice === 'want_to_play' || choice === 'want_to_platinum')
    ) {
      upsertGame(
        createGameFromDiscovery(
          current.discoveryGame,
          choice === 'want_to_play' ? 'want_to_play' : 'want_to_platinum',
        ),
      )
    }
    recordSwipe(current.id, choice)
    setIndex((value) => value + 1)
  }

  return (
    <>
      <PageHeader
        eyebrow="Recomendacoes / Swipe"
        title="Primeiro sua biblioteca. Depois jogos novos do seu gosto."
        description="O swipe prioriza jogos que voce ja tem. Quando a biblioteca acaba, ele recomenda jogos novos por padroes dos seus zerados, platinados, jogados e escolhas anteriores."
      />

      {!current ? (
        <EmptyState
          title="Sem recomendacoes por enquanto"
          description="Importe ou marque alguns jogos como jogado, zerado, platinado, quero jogar ou quero platinar. Assim o algoritmo aprende seu gosto antes de puxar recomendacoes gerais."
          actionLabel="Ver biblioteca"
          actionTo="/biblioteca"
        />
      ) : (
        <div className="mx-auto max-w-xl">
          <div className="relative min-h-[440px]">
            <div className="absolute inset-x-8 top-8 h-[380px] rotate-3 rounded-2xl border border-white/10 bg-slate-200 dark:bg-white/[0.08]" />
            <div className="absolute inset-x-4 top-4 h-[400px] -rotate-2 rounded-2xl border border-white/10 bg-slate-100 dark:bg-white/[0.06]" />
            <article className="relative min-h-[420px] rounded-2xl border border-slate-200 bg-white p-6 shadow-panel dark:border-white/12 dark:bg-ink-900">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-signal-cyan/40 bg-signal-cyan/10 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-100">
                  <Sparkles className="size-4" />
                  Score {current.score}
                </span>
                <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:border-white/15 dark:bg-white/[0.08] dark:text-slate-200">
                  {current.source === 'library' ? 'Sua biblioteca' : 'Jogo novo'}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {index + 1} / {recommendations.length}
                </span>
              </div>

              <h2 className="mt-10 text-3xl font-black tracking-normal text-slate-950 dark:text-white">
                {current.title}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {current.platforms.map((platform) => (
                  <PlatformBadge key={platform} platform={platform} />
                ))}
              </div>

              <div className="mt-8 grid gap-3">
                {current.reasons.map((reason) => (
                  <div
                    key={reason}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                  >
                    {reason}
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Button variant="danger" icon={<X className="size-4" />} onClick={() => choose('ignore')}>
              Ignorar
            </Button>
            <Button
              variant="secondary"
              icon={<Clock className="size-4" />}
              onClick={() => choose('maybe')}
            >
              Talvez
            </Button>
            <Button icon={<Heart className="size-4" />} onClick={() => choose('want_to_play')}>
              Quero jogar
            </Button>
            <Button
              variant="secondary"
              icon={<Target className="size-4" />}
              onClick={() => choose('want_to_platinum')}
            >
              Quero platinar
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
