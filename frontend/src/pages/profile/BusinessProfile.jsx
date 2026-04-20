import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Building2, Phone, MapPin, FileText, CreditCard,
  Loader2, CheckCircle2, ArrowLeft, ChevronDown, Camera, PenTool, Type
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/trans-logo.png'
import { uploadSingleFile } from '../../api/uploadApi'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','J&K','Ladakh','Puducherry',
]

function Field({ label, error, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <span className="form-error">{error.message}</span>}
    </div>
  )
}

export default function BusinessProfile() {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [logoPreview, setLogoPreview] = useState(user?.logoUrl || null)
  const [signPreview, setSignPreview] = useState(user?.signatureUrl || null)
  const [logoFile, setLogoFile] = useState(null)
  const [signFile, setSignFile] = useState(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: user?.name || '',
      businessName: user?.businessName || '',
      slogan: user?.slogan || 'Move What Matters',
      phone: user?.phone || '',
      email: user?.email || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
      gstin: user?.gstin || '',
      panNo: user?.panNo || '',
      alternatePhone: user?.alternatePhone || '',
    }
  })

  useEffect(() => {
    if (user?.logoUrl) setLogoPreview(user.logoUrl)
    if (user?.signatureUrl) setSignPreview(user.signatureUrl)
  }, [user?.logoUrl, user?.signatureUrl])

  const dataUrlToFile = async (dataUrl, filename = 'image.png') => {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    return new File([blob], filename, { type: blob.type || 'application/octet-stream' })
  }

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      
      // Append text fields
      // Append text fields
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null && key !== 'id') {
          if (typeof data[key] === 'object' && !(data[key] instanceof File) && !(data[key] instanceof FileList)) {
             formData.append(key, JSON.stringify(data[key]))
          } else {
             formData.append(key, data[key])
          }
        }
      })

      // Append files if selected
      if (logoFile) formData.append('logo', logoFile)
      if (signFile) formData.append('signature', signFile)

      const res = await updateProfile(formData)
      
      if (res.success) {
        setSaved(true)
        setTimeout(() => { 
          setSaved(false)
          navigate('/profile') 
        }, 1200)
      } else {
        alert(res.message || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Profile update failed:', err)
      alert('Error updating profile. Please try again.')
    }
  }

  const handleImage = (e, setter) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setter(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleLogoPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    handleImage(e, setLogoPreview)
  }

  const handleSignPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSignFile(file)
    handleImage(e, setSignPreview)
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 60 }}>

      {/* Back header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate('/profile')} style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: 'rgba(0,0,0,0.06)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280'
        }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F0D2E', margin: 0 }}>Business Profile</h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>Configure your professional identity</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Branding Assets */}
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
           {/* Logo */}
           <div style={{ background: 'white', borderRadius: 24, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 12px' }}>
                 {logoPreview ? (
                   <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', borderRadius: 16, objectFit: 'contain', background: '#F9FAFB' }} />
                 ) : (
                   <div style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={logo} alt="Logo Fallback" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   </div>
                 )}
                 <label htmlFor="logo-upload" style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: '50%', background: '#7C3AED', cursor: 'pointer', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                   <Camera size={14} color="white" />
                   <input id="logo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoPick} />
                 </label>
              </div>
              <p style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F0D2E', margin: 0 }}>Business Logo</p>
           </div>

           {/* Signature */}
           <div style={{ background: 'white', borderRadius: 24, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 12px' }}>
                 {signPreview ? (
                   <img src={signPreview} alt="Sign" style={{ width: '100%', height: '100%', borderRadius: 16, objectFit: 'contain', background: '#F9FAFB' }} />
                 ) : (
                   <div style={{ width: '100%', height: '100%', borderRadius: 16, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <PenTool size={32} color="#DC2626" />
                   </div>
                 )}
                 <label htmlFor="sign-upload" style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: '50%', background: '#DC2626', cursor: 'pointer', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                   <Camera size={14} color="white" />
                   <input id="sign-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSignPick} />
                 </label>
              </div>
              <p style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F0D2E', margin: 0 }}>Authorized Signature</p>
           </div>
        </div>

        {/* Business Details */}
        <div style={{ background: 'white', borderRadius: 24, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', marginBottom: 14, border: '1px solid rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} color="#7C3AED" />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0F0D2E', margin: 0 }}>Identity & Slogan</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1.5fr', gap: 12 }}>
              <Field label="Owner Name" error={errors.name} required>
                <input {...register('name', { required: 'Name required' })} placeholder="Full Name" className="form-input" />
              </Field>
              <Field label="Business Name" error={errors.businessName} required>
                <input {...register('businessName', { required: 'Business name required' })} placeholder="Official Name" className="form-input" />
              </Field>
            </div>
            <Field label="Business Slogan / Tagline (Shown on top of Bill)">
               <div className="input-group">
                 <span className="input-prefix"><Type size={16} /></span>
                 <input {...register('slogan')} placeholder="e.g. Move What Matters" className="form-input" />
               </div>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: 12 }}>
              <Field label="Phone Number" error={errors.phone} required>
                <input type="tel" {...register('phone', { required: 'Phone required' })} placeholder="98765 43210" className="form-input" inputMode="numeric" />
              </Field>
              <Field label="Alternate Mobile" error={errors.alternatePhone}>
                <input type="tel" {...register('alternatePhone')} placeholder="Alternate Mobile Number" className="form-input" inputMode="numeric" />
              </Field>
            </div>
            <Field label="Email Address">
              <input type="email" {...register('email')} placeholder="hello@company.com" className="form-input" />
            </Field>
          </div>
        </div>

        {/* Address & Taxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginBottom: 24 }}>
           <div style={{ background: 'white', borderRadius: 24, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={18} color="#2563EB" />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0F0D2E', margin: 0 }}>Location</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                 <Field label="Detailed Address">
                    <textarea {...register('address')} placeholder="B-107, Raj Sapphire, Vapi" className="form-input" style={{ minHeight: 60 }} />
                 </Field>
                 <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: 10 }}>
                    <Field label="City"><input {...register('city')} placeholder="Vapi" className="form-input" /></Field>
                    <Field label="Pincode"><input {...register('pincode')} placeholder="396191" className="form-input" maxLength={6} inputMode="numeric" /></Field>
                 </div>
              </div>
           </div>

           <div style={{ background: 'white', borderRadius: 24, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color="#D97706" />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0F0D2E', margin: 0 }}>Tax Info</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                 <Field label="PAN Card Number">
                    <input {...register('panNo')} placeholder="ABCDE1234F" className="form-input" style={{ textTransform: 'uppercase' }} maxLength={10} />
                 </Field>
                 <Field label="GSTIN (Optional)" error={errors.gstin}>
                    <input 
                      {...register('gstin', {
                        pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/i, message: 'Invalid GSTIN format' }
                      })} 
                      onInput={(e) => {
                        e.target.value = e.target.value.toUpperCase().replace(/\s/g, '').slice(0, 15);
                      }}
                      placeholder="24AAAAA0000A1Z5" 
                      className="form-input" 
                      maxLength={15} 
                    />
                 </Field>
              </div>
           </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: window.innerWidth < 640 ? 'column-reverse' : 'row', gap: 12 }}>
          <button type="button" className="btn btn-ghost btn-full" onClick={() => navigate('/profile')}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isSubmitting}>
            {isSubmitting
              ? <><Loader2 size={18} className="spin" /> Updating…</>
              : saved ? <><CheckCircle2 size={18} /> Profile Saved!</>
              : <><CheckCircle2 size={18} /> Update Profile</>}
          </button>
        </div>
      </form>

      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
