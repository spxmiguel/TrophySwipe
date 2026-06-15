import { Cloud, HardDrive, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const { error, firebaseReady, loading, signInWithGoogle, continueAsGuest } = useAuth()

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Login"
        title="Escolha onde seus dados ficam salvos"
        description="Sem login, o TrophySwipe salva apenas neste dispositivo. Com Google Login, o app sincroniza Firestore e LocalStorage automaticamente."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <Cloud className="size-8 text-signal-cyan" />
          <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">Google Login</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Salva perfil, contas configuradas, biblioteca importada, decisoes de swipe e
            configuracoes na nuvem.
          </p>
          {!firebaseReady ? (
            <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-800 dark:text-amber-100">
              Firebase ainda nao configurado. Preencha as variaveis VITE_FIREBASE_* para ativar o
              login.
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-700 dark:text-red-100">
              {error}
            </p>
          ) : null}
          <Button
            className="mt-6 w-full"
            disabled={loading || !firebaseReady}
            icon={<LogIn className="size-4" />}
            onClick={async () => {
              await signInWithGoogle()
              navigate('/dashboard')
            }}
          >
            Entrar com Google
          </Button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <HardDrive className="size-8 text-signal-amber" />
          <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">Continuar sem conta</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            O app funciona offline-first e guarda os dados no LocalStorage deste navegador. Backup
            em nuvem so acontece depois do login.
          </p>
          <Button
            className="mt-6 w-full"
            variant="secondary"
            icon={<HardDrive className="size-4" />}
            onClick={() => {
              continueAsGuest()
              navigate('/dashboard')
            }}
          >
            Continuar sem conta
          </Button>
        </section>
      </div>
    </div>
  )
}
