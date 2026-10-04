import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function MfaSetupPage() {
  const [factorId, setFactorId] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [enrolling, setEnrolling] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const enroll = async () => {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      })
      if (enrollError || !data) {
        setError('Failed to initialize 2FA setup. Please refresh and try again.')
        setEnrolling(false)
        return
      }
      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setEnrolling(false)
    }
    void enroll()
  }, [])

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const challenge = await supabase.auth.mfa.challenge({ factorId })
    if (challenge.error) {
      setError(challenge.error.message)
      setLoading(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code,
    })

    if (verifyError) {
      setError('Invalid code. Please try again.')
      setCode('')
    }
    // On success: onAuthStateChange fires → AuthContext updates aalLevel to aal2
    // → ProtectedLayout allows access → navigates to /dashboard automatically
    setLoading(false)
  }

  return (
    <div className="flex h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Set Up Two-Factor Authentication</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            2FA is required to access the admin portal.
          </p>
        </div>

        {enrolling ? (
          <p className="text-sm text-muted-foreground">Preparing QR code...</p>
        ) : error && !qrCode ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <>
            <ol className="mb-6 space-y-3 text-sm text-muted-foreground">
              <li>1. Install <strong className="text-foreground">Google Authenticator</strong> or <strong className="text-foreground">Authy</strong> on your phone.</li>
              <li>2. Tap <strong className="text-foreground">+</strong> and scan the QR code below.</li>
              <li>3. Enter the 6-digit code shown in the app.</li>
            </ol>

            {qrCode && (
              <div className="mb-5 flex justify-center">
                <img
                  src={qrCode}
                  alt="2FA QR Code"
                  className="h-44 w-44 rounded border p-1"
                />
              </div>
            )}

            {secret && (
              <div className="mb-5 rounded-md bg-muted px-3 py-2">
                <p className="mb-1 text-xs text-muted-foreground">Can't scan? Enter this key manually:</p>
                <p className="break-all font-mono text-sm">{secret}</p>
              </div>
            )}

            <form onSubmit={(e) => void handleVerify(e)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">6-digit code</label>
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
                {loading ? 'Verifying...' : 'Enable 2FA'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
