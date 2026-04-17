import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Languages, CheckCircle2, ArrowRight, Loader2, Globe } from 'lucide-react'
import logo from '../../assets/trans-logo.png'
import i18n from '../../i18n/i18n'
import { useAuth } from '../../context/AuthContext'

const languages = [
  {
    id: 'en',
    label: 'English',
    labelHi: 'अंग्रेजी',
    desc: 'Continue in English',
    icon: '🇺🇸',
  },
  {
    id: 'hi',
    label: 'हिन्दी',
    labelHi: 'Hindi',
    desc: 'हिन्दी में जारी रखें',
    icon: '🇮🇳',
  },
]

export default function LanguageSelect() {
  const [selected, setSelected] = useState(() => localStorage.getItem('app_lang') || 'en')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const handleContinue = async () => {
    setLoading(true)
    localStorage.setItem('app_lang', selected)
    i18n.changeLanguage(selected)
    
    // Small delay for smooth transition
    await new Promise(r => setTimeout(r, 600))
    
    if (isAuthenticated) {
      if (!user?.role) {
        navigate('/role-select', { replace: true })
      } else if (!user?.setupComplete) {
        navigate(`/register/${user.role}`, { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } else {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 440, margin: '0 auto', paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <div style={{ 
          width: 60, height: 60, borderRadius: 20, background: '#F5F3FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px',
          boxShadow: '0 8px 30px rgba(124, 58, 237, 0.1)'
        }}>
          <Globe size={28} color="#7C3AED" strokeWidth={2.5} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 6 }}>
          Preferred Language
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>
          Please select your communication language.<br />
          कृपया अपनी संचार भाषा चुनें।
        </p>
      </div>

      {/* Language Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '0 10px' }}>
        {languages.map((lang, idx) => (
          <button
            key={lang.id}
            onClick={() => setSelected(lang.id)}
            style={{
              padding: '20px',
              borderRadius: '24px',
              background: 'white',
              border: '2px solid',
              borderColor: selected === lang.id ? '#7C3AED' : '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: selected === lang.id ? '0 12px 30px rgba(124, 58, 237, 0.1)' : '0 4px 12px rgba(0,0,0,0.02)',
              transform: selected === lang.id ? 'scale(1.02)' : 'scale(1)',
              width: '100%'
            }}
          >
            <div style={{ 
              width: 50, height: 50, borderRadius: 16, background: selected === lang.id ? '#F5F3FF' : '#F8FAFC',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}>
              {lang.icon}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.0625rem', fontWeight: 900, color: '#1E293B' }}>{lang.label}</span>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>({lang.labelHi})</span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>{lang.desc}</p>
            </div>

            {selected === lang.id && (
              <div style={{ color: '#7C3AED' }}>
                <CheckCircle2 size={24} fill="#7C3AED" color="white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Continue Button */}
      <div style={{ marginTop: 32, padding: '0 10px' }}>
        <button
          onClick={handleContinue}
          disabled={loading}
          style={{ 
            width: '100%', height: 56, borderRadius: 18, background: '#7C3AED',
            color: 'white', fontSize: '0.95rem', fontWeight: 800, border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 10px 25px rgba(124, 58, 237, 0.25)', transition: 'all 0.2s'
          }}
        >
          {loading ? (
            <><Loader2 size={20} className="spin" /> Setting Language...</>
          ) : (
            <>Continue / जारी रखें <ArrowRight size={20} /></>
          )}
        </button>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .btn:active { transform: scale(0.97); }
      `}</style>
    </div>
  )
}
