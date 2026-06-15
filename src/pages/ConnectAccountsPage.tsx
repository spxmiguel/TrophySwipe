import { AlertTriangle, Check, DownloadCloud, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { PageHeader } from '../components/PageHeader'
import { PlatformBadge } from '../components/PlatformBadge'
import { StatusPill } from '../components/StatusPill'
import { allPlatforms, primaryPlatforms } from '../data/platforms'
import { useAppState } from '../hooks/useAppState'
import { providerAdapters } from '../providers'
import { ProviderConfigurationError } from '../providers/providerErrors'
import type { PlatformId, ProviderConnection } from '../types/domain'
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
        title="Providers reais para Steam, Xbox, PSN e Switch"
        description="Cada provider pede credenciais ou um bridge/API real. O TrophySwipe nao cria biblioteca falsa e nao faz scraping de contas."
      />

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
                    variant="secondary"
                    icon={<Save className="size-4" />}
                    onClick={() => save(providerId)}
                  >
                    Salvar
                  </Button>
                  <Button
                    disabled={isBusy}
                    icon={<DownloadCloud className="size-4" />}
                    onClick={() => void importLibrary(providerId)}
                  >
                    {isBusy ? 'Importando' : 'Importar'}
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {adapter.fields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {field.label}
                    </span>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/30 dark:border-white/12 dark:bg-ink-900 dark:text-white"
                        placeholder={field.placeholder}
                        value={String(forms[providerId][field.key] ?? '')}
                        onChange={(event) => updateValue(providerId, field.key, event.target.value)}
                      />
                    ) : field.type === 'checkbox' ? (
                      <input
                        className="mt-3 size-5 rounded border-slate-300 text-signal-cyan"
                        type="checkbox"
                        checked={Boolean(forms[providerId][field.key])}
                        onChange={(event) => updateValue(providerId, field.key, event.target.checked)}
                      />
                    ) : (
                      <input
                        className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/30 dark:border-white/12 dark:bg-ink-900 dark:text-white"
                        type={field.type === 'password' ? 'password' : field.type}
                        placeholder={field.placeholder}
                        value={String(forms[providerId][field.key] ?? '')}
                        onChange={(event) => updateValue(providerId, field.key, event.target.value)}
                      />
                    )}
                    {field.helpText ? (
                      <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {field.helpText}
                      </span>
                    ) : null}
                  </label>
                ))}
              </div>

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
