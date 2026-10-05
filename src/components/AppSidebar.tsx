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
    <aside className="flex w-20 flex-shrink-0 flex-col border-r bg-card text-card-foreground md:w-60">
      <div className="border-b px-2 py-5 md:px-6">
        <h1 className="text-center text-xs font-semibold leading-tight md:text-left md:text-lg">
          IT<span className="hidden md:inline"> Support</span>
        </h1>
        <p className="hidden text-xs text-muted-foreground md:block">Admin Portal</p>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4 md:px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              `flex items-center justify-center gap-3 rounded-md px-2 py-2 text-sm transition-colors md:justify-start md:px-3 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`
            }
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className="hidden md:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t px-2 py-4 md:px-3">
        <button
          onClick={() => void signOut()}
          title="Sign Out"
          className="flex w-full items-center justify-center gap-3 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive md:justify-start md:px-3"
        >
          <LogOut size={16} className="flex-shrink-0" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
