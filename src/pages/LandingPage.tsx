import {
  ArrowRight,
  Cloud,
  Gamepad2,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Unplug,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import heroImage from '../assets/trophyswipe-hero.png'
import { Button } from '../components/Button'
import { PlatformBadge } from '../components/PlatformBadge'
import { primaryPlatforms } from '../data/platforms'

const features = [
  {
    title: 'Conecte suas contas',
    description:
      'Steam, Xbox, PSN e Switch ficam preparados como providers reais. Se faltar API ou bridge, a tela mostra exatamente o que configurar.',
    icon: Unplug,
  },
  {
    title: 'Receba recomendacoes reais',
    description:
      'As sugestoes nascem da sua biblioteca importada, assinaturas e metadados permitidos. Sem catalogo falso para preencher espaco.',
    icon: Sparkles,
  },
  {
    title: 'Swipe de jogos',
    description:
      'Decida rapido entre ignorar, talvez, quero jogar e quero platinar. Cada escolha vira dado sincronizavel.',
    icon: RotateCw,
  },
  {
    title: 'Modo Platina',
    description:
      'Dificuldade, tempo, trofeus perdiveis, online, multiplas runs, roadmap e links reais quando uma fonte permitida estiver configurada.',
    icon: Trophy,
  },
  {
    title: 'Sincronizacao na nuvem',
    description:
      'Com Google Login, seus dados sobem para Firestore e voltam automaticamente em outro dispositivo.',
    icon: Cloud,
  },
  {
    title: 'Offline-first',
    description:
      'LocalStorage vem primeiro. Sem internet, o app continua salvando localmente e sincroniza quando voce voltar.',
    icon: ShieldCheck,
  },
]

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-ink-950 text-white">
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-ink-950/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="TrophySwipe inicio">
            <span className="grid size-10 place-items-center rounded-lg bg-signal-cyan text-ink-950 shadow-glow">
              <Trophy className="size-5" />
            </span>
            <span className="text-lg font-black">TrophySwipe</span>
          </Link>
          <Link to="/login">
            <Button variant="secondary" icon={<ArrowRight className="size-4" />}>
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      <section
        className="relative min-h-[88dvh] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(7,10,18,0.98) 0%, rgba(7,10,18,0.78) 39%, rgba(7,10,18,0.28) 72%, rgba(7,10,18,0.72) 100%), url(${heroImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="mx-auto flex min-h-[88dvh] max-w-7xl items-center px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap gap-2">
              {primaryPlatforms.map((platform) => (
                <PlatformBadge key={platform} platform={platform} />
              ))}
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal text-white sm:text-6xl lg:text-7xl">
              TrophySwipe
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              Recomende jogos para jogar e platinar usando biblioteca real, historico,
              conquistas, trofeus e assinaturas conectadas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/login">
                <Button icon={<ArrowRight className="size-4" />}>Comecar agora</Button>
              </Link>
              <a href="#como-funciona">
                <Button variant="secondary" icon={<Gamepad2 className="size-4" />}>
                  Ver como funciona
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-y border-white/10 bg-ink-900 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <article
                  key={feature.title}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
                >
                  <Icon className="size-6 text-signal-cyan" />
                  <h2 className="mt-4 text-xl font-bold text-white">{feature.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{feature.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-ink-950 py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="text-3xl font-black tracking-normal">Pronto para conectar dados reais.</h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Comece localmente sem conta ou ative Google Login para backup e sync pelo Firestore.
            </p>
          </div>
          <Link to="/login">
            <Button icon={<ArrowRight className="size-4" />}>Comecar agora</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
