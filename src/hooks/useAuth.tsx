import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { auth, isFirebaseConfigured } from '../firebase/app'

interface AuthContextValue {
  user: User | null
  loading: boolean
  error: string | null
  guestAccepted: boolean
  firebaseReady: boolean
  signInWithGoogle(): Promise<void>
  signOutUser(): Promise<void>
  continueAsGuest(): void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const GUEST_KEY = 'trophyswipe:guest'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(auth))
  const [error, setError] = useState<string | null>(null)
  const [guestAccepted, setGuestAccepted] = useState(
    () => localStorage.getItem(GUEST_KEY) === 'true',
  )

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return undefined
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setError(null)

    if (!auth) {
      setError('Firebase nao configurado. Preencha as variaveis VITE_FIREBASE_* primeiro.')
      return
    }

    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      localStorage.removeItem(GUEST_KEY)
      setGuestAccepted(false)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha no login com Google.')
    }
  }, [])

  const signOutUser = useCallback(async () => {
    if (!auth) return
    await signOut(auth)
  }, [])

  const continueAsGuest = useCallback(() => {
    localStorage.setItem(GUEST_KEY, 'true')
    setGuestAccepted(true)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      guestAccepted,
      firebaseReady: isFirebaseConfigured,
      signInWithGoogle,
      signOutUser,
      continueAsGuest,
    }),
    [continueAsGuest, error, guestAccepted, loading, signInWithGoogle, signOutUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  }

  return context
}
