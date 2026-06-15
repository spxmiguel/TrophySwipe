import { AlertTriangle, Check, ChevronDown, DownloadCloud, LogIn, Save, UserCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { PageHeader } from '../components/PageHeader'
import { PlatformBadge } from '../components/PlatformBadge'
import { StatusPill } from '../components/StatusPill'
import { allPlatforms, primaryPlatforms } from '../data/platforms'
import { useAppState } from '../hooks/useAppState'
import { useAuth } from '../hooks/useAuth'
import { providerAdapters } from '../providers'
import { ProviderConfigurationError } from '../providers/providerErrors'
import type { PlatformId, ProviderConnection, ProviderField } from '../types/domain'
import { nowIso } from '../utils/date'

type FormState = Record<PlatformId, Record<string, string | boolean>>

function createFormState(connections: Record<PlatformId, ProviderConnection>): FormState {
  return allPlatforms.reduce((acc, providerId) => {
    acc[providerId] = connections[providerId].values
    return acc
  }, {} as FormState)
}

export function ConnectAccountsPage() {
  const { state, saveConnection, replaceProviderGames } = useAppState()
  const { user, firebaseReady, signInWithGoogle } = useAuth()
  const [forms, setForms] = useState<FormState>(() => createFormState(state.connections))
  const [busyProvider, setBusyProvider] = useState<PlatformId | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    setForms(createFormState(state.connections))
  }, [state.connections])

  const orderedProviders = useMemo(
    () => [...primaryPlatforms, ...allPlatforms.filter((platform) => !primaryPlatforms.includes(platform))],
    [],
  )

  function updateValue(providerId: PlatformId, key: string, value: string | boolean) {
    setForms((current) => ({
      ...current,
      [providerId]: {
        ...current[providerId],
        [key]: value,
      },
    }))
  }

  function save(providerId: PlatformId, status: ProviderConnection['status'] = 'configured') {
    saveConnection({
      providerId,
      status,
      values: forms[providerId],
      updatedAt: nowIso(),
    })
    setNotice('Configuracao salva localmente.')
  }

  function quickConnect(providerId: PlatformId) {
    const adapter = providerAdapters[providerId]
    const simpleFields = adapter.fields.filter((field) => !field.advanced)
    const hasSimpleValue = simpleFields.some((field) => {
      const value = forms[providerId][field.key]
      return typeof value === 'boolean' ? value : Boolean(value?.trim())
    })

    if (!hasSimpleValue) {
      setNotice(`Informe o nome/ID da conta ${adapter.displayName} para conectar rapido.`)
      return
    }

    saveConnection({
      providerId,
      status: 'configured',
      values: forms[providerId],
      lastError: undefined,
      updatedAt: nowIso(),
    })
    setNotice(
      `${adapter.displayName} conectado ao perfil. Para importar biblioteca real, use OAuth/bridge quando estiver disponivel.`,
    )
  }

  async function importLibrary(providerId: PlatformId) {
    const adapter = providerAdapters[providerId]
    setBusyProvider(providerId)
    setNotice(null)
    save(providerId, 'syncing')

    try {
      const result = await adapter.importLibrary(forms[providerId])
      replaceProviderGames(providerId, result.games)
      setNotice(result.message ?? `${result.importedCount} jogo(s) importado(s).`)
    } catch (error) {
      const message =
        error instanceof ProviderConfigurationError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Falha desconhecida ao importar biblioteca.'

      saveConnection({
        providerId,
        status: 'error',
        values: forms[providerId],
        lastError: message,
        updatedAt: nowIso(),
      })
      setNotice(message)
    } finally {
      setBusyProvider(null)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Conectar contas"
        title="Clique para logar. Nome da conta quando a plataforma permitir."
        description="O caminho principal e simples: entre com Google para sincronizar e salve o nome/ID das plataformas. Importacao real continua disponivel via API/OAuth/bridge, sem dados inventados."
      />

      <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-signal-cyan">
              <UserCheck className="size-5" />
              <span className="text-sm font-bold uppercase tracking-[0.16em]">Login do app</span>
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">
              {user ? 'Google conectado e sincronizando' : 'Fazer login e liberar sync'}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {user
                ? `Logado como ${user.email ?? user.displayName ?? 'conta Google'}. O TrophySwipe salva localmente e sincroniza na nuvem automaticamente.`
                : 'Um clique com Google ativa backup no Firestore. Sem login, o app continua funcionando localmente neste dispositivo.'}
            </p>
          </div>
          <Button
            disabled={Boolean(user) || !firebaseReady}
            icon={<LogIn className="size-4" />}
            onClick={() => void signInWithGoogle()}
          >
            {user ? 'Login ativo' : 'Fazer login com Google'}
          </Button>
        </div>
      </section>

      {notice ? (
        <div className="mb-5 rounded-lg border border-signal-cyan/30 bg-signal-cyan/10 p-4 text-sm font-medium text-slate-800 dark:text-cyan-100">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-5">
        {orderedProviders.map((providerId) => {
          const adapter = providerAdapters[providerId]
          const connection = state.connections[providerId]
          const isBusy = busyProvider === providerId
          const simpleFields = adapter.fields.filter((field) => !field.advanced)
          const advancedFields = adapter.fields.filter((field) => field.advanced)
          const hasAdvancedValue = advancedFields.some((field) => Boolean(forms[providerId][field.key]))

          return (
            <section
              key={providerId}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <PlatformBadge platform={providerId} />
                    <StatusPill value={connection.status} />
                    {!primaryPlatforms.includes(providerId) ? (
                      <span className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-white/15 dark:text-slate-300">
                        Opcional
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
                    {adapter.displayName}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {adapter.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    icon={<LogIn className="size-4" />}
                    onClick={() => quickConnect(providerId)}
                  >
                    Conectar conta
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={isBusy}
                    icon={<DownloadCloud className="size-4" />}
                    onClick={() => void importLibrary(providerId)}
                  >
                    {isBusy ? 'Importando' : 'Importar dados reais'}
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {simpleFields.map((field) => (
                  <ProviderFieldInput
                    key={field.key}
                    field={field}
                    providerId={providerId}
                    value={forms[providerId][field.key]}
                    onChange={updateValue}
                  />
                ))}
              </div>

              {advancedFields.length > 0 ? (
                <details
                  className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-ink-900/70"
                  open={connection.status === 'error' || hasAdvancedValue}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-slate-800 dark:text-slate-100">
                    <span>Configuracao avancada para importar biblioteca real</span>
                    <ChevronDown className="size-4" />
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Use esta area quando voce tiver OAuth, bridge ou API autorizada. Ela nao e
                    necessaria para salvar o nome da conta.
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {advancedFields.map((field) => (
                      <ProviderFieldInput
                        key={field.key}
                        field={field}
                        providerId={providerId}
                        value={forms[providerId][field.key]}
                        onChange={updateValue}
                      />
                    ))}
                  </div>
                  <Button
                    className="mt-4"
                    variant="secondary"
                    icon={<Save className="size-4" />}
                    onClick={() => save(providerId)}
                  >
                    Salvar configuracao avancada
                  </Button>
                </details>
              ) : null}

              <div className="mt-5 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-ink-900/70 dark:text-slate-300">
                {adapter.setupNotes.map((note) => (
                  <div key={note} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-signal-green" />
                    <span>{note}</span>
                  </div>
                ))}
                {connection.lastError ? (
                  <div className="flex gap-2 text-red-700 dark:text-red-200">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <span>{connection.lastError}</span>
                  </div>
                ) : null}
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}

function ProviderFieldInput({
  field,
  providerId,
  value,
  onChange,
}: {
  field: ProviderField
  providerId: PlatformId
  value: string | boolean | undefined
  onChange(providerId: PlatformId, key: string, value: string | boolean): void
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {field.label}
      </span>
      {field.type === 'textarea' ? (
        <textarea
          className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/30 dark:border-white/12 dark:bg-ink-900 dark:text-white"
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(event) => onChange(providerId, field.key, event.target.value)}
        />
      ) : field.type === 'checkbox' ? (
        <input
          className="mt-3 size-5 rounded border-slate-300 text-signal-cyan"
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(providerId, field.key, event.target.checked)}
        />
      ) : (
        <input
          className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/30 dark:border-white/12 dark:bg-ink-900 dark:text-white"
          type={field.type === 'password' ? 'password' : field.type}
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(event) => onChange(providerId, field.key, event.target.value)}
        />
      )}
      {field.helpText ? (
        <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
          {field.helpText}
        </span>
      ) : null}
    </label>
  )
}
