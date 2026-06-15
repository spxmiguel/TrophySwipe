import { Library, Sparkles, Trophy, Unplug } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { PlatformBadge } from '../components/PlatformBadge'
import { StatCard } from '../components/StatCard'
import { StatusPill } from '../components/StatusPill'
import { primaryPlatforms } from '../data/platforms'
import { useAppState } from '../hooks/useAppState'
import { buildRecommendations } from '../services/recommendations'
import { formatDateTime } from '../utils/date'

export function DashboardPage() {
  const { state, online, syncStatus } = useAppState()
  const connected = primaryPlatforms.filter(
    (platform) => state.connections[platform].status === 'connected',
  )
  const recommendations = buildRecommendations(state.games, state.swipeDecisions)
  const platinumCount = state.games.filter(
    (game) => game.status === 'platinum' || game.status === 'want_to_platinum',
  ).length

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Seu perfil gamer, sem dados inventados"
        description="Os numeros abaixo refletem apenas contas configuradas, imports reais, escolhas de swipe e dados salvos localmente ou no Firestore."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Unplug className="size-5" />}
          label="Contas conectadas"
          value={connected.length}
          detail="Steam, Xbox, PSN e Switch aparecem quando o provider importa com sucesso."
        />
        <StatCard
          icon={<Library className="size-5" />}
          label="Jogos importados"
          value={state.games.length}
          detail="Duplicados sao unificados pelo titulo normalizado e mantem plataformas."
        />
        <StatCard
          icon={<Sparkles className="size-5" />}
          label="Recomendacoes"
          value={recommendations.length}
          detail="Priorizadas por posse, assinaturas, historico e guia quando disponivel."
        />
        <StatCard
          icon={<Trophy className="size-5" />}
          label="Platina"
          value={platinumCount}
          detail="Inclui jogos platinados/100% e jogos marcados como quero platinar."
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Perfil</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Modo {state.profile.mode === 'cloud' ? 'nuvem' : 'local'}.
              </p>
            </div>
            <StatusPill value={online ? syncStatus : 'offline'} />
          </div>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Nome</dt>
              <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                {state.profile.displayName || 'Sem login'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Ultimo sync cloud</dt>
              <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                {formatDateTime(state.lastCloudSyncAt)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Plataformas</h2>
          <div className="mt-5 grid gap-3">
            {primaryPlatforms.map((platform) => (
              <div
                key={platform}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-white/10"
              >
                <PlatformBadge platform={platform} />
                <StatusPill value={state.connections[platform].status} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {state.games.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nenhum jogo importado ainda"
            description="Conecte uma plataforma e configure uma API/bridge real. Enquanto nao houver biblioteca importada, o dashboard fica vazio por design."
            actionLabel="Conectar contas"
            actionTo="/conectar"
          />
        </div>
      ) : null}
    </>
  )
}
