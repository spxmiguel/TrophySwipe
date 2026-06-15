import {
  Cloud,
  Gamepad2,
  Library,
  LogIn,
  Menu,
  Settings,
  Sparkles,
  Trophy,
  Unplug,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAppState } from '../hooks/useAppState'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../utils/cn'
import { StatusPill } from './StatusPill'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Gamepad2 },
  { to: '/conectar', label: 'Contas', icon: Unplug },
  { to: '/biblioteca', label: 'Biblioteca', icon: Library },
  { to: '/swipe', label: 'Swipe', icon: Sparkles },
  { to: '/platina', label: 'Platina', icon: Trophy },
  { to: '/configuracoes', label: 'Config', icon: Settings },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition',
                isActive
                  ? 'bg-signal-cyan text-ink-950'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.08]',
              )
            }
          >
            <Icon className="size-4" />
            {item.label}
          </NavLink>
        )
      })}
    </>
  )
}

export function Layout() {
  const [open, setOpen] = useState(false)
  const { state, online, syncStatus } = useAppState()
  const { user } = useAuth()

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-950 dark:bg-ink-950 dark:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-ink-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="TrophySwipe inicio">
            <span className="grid size-10 place-items-center rounded-lg bg-signal-cyan text-ink-950 shadow-glow">
              <Trophy className="size-5" />
            </span>
            <span className="text-lg font-black tracking-normal">TrophySwipe</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <NavItems />
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <StatusPill value={online ? syncStatus : 'offline'} />
            <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
              <Cloud className="size-3.5" />
              {user ? state.profile.displayName || 'Conta Google' : 'Local'}
            </div>
          </div>

          <button
            className="grid size-11 place-items-center rounded-lg border border-slate-200 text-slate-800 lg:hidden dark:border-white/12 dark:text-white"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-white/10 dark:bg-ink-950">
            <nav className="grid gap-1">
              <NavItems onNavigate={() => setOpen(false)} />
              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.08]"
              >
                <LogIn className="size-4" />
                Login
              </NavLink>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
