import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const T = {
  bg: '#0E1013',
  surface: '#15181C',
  border: '#262B31',
  text: '#E7E9EC',
  textDim: '#9AA1AB',
  textFaint: '#5F6670',
  accent: '#6C8CFF',
  accentDim: '#3B4A80',
  red: '#F2685C',
}

export default function Login() {
  const { login } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your authenticator app')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await login(code)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: T.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-8"
        style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: T.accentDim }}
          >
            <Sparkles size={18} color={T.accent} strokeWidth={2} />
          </div>
          <div>
            <div className="text-[15px] font-semibold" style={{ color: T.text }}>
              Northgate Office
            </div>
            <div className="text-[12px]" style={{ color: T.textFaint }}>
              Sign in with authenticator
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-medium mb-2" style={{ color: T.textDim }}>
              6-digit code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              autoFocus
              className="w-full rounded-lg px-4 py-3 text-center text-[20px] tracking-[0.4em] font-mono outline-none"
              style={{
                backgroundColor: T.bg,
                border: `1px solid ${T.border}`,
                color: T.text,
              }}
            />
          </div>

          {error && (
            <div className="text-[12.5px] px-3 py-2 rounded-md" style={{ backgroundColor: `${T.red}18`, color: T.red }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="w-full py-2.5 rounded-lg text-[13.5px] font-semibold transition-opacity"
            style={{
              backgroundColor: T.accent,
              color: T.bg,
              opacity: submitting || code.length !== 6 ? 0.45 : 1,
            }}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-[11.5px] text-center leading-relaxed" style={{ color: T.textFaint }}>
          Use the code from Google Authenticator or Authy.
          <br />
          First-time setup: call <code className="font-mono">GET /api/auth/setup</code> on the API.
        </p>
      </div>
    </div>
  )
}
