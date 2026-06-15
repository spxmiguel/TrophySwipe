import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createDefaultState } from '../data/defaultState'
import { db } from '../firebase/app'
import {
  deleteCloudState,
  loadCloudState,
  saveCloudState,
} from '../services/cloudSync'
import {
  clearLocalState,
  exportStateJson,
  loadLocalState,
  parseImportedState,
  saveLocalState,
} from '../services/localStorage'
import type {
  AppState,
  AppSettings,
  GameStatus,
  PlatformId,
  ProviderConnection,
  SwipeChoice,
  SyncStatus,
  UserGame,
} from '../types/domain'
import { nowIso } from '../utils/date'
import { mergeGames, mergeAppState } from '../utils/mergeState'
import { useAuth } from './useAuth'
import { useOnlineStatus } from './useOnlineStatus'

interface AppStateContextValue {
  state: AppState
  online: boolean
  syncStatus: SyncStatus
  syncError: string | null
  saveConnection(connection: ProviderConnection): void
  replaceProviderGames(providerId: PlatformId, games: UserGame[]): void
  updateGameStatus(gameId: string, status: GameStatus): void
  recordSwipe(gameId: string, choice: SwipeChoice): void
  updateSettings(settings: Partial<AppSettings>): void
  syncNow(): Promise<void>
  exportJson(): string
  importJson(raw: string): void
  clearLocal(): void
  deleteCloud(): Promise<void>
}

