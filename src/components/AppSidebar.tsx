import { BarChart2, BookOpen, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePlatform } from '@/contexts/PlatformContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/guides', label: 'Guide Management', icon: BookOpen },
  { to: '/config', label: 'App Configuration', icon: Settings },
  { to: '/stats', label: 'Usage Statistics', icon: BarChart2 },
]

function WindowsLogo({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  )
}

function AppleLogo({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  )
}

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
            <WindowsLogo size={13} />
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
            <AppleLogo size={13} />
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
