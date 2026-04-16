import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { User, Mail, Phone, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

function Field({ label, error, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}</label>
      {children}
      {error && <span className="form-error">{error.message}</span>}
    </div>
  )
}

export default function UserProfile() {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }
  })

  const onSubmit = async (data) => {
    const res = await updateProfile(data)
    if (res.success) {
      setSaved(true)
      setTimeout(() => navigate('/profile'), 1500)
    }
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 540, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate('/profile')} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0F0D2E', margin: 0 }}>Personal Profile</h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>Manage your personal identity</p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px 20px' }}>
        {saved ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 color="#16A34A" size={28} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Profile Updated!</h3>
            <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: 4 }}>Your personal details have been saved.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Full Name" error={errors.name} required>
                <div className="input-group">
                  <span className="input-prefix"><User size={16} /></span>
                  <input {...register('name', { required: 'Name is required' })} placeholder="Your Full Name" className="form-input" />
                </div>
              </Field>

              <Field label="Email Address" error={errors.email}>
                <div className="input-group">
                  <span className="input-prefix"><Mail size={16} /></span>
                  <input {...register('email', { 
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                  })} placeholder="email@example.com" className="form-input" />
                </div>
              </Field>

              <Field label="Phone Number (Linked)">
                <div className="input-group">
                  <span className="input-prefix"><Phone size={16} /></span>
                  <input {...register('phone')} className="form-input" disabled style={{ background: '#F9FAFB' }} />
                </div>
                <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: 6 }}>Phone number cannot be changed as it is your identification.</p>
              </Field>

              <div style={{ marginTop: 10, display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-ghost btn-full" onClick={() => navigate('/profile')}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 size={18} className="spin" /> Saving…</> : 'Update Profile'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