const AppStateContext = createContext<AppStateContextValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadLocalState())
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)
  const online = useOnlineStatus()
  const { user } = useAuth()
  const pushedUpdatedAt = useRef<string | null>(null)

  useEffect(() => {
    saveLocalState(state)
  }, [state])

  useEffect(() => {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldUseDark =
      state.settings.theme === 'dark' || (state.settings.theme === 'system' && prefersDark)

    root.classList.toggle('dark', shouldUseDark)
  }, [state.settings.theme])

  useEffect(() => {
    setState((current) => {
      if (!user) {
        return {
          ...current,
          profile: { ...current.profile, mode: 'guest', updatedAt: nowIso() },
        }
      }

      return {
        ...current,
        profile: {
          mode: 'cloud',
          displayName: user.displayName ?? undefined,
          email: user.email ?? undefined,
          photoURL: user.photoURL ?? undefined,
          updatedAt: nowIso(),
        },
        updatedAt: nowIso(),
      }
    })
  }, [user])

  const syncNow = useCallback(async () => {
    if (!user || !db) {
      setSyncStatus(online ? 'idle' : 'offline')
      return
    }

    if (!online) {
      setSyncStatus('offline')
      return
    }

    setSyncStatus('syncing')
    setSyncError(null)

    try {
      const remote = await loadCloudState(user.uid)
      setState((current) => {
        const merged = {
          ...mergeAppState(current, remote),
          lastCloudSyncAt: nowIso(),
        }
        saveCloudState(user.uid, merged).catch((error: unknown) => {
          setSyncStatus('error')
          setSyncError(error instanceof Error ? error.message : 'Falha ao salvar na nuvem.')
        })
        pushedUpdatedAt.current = merged.updatedAt
        return merged
      })
      setSyncStatus('idle')
    } catch (error) {
      setSyncStatus('error')
      setSyncError(error instanceof Error ? error.message : 'Falha ao sincronizar.')
    }
  }, [online, user])

  useEffect(() => {
    if (!user || !online || !db) return
    void syncNow()
  }, [online, syncNow, user])

  useEffect(() => {
    if (!user || !online || !db || pushedUpdatedAt.current === state.updatedAt) return

    const timer = window.setTimeout(() => {
      setSyncStatus('syncing')
      saveCloudState(user.uid, state)
        .then(() => {
          pushedUpdatedAt.current = state.updatedAt
          setState((current) => ({ ...current, lastCloudSyncAt: nowIso() }))
          setSyncStatus('idle')
          setSyncError(null)
        })
        .catch((error: unknown) => {
          setSyncStatus('error')
          setSyncError(error instanceof Error ? error.message : 'Falha ao salvar na nuvem.')
        })
    }, 900)

    return () => window.clearTimeout(timer)
  }, [online, state, user])

  const commit = useCallback((producer: (current: AppState, timestamp: string) => AppState) => {
    setState((current) => {
      const timestamp = nowIso()
      return { ...producer(current, timestamp), updatedAt: timestamp }
    })
  }, [])

  const saveConnection = useCallback(
    (connection: ProviderConnection) => {
      commit((current) => ({
        ...current,
        connections: {
          ...current.connections,
          [connection.providerId]: connection,
        },
      }))
    },
    [commit],
  )

  const replaceProviderGames = useCallback(
    (providerId: PlatformId, games: UserGame[]) => {
      commit((current, timestamp) => {
        const remaining = current.games.filter((game) =>
          game.platforms.every((platform) => platform.platform !== providerId),
        )

        return {
          ...current,
          games: mergeGames(remaining, games),
          connections: {
            ...current.connections,
            [providerId]: {
              ...current.connections[providerId],
              status: 'connected',
              lastSyncAt: timestamp,
              lastError: undefined,
              updatedAt: timestamp,
            },
          },
        }
      })
    },
    [commit],
  )

  const updateGameStatus = useCallback(
    (gameId: string, status: GameStatus) => {
      commit((current, timestamp) => ({
        ...current,
        games: current.games.map((game) =>
          game.id === gameId ? { ...game, status, updatedAt: timestamp } : game,
        ),
      }))
    },
    [commit],
  )

  const recordSwipe = useCallback(
    (gameId: string, choice: SwipeChoice) => {
      commit((current, timestamp) => ({
        ...current,
        swipeDecisions: [
          {
            id: `${gameId}:${timestamp}:${choice}`,
            gameId,
            choice,
            createdAt: timestamp,
          },
          ...current.swipeDecisions,
        ],
        games: current.games.map((game) =>
          game.id !== gameId
            ? game
            : {
                ...game,
                status:
                  choice === 'want_to_play'
                    ? 'want_to_play'
                    : choice === 'want_to_platinum'
                      ? 'want_to_platinum'
                      : game.status,
                updatedAt: timestamp,
              },
        ),
      }))
    },
    [commit],
  )

  const updateSettings = useCallback(
    (settings: Partial<AppSettings>) => {
      commit((current, timestamp) => ({
        ...current,
        settings: { ...current.settings, ...settings, updatedAt: timestamp },
      }))
    },
    [commit],
  )

  const importJson = useCallback(
    (raw: string) => {
      const imported = parseImportedState(raw)
      commit((current) => mergeAppState(current, imported))
    },
    [commit],
  )

  const clearLocal = useCallback(() => {
    clearLocalState()
    setState(createDefaultState())
  }, [])

  const deleteCloud = useCallback(async () => {
    if (!user || !db) return
    await deleteCloudState(user.uid)
    setState((current) => ({ ...current, lastCloudSyncAt: undefined, updatedAt: nowIso() }))
  }, [user])

  const value = useMemo(
    () => ({
      state,
      online,
      syncStatus,
      syncError,
      saveConnection,
      replaceProviderGames,
      updateGameStatus,
      recordSwipe,
      updateSettings,
      syncNow,
      exportJson: () => exportStateJson(state),
      importJson,
      clearLocal,
      deleteCloud,
    }),
    [
      clearLocal,
      deleteCloud,
      importJson,
      online,
      recordSwipe,
      replaceProviderGames,
      saveConnection,
      state,
      syncError,
      syncNow,
      syncStatus,
      updateGameStatus,
      updateSettings,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState deve ser usado dentro de AppStateProvider.')
  }

  return context
}
