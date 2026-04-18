import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, Loader2, AlertCircle, RefreshCw, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const OTP_LENGTH = 6
const RESEND_TIMEOUT = 30

export default function OTPVerify() {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [timer, setTimer] = useState(RESEND_TIMEOUT)
  const [resending, setResending] = useState(false)
  const [localError, setLocalError] = useState('')
  const inputRefs = useRef([])
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyOTP, sendOTP, verifying, error } = useAuth()

  const phone = location.state?.phone || localStorage.getItem('temp_login_phone') || ''

  // If no phone, redirect to login
  useEffect(() => {
    if (!phone) navigate('/login', { replace: true })
  }, [phone, navigate])

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return
    const id = setInterval(() => setTimer(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [timer])

  // Focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    setLocalError('')
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    // Auto-submit when all filled
    if (digit && index === OTP_LENGTH - 1) {
      const fullOtp = [...newOtp.slice(0, OTP_LENGTH - 1), digit].join('')
      if (fullOtp.length === OTP_LENGTH) handleVerify(fullOtp)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
        inputRefs.current[index - 1]?.focus()
      } else {
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    e.preventDefault()
    const newOtp = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((d, i) => { if (i < OTP_LENGTH) newOtp[i] = d })
    setOtp(newOtp)
    const lastIdx = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[lastIdx]?.focus()
    if (pasted.length === OTP_LENGTH) handleVerify(pasted)
  }

  const handleVerify = useCallback(async (otpStr) => {
    const code = otpStr || otp.join('')
    if (code.length < OTP_LENGTH) {
      setLocalError(`Please enter the ${OTP_LENGTH}-digit OTP`)
      return
    }
    const res = await verifyOTP(phone, code)
    if (res.success) {
      navigate('/language-select', { replace: true })
    }
  }, [otp, phone, verifyOTP, navigate])

  const handleResend = async () => {
    setResending(true)
    setOtp(Array(OTP_LENGTH).fill(''))
    setLocalError('')
    inputRefs.current[0]?.focus()
    await sendOTP(phone)
    setTimer(RESEND_TIMEOUT)
    setResending(false)
  }

  const displayPhone = phone
    ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
    : ''

  const displayError = localError || error

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 440, margin: '0 auto', paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ 
          width: 60, height: 60, borderRadius: 20, background: '#F5F3FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px',
          boxShadow: '0 8px 30px rgba(124, 58, 237, 0.1)', position: 'relative'
        }}>
          <ShieldCheck size={28} color="#7C3AED" strokeWidth={2.5} />
          <div style={{ 
            position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, 
            borderRadius: '50%', background: '#7C3AED', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', color: 'white', border: '3px solid white' 
          }}>
            <Check size={12} strokeWidth={4} />
          </div>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 6 }}>
          Verify OTP
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>
          We sent a 6-digit code to<br />
          <strong style={{ color: '#1E293B', fontSize: '0.9375rem' }}>{displayPhone}</strong>
        </p>
      </div>

      {/* Form Card */}
      <div style={{ 
        background: 'white', padding: '24px 20px', borderRadius: 28, 
        border: '1px solid #F1F5F9', boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
        margin: '0 10px'
      }}>
        {/* OTP Boxes */}
        <div className="form-group" style={{ marginBottom: 24 }}>
          <div className="otp-grid" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                id={`otp-box-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`otp-input ${digit ? 'filled' : ''}`}
                style={{
                  background: digit ? '#F5F3FF' : 'white',
                  borderColor: digit ? '#7C3AED' : (displayError ? '#FECACA' : '#F1F5F9'),
                }}
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
              />
            ))}
          </div>

          {displayError && (
            <div className="form-error" style={{ justifyContent: 'center', marginTop: 16, color: '#DC2626', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={14} /> {displayError}
            </div>
          )}
        </div>

        {/* Verify Button */}
        <button
          id="btn-verify-otp"
          className="btn btn-primary btn-lg btn-full"
          onClick={() => handleVerify()}
          disabled={verifying || otp.join('').length < OTP_LENGTH}
          style={{ height: 56, borderRadius: 16, fontSize: '0.95rem', fontWeight: 800, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)' }}
        >
          {verifying ? (
            <><Loader2 size={20} className="spin" /> Verifying...</>
          ) : (
            'Verify & Continue'
          )}
        </button>

        {/* Actions */}
        <div className="otp-actions" style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginTop: 24, gap: 10
        }}>
          <button
            id="btn-change-number"
            onClick={() => {
              localStorage.removeItem('temp_login_phone');
              navigate('/login');
            }}
            className="btn btn-ghost"
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
              fontSize: '0.85rem', fontWeight: 700, color: '#64748B', border: '1px solid #F1F5F9', borderRadius: 12,
              whiteSpace: 'nowrap'
            }}
          >
            <ArrowLeft size={16} /> <span className="hide-xs">Change Number</span><span className="show-xs">Back</span>
          </button>

          {timer > 0 ? (
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Resend in <span style={{ color: '#7C3AED' }}>{timer}s</span>
            </div>
          ) : (
            <button
              id="btn-resend-otp"
              onClick={handleResend}
              disabled={resending}
              className="btn btn-ghost"
              style={{ 
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
                fontSize: '0.85rem', fontWeight: 700, color: '#7C3AED', border: '1px solid #EDE9FE', borderRadius: 12,
                whiteSpace: 'nowrap'
              }}
            >
              <RefreshCw size={16} className={resending ? 'spin' : ''} />
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .otp-grid {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .otp-input {
          width: 54px;
          height: 64px;
          border-radius: 16px;
          border: 2px solid #F1F5F9;
          text-align: center;
          font-size: 1.6rem;
          font-weight: 800;
          outline: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: #0F172A;
          -webkit-appearance: none;
        }

        .otp-input:focus { 
          border-color: #7C3AED !important; 
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1) !important;
          background: #F5F3FF !important;
          transform: translateY(-2px);
        }

        .show-xs { display: none; }

        @media (max-width: 480px) {
          .otp-grid { gap: 8px; }
          .otp-input {
            width: 45px;
            height: 56px;
            font-size: 1.4rem;
            border-radius: 12px;
          }
        }

        @media (max-width: 380px) {
          .otp-grid { gap: 6px; }
          .otp-input {
            width: 40px;
            height: 52px;
            font-size: 1.25rem;
            border-radius: 10px;
          }
          .hide-xs { display: none; }
          .show-xs { display: inline; }
        }
      `}</style>
    </div>
  )
}
