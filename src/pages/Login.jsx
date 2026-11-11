import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'

export default function Login() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const authError = params.get('auth_error')

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true })
  }, [user, loading, navigate])

  const handleLogin = () => {
    window.location.href = authApi.loginUrl()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a12' }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(239,68,68,0.3)', borderTopColor: '#EF4444' }} />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#080810' }}
    >
      {/* Background glow blobs */}
      <div style={{
        position: 'fixed', top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '500px', pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.10) 0%, transparent 65%)',
      }} />

      {/* Card — wider and more spacious */}
      <div
        className="relative z-10 flex flex-col items-center text-center"
        style={{
          width: 480,
          padding: '56px 48px 44px',
          borderRadius: 20,
          background: 'rgba(14,14,22,0.98)',
          border: '1px solid rgba(239,68,68,0.20)',
          boxShadow: '0 32px 100px rgba(0,0,0,0.7), 0 0 80px rgba(239,68,68,0.05)',
        }}
      >
        {/* Logo ring */}
        <div className="relative mb-8" style={{ width: 110, height: 110 }}>
          {/* outer spinning dashed ring */}
          <div style={{
            position: 'absolute', inset: -8, borderRadius: '50%',
            border: '1.5px dashed rgba(239,68,68,0.35)',
            animation: 'spin 14s linear infinite',
          }} />
          {/* glowing circle frame */}
          <div style={{
            width: 110, height: 110, borderRadius: '50%',
            border: '2.5px solid rgba(239,68,68,0.55)',
            boxShadow: '0 0 36px rgba(239,68,68,0.40), inset 0 0 24px rgba(239,68,68,0.06)',
            overflow: 'hidden',
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img
              src="/logo.jpg"
              alt="ArcadiaX"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
                filter: 'drop-shadow(0 0 12px rgba(239,68,68,0.5))',
              }}
            />
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 28, fontWeight: 900, color: '#EF4444',
          letterSpacing: '-0.5px', marginBottom: 10, lineHeight: 1.1,
        }}>
          Welcome to ArcadiaX
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 15, color: '#7a7a9a', lineHeight: 1.65,
          marginBottom: 36, maxWidth: 320,
        }}>
          Login to access your dashboard and manage your servers with premium tools.
        </p>

        {authError && (
          <div style={{
            width: '100%', marginBottom: 24, padding: '12px 16px',
            borderRadius: 10, fontSize: 14, textAlign: 'left',
            background: 'rgba(239,68,68,0.10)',
            border: '1px solid rgba(239,68,68,0.30)',
            color: '#EF4444',
          }}>
            {authError === 'unauthorized'
              ? 'You are not authorized to access this dashboard.'
              : `Authentication error: ${authError}`}
          </div>
        )}

        {/* Discord button */}
        <button
          onClick={handleLogin}
          style={{
            width: '100%', padding: '14px 24px',
            borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #EF4444 0%, #C53030 100%)',
            boxShadow: '0 6px 28px rgba(239,68,68,0.45)',
            color: '#fff', fontSize: 15, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 10px 36px rgba(239,68,68,0.55)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(239,68,68,0.45)'
          }}
        >
          <svg viewBox="0 0 71 55" fill="white" width="20" height="20" aria-hidden="true">
            <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.44077 45.4204 0.52529C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.52529C25.5141 0.44359 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978Z" />
          </svg>
          Login with Discord
        </button>

        {/* Fine print */}
        <p style={{ fontSize: 13, color: '#4a4a62', marginTop: 24, lineHeight: 1.6 }}>
          By logging in, you agree to our{' '}
          <a href="#" style={{ color: '#7a7a9a', textDecoration: 'underline', textUnderlineOffset: 3 }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#7a7a9a'}>
            Terms of Service
          </a>
          {' '}and{' '}
          <a href="#" style={{ color: '#7a7a9a', textDecoration: 'underline', textUnderlineOffset: 3 }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#7a7a9a'}>
            Privacy Policy
          </a>.
        </p>
      </div>
    </div>
  )
}
