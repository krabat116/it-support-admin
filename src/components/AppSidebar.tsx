import { BarChart2, BookOpen, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/guides', label: 'Guide Management', icon: BookOpen },
  { to: '/config', label: 'App Configuration', icon: Settings },
  { to: '/stats', label: 'Usage Statistics', icon: BarChart2 },
]

export function AppSidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="flex w-60 flex-col border-r bg-card text-card-foreground">
      <div className="border-b px-6 py-5">
        <h1 className="text-lg font-semibold">IT Support</h1>
        <p className="text-xs text-muted-foreground">Admin Portal</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t px-3 py-4">
        <button
          onClick={() => void signOut()}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
