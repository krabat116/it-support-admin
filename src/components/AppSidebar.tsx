import { BarChart2, BookOpen, LayoutDashboard, Laptop, LogOut, Monitor, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePlatform } from '@/contexts/PlatformContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/guides', label: 'Guide Management', icon: BookOpen },
  { to: '/config', label: 'App Configuration', icon: Settings },
  { to: '/stats', label: 'Usage Statistics', icon: BarChart2 },
]

export function AppSidebar() {
  const { signOut } = useAuth()
  const { platform, setPlatform } = usePlatform()

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

      {/* Platform toggle */}
      <div className="border-t px-2 py-3 md:px-3">
        <p className="mb-1.5 hidden text-center text-xs text-muted-foreground md:block md:text-left">
          Platform
        </p>
        <div className="flex overflow-hidden rounded-md border">
          <button
            onClick={() => setPlatform('windows')}
            title="Windows"
            className={`flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors ${
              platform === 'windows'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Monitor size={13} className="flex-shrink-0" />
            <span className="hidden md:inline">Windows</span>
          </button>
          <button
            onClick={() => setPlatform('mac')}
            title="macOS"
            className={`flex flex-1 items-center justify-center gap-1.5 border-l py-1.5 text-xs font-medium transition-colors ${
              platform === 'mac'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Laptop size={13} className="flex-shrink-0" />
            <span className="hidden md:inline">macOS</span>
          </button>
        </div>
      </div>

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
