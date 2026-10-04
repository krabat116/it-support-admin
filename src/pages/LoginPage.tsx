import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Step = 'password' | 'mfa'

export function LoginPage() {
  const [step, setStep] = useState<Step>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If user already has an aal1 session with enrolled MFA (e.g. redirected from ProtectedLayout),
  // skip the password step and go straight to MFA verification.
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aalData?.nextLevel === 'aal2') {
        const { data: factorsData } = await supabase.auth.mfa.listFactors()
        const factor = factorsData?.totp[0]
        if (factor) {
          setFactorId(factor.id)
          setStep('mfa')
        }
      }
    }
    void checkExistingSession()
  }, [])

  // Step 1: sign in with email + password
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Check if MFA is required
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aalData?.nextLevel === 'aal2') {
      const { data: factorsData } = await supabase.auth.mfa.listFactors()
      const factor = factorsData?.totp[0]
      if (factor) {
        setFactorId(factor.id)
        setStep('mfa')
        setLoading(false)
        return
      }
    }

    // No MFA enrolled — AuthContext + ProtectedLayout will redirect to /mfa-setup
    setLoading(false)
  }

  // Step 2: verify 6-digit TOTP code
  const handleMfaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: mfaError } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    })

    if (mfaError) {
      setError(mfaError.message)
      setCode('')
    }
    // On success: AuthContext detects aal2 → ProtectedLayout allows access
    setLoading(false)
  }

  if (step === 'mfa') {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Two-Factor Authentication</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <form onSubmit={(e) => void handleMfaSubmit(e)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Authentication Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
                placeholder="000000"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-center font-mono text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('password'); setError(''); setCode('') }}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Back to sign in
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">IT Support Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in with your admin account</p>
        </div>

        <form onSubmit={(e) => void handlePasswordSubmit(e)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@company.com"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
