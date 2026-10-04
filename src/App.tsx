import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AppSidebar } from '@/components/AppSidebar'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { GuidesPage } from '@/pages/GuidesPage'
import { AppConfigPage } from '@/pages/AppConfigPage'
import { StatsPage } from '@/pages/StatsPage'
import { MfaSetupPage } from '@/pages/MfaSetupPage'

// Full access: requires session + aal2 (MFA verified)
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, aalLevel } = useAuth()

  if (loading || aalLevel === null) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  // No MFA enrolled → must set up first
  const hasEnrolledFactor = (session.user.factors ?? []).some(
    f => f.factor_type === 'totp' && f.status === 'verified'
  )
  if (!hasEnrolledFactor) return <Navigate to="/mfa-setup" replace />

  // MFA enrolled but not verified this session → back to login (MFA step)
  if (aalLevel !== 'aal2') return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}

// Session-only access: requires session but NOT aal2 (used for MFA setup)
function SessionLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, aalLevel } = useAuth()

  if (loading || aalLevel === null) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  // Already fully authenticated → go to dashboard
  if (aalLevel === 'aal2') return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

function AppRoutes() {
  const { loading, aalLevel } = useAuth()

  if (loading || aalLevel === null) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={aalLevel === 'aal2' ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/mfa-setup"
        element={
          <SessionLayout>
            <MfaSetupPage />
          </SessionLayout>
        }
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
