import { Cloud, Download, HardDrive, LogOut, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '../components/Button'
import { PageHeader } from '../components/PageHeader'
import { StatusPill } from '../components/StatusPill'
import { useAppState } from '../hooks/useAppState'
import { useAuth } from '../hooks/useAuth'
import type { ThemePreference } from '../types/domain'
import { formatDateTime } from '../utils/date'

export function SettingsPage() {
  const {
    state,
    online,
    syncStatus,
    syncError,
    syncNow,
    exportJson,
    importJson,
    clearLocal,
    deleteCloud,
    updateSettings,
  } = useAppState()
  const { user, signOutUser, signInWithGoogle, firebaseReady } = useAuth()
  const [importText, setImportText] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function downloadJson() {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `trophyswipe-backup-${Date.now()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function readFile(file: File) {
    const raw = await file.text()
    setImportText(raw)
  }

  return (
    <>
      <PageHeader
        eyebrow="Configuracoes"
        title="Login, backup e sincronizacao"
        description="Controle onde os dados ficam, exporte/import JSON e limpe estados locais ou na nuvem quando precisar."
      />

      {notice ? (
        <div className="mb-5 rounded-lg border border-signal-cyan/30 bg-signal-cyan/10 p-4 text-sm font-medium text-slate-800 dark:text-cyan-100">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <Cloud className="size-7 text-signal-cyan" />
          <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">Conta e sync</h2>
          <dl className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between gap-3">
              <dt>Status</dt>
              <dd>
                <StatusPill value={online ? syncStatus : 'offline'} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt>Conta</dt>
              <dd className="font-semibold text-slate-950 dark:text-white">
                {user?.email || 'Sem login'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt>Ultimo sync</dt>
              <dd className="font-semibold text-slate-950 dark:text-white">
                {formatDateTime(state.lastCloudSyncAt)}
              </dd>
            </div>
          </dl>
          {syncError ? (
            <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-700 dark:text-red-100">
              {syncError}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {user ? (
              <>
                <Button variant="secondary" icon={<Cloud className="size-4" />} onClick={() => void syncNow()}>
                  Sincronizar agora
                </Button>
                <Button variant="ghost" icon={<LogOut className="size-4" />} onClick={() => void signOutUser()}>
                  Sair
                </Button>
              </>
            ) : (
              <Button
                disabled={!firebaseReady}
                icon={<Cloud className="size-4" />}
                onClick={() => void signInWithGoogle()}
              >
                Entrar com Google
              </Button>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <HardDrive className="size-7 text-signal-amber" />
          <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">Preferencias</h2>
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Tema</span>
            <select
              className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/30 dark:border-white/12 dark:bg-ink-900 dark:text-white"
              value={state.settings.theme}
              onChange={(event) =>
                updateSettings({ theme: event.target.value as ThemePreference })
              }
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">Sistema</option>
            </select>
          </label>
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              API de guias de platina
            </span>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/30 dark:border-white/12 dark:bg-ink-900 dark:text-white"
              placeholder="https://sua-api.example.com/guides"
              value={state.settings.trophyGuideApiBaseUrl}
              onChange={(event) => updateSettings({ trophyGuideApiBaseUrl: event.target.value })}
            />
            <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
              Use uma fonte permitida. O app nao faz scraping de guias.
            </span>
          </label>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Backup JSON</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="secondary" icon={<Download className="size-4" />} onClick={downloadJson}>
              Exportar dados JSON
            </Button>
            <Button
              variant="secondary"
              icon={<Upload className="size-4" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Selecionar JSON
            </Button>
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void readFile(file)
              }}
            />
          </div>
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Importar JSON
            </span>
            <textarea
              className="mt-2 min-h-40 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-signal-blue focus:ring-2 focus:ring-signal-blue/30 dark:border-white/12 dark:bg-ink-900 dark:text-white"
              placeholder="Cole aqui um backup exportado pelo TrophySwipe"
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              icon={<Upload className="size-4" />}
              onClick={() => {
                try {
                  importJson(importText)
                  setNotice('JSON importado e mesclado com os dados locais.')
                  setImportText('')
                } catch (error) {
                  setNotice(error instanceof Error ? error.message : 'Falha ao importar JSON.')
                }
              }}
            >
              Importar dados JSON
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="size-4" />}
              onClick={() => {
                if (window.confirm('Limpar dados locais deste navegador?')) {
                  clearLocal()
                  setNotice('Dados locais limpos.')
                }
              }}
            >
              Limpar dados locais
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="size-4" />}
              onClick={() => {
                if (window.confirm('Apagar dados da nuvem para esta conta?')) {
                  void deleteCloud().then(() => setNotice('Dados da nuvem apagados.'))
                }
              }}
            >
              Apagar dados da nuvem
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}
