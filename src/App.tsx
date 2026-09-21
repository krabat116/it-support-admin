import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AppSidebar } from '@/components/AppSidebar'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { GuidesPage } from '@/pages/GuidesPage'
import { AppConfigPage } from '@/pages/AppConfigPage'
import { StatsPage } from '@/pages/StatsPage'

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        로딩 중...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}

function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        로딩 중...
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/guides"
        element={
          <ProtectedLayout>
            <GuidesPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/config"
        element={
          <ProtectedLayout>
            <AppConfigPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedLayout>
            <StatsPage />
          </ProtectedLayout>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
