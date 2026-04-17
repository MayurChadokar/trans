import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Truck, User, MapPin, Phone, Loader2, CheckCircle2, ArrowRight, FileText, Image, Files, CreditCard, Shield, Info, Check, Building2, PenTool } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/trans-logo.png'
import { uploadSingleFile } from '../../api/uploadApi'

function Field({ label, error, children, required, sublabel }) {
  return (
    <div className="form-group" style={{ marginBottom: 8 }}>
      {label && (
        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 650, color: '#374151', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          {label} {required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
          {sublabel && <span style={{ fontSize: '0.62rem', color: '#94A3B8', fontWeight: 500 }}>({sublabel})</span>}
        </label>
      )}
      {children}
      {error && <span className="form-error" style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
        <Info size={11} /> {error.message}
      </span>}
    </div>
  )
}

function DocUploadField({ label, icon: Icon, register, name, required }) {
  const [hasFile, setHasFile] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <label style={{ 
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', 
        border: '1.5px dashed #E2E8F0', borderRadius: '14px', background: '#F8FAFC',
        cursor: 'pointer', transition: 'all 0.2s', borderStyle: hasFile ? 'solid' : 'dashed',
        borderColor: hasFile ? '#16A34A' : '#E2E8F0',
        backgroundColor: hasFile ? '#F0FDF4' : '#F8FAFC',
        minHeight: 44
      }} className="hover:border-purple-300 hover:bg-purple-50">
        <div style={{ 
          width: 32, height: 32, borderRadius: 10, background: 'white', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          color: hasFile ? '#16A34A' : '#7C3AED',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          flexShrink: 0
        }}>
          {hasFile ? <Check size={16} /> : <Icon size={16} />}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
          <div style={{ fontSize: '0.6rem', color: hasFile ? '#16A34A' : '#94A3B8', fontWeight: 600 }}>
            {hasFile ? 'File selected' : 'Upload proof'}
          </div>
        </div>

        <input 
          type="file" 
          {...register(name, { 
            required: required && `${label} is required`,
            onChange: (e) => setHasFile(e.target.files.length > 0)
          })}
          style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer' }} 
        />
      </label>
    </div>
  )
}

export default function TransportRegistration() {
  const { user, completeTransportSetup, isTransport } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (user?.setupComplete && isTransport) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, isTransport, navigate])

  const { register, handleSubmit, formState: { errors }, trigger } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: user?.name || '',
      businessName: '',
      phone: user?.phone || '',
      address: '',
      aadharNo: '',
      panNo: '',
      bankAccNo: '',
      bankIfsc: '',
      bankName: '',
    }
  })

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await trigger(['name', 'phone', 'address', 'businessName']);
      if (isValid) setStep(2);
    } else if (step === 2) {
      const isValid = await trigger(['aadharNo', 'panNo', 'bankAccNo', 'bankIfsc', 'bankName']);
      if (isValid) setStep(3);
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const folder = `trans/users/${user?.phone || 'unknown'}/transport`
      const [
        signatureUpload,
        logoUpload,
        aadharUpload,
        panUpload,
      ] = await Promise.all([
        uploadSingleFile(data.docSignature?.[0], { folder }),
        uploadSingleFile(data.docLogo?.[0], { folder }),
        uploadSingleFile(data.docAadhar?.[0], { folder }),
        uploadSingleFile(data.docPan?.[0], { folder }),
      ])

      const signatureUrl = signatureUpload?.url || null
      const logoUrl = logoUpload?.url || null
      const documents = {
        aadharUrl: aadharUpload?.url || null,
        panUrl: panUpload?.url || null,
      }

      // Nest bank details to match profile schema
      const formattedData = {
        ...data,
        signatureUrl,
        logoUrl,
        documents,
        bankDetails: {
          accountName: data.name,
          accountNumber: data.bankAccNo,
          ifsc: data.bankIfsc?.toUpperCase(),
          bankName: data.bankName
        }
      }
      delete formattedData.bankAccNo
      delete formattedData.bankIfsc
      delete formattedData.bankName
      delete formattedData.docAadhar
      delete formattedData.docPan
      delete formattedData.docSignature
      delete formattedData.docLogo

      const res = await completeTransportSetup(formattedData)
      if (res.success) {
        navigate('/setup/vehicles', { replace: true })
      } else {
        setLoading(false)
        alert(res.message || 'Setup failed. Please try again.')
      }
    } catch (error) {
      setLoading(false)
      console.error('Registration error:', error)
      const errMs = error?.response?.data?.message || error?.message || 'Check your internet connection and file sizes.'
      alert(`Registration Failed: ${errMs}`)
    }
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 20 }}>
      {/* Header Info */}
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div style={{ 
          width: 50, height: 50, borderRadius: 16, background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)', position: 'relative'
        }}>
          <img src={logo} alt="Logo" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
          <div style={{ position: 'absolute', bottom: -3, right: -3, width: 18, height: 18, borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '2px solid white' }}>
            <Check size={9} strokeWidth={4} />
          </div>
        </div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 1 }}>
          Setup Your Transport
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{ height: 4, width: 28, borderRadius: 2, background: step >= 1 ? '#7C3AED' : '#E2E8F0', transition: 'all 0.3s' }} />
          <div style={{ height: 4, width: 28, borderRadius: 2, background: step >= 2 ? '#7C3AED' : '#E2E8F0', transition: 'all 0.3s' }} />
          <div style={{ height: 4, width: 28, borderRadius: 2, background: step >= 3 ? '#7C3AED' : '#E2E8F0', transition: 'all 0.3s' }} />
        </div>
        <p style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, margin: 0 }}>
           {step === 1 && 'Basic business information'}
           {step === 2 && 'KYC & Bank details'}
           {step === 3 && 'Upload required documents'}
        </p>
        <button 
          type="button"
          onClick={() => logout()}
          style={{ 
            background: 'none', border: 'none', color: '#7C3AED', fontSize: '0.7rem', 
            fontWeight: 700, marginTop: 4, cursor: 'pointer', textDecoration: 'underline' 
          }}
        >
          Logout & Start Over
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ background: 'white', padding: '12px 16px', borderRadius: 24, border: '1px solid #F1F5F9', boxShadow: '0 15px 40px rgba(0,0,0,0.03)', margin: '0 10px' }}>
        
        {step === 1 && (
          <div className="animate-fadeIn">
            {/* Step 1: Basic Info */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                 <div style={{ width: 4, height: 12, background: '#7C3AED', borderRadius: 2 }} />
                 <span style={{ fontSize: '0.75rem', fontWeight: 850, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Basic Information</span>
              </div>

              <div className="grid sm-grid-cols-2 gap-2">
                <Field label="Owner Name" error={errors.name} required>
                  <div className="input-group">
                    <span className="input-prefix"><User size={14} /></span>
                    <input 
                      {...register('name', { 
                        required: 'Owner name is required',
                        pattern: { value: /^[A-Z][a-z]+(\s[A-Z][a-z]+)+$/, message: 'Please enter full name (First Last)' }
                      })} 
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '').replace(/\b\w/g, c => c.toUpperCase());
                      }}
                      placeholder="Full Name" 
                      className="form-input" 
                      style={{ borderRadius: 9, height: 38, fontSize: '0.8125rem' }} 
                    />
                  </div>
                </Field>
                
                <Field label="Contact Number" error={errors.phone} required>
                  <div className="input-group">
                    <span className="input-prefix"><Phone size={14} /></span>
                    <input {...register('phone', { required: 'Phone is required' })} placeholder="Phone Number" className="form-input" readOnly style={{ borderRadius: 9, height: 38, fontSize: '0.8125rem', background: '#F8FAFC' }} />
                  </div>
                </Field>

                <Field label="Transport Name" error={errors.businessName} required sublabel="Trade Name">
                  <div className="input-group">
                    <span className="input-prefix"><Truck size={14} /></span>
                    <input 
                      {...register('businessName', { 
                        required: 'Business name is required',
                        minLength: { value: 3, message: 'Minimum 3 characters required' }
                      })} 
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/\b\w/g, c => c.toUpperCase());
                      }}
                      placeholder="e.g. Radhe Logistics" 
                      className="form-input" 
                      style={{ borderRadius: 9, height: 38, fontSize: '0.8125rem' }} 
                    />
                  </div>
                </Field>
              </div>

              <Field label="Office Address" error={errors.address} required>
                <div className="input-group">
                  <span className="input-prefix" style={{ top: 10, transform: 'none' }}><MapPin size={14} /></span>
                  <textarea {...register('address', { required: 'Address is required' })} placeholder="Complete Office Address" className="form-input" style={{ minHeight: 50, paddingTop: 6, borderRadius: 9, fontSize: '0.8125rem' }} />
                </div>
              </Field>
            </div>

            <button type="button" onClick={handleNext} className="btn btn-primary btn-lg btn-full" style={{ borderRadius: 16, height: 48, fontSize: '0.875rem', fontWeight: 800 }}>
              Next Step <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeIn">
            {/* Step 2: KYC & Bank */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                 <div style={{ width: 4, height: 12, background: '#7C3AED', borderRadius: 2 }} />
                 <span style={{ fontSize: '0.75rem', fontWeight: 850, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>KYC & Bank Details</span>
              </div>

              <div className="grid sm-grid-cols-2 gap-2">
                <Field label="Aadhar Number" error={errors.aadharNo} required>
                  <div className="input-group">
                    <span className="input-prefix"><Shield size={14} /></span>
                    <input {...register('aadharNo', { 
                      required: 'Aadhar No is required',
                      pattern: { value: /^[0-9]{12}$/, message: 'Invalid Aadhar (12 digits)' }
                    })} 
                    onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 12)}
                    placeholder="1234 5678 9012" className="form-input" style={{ borderRadius: 9, height: 38, fontSize: '0.8125rem' }} />
                  </div>
                </Field>

                <Field label="PAN Number" error={errors.panNo} required>
                  <div className="input-group">
                    <span className="input-prefix"><FileText size={14} /></span>
                    <input {...register('panNo', { 
                      required: 'PAN is required',
                      pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, message: 'Invalid PAN' }
                    })} 
                    onInput={(e) => {
                      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
                    }}
                    placeholder="ABCDE1234F" className="form-input" style={{ borderRadius: 9, height: 38, fontSize: '0.8125rem', textTransform: 'uppercase' }} />
                  </div>
                </Field>

                <Field label="Bank Account No" error={errors.bankAccNo} required>
                  <div className="input-group">
                    <span className="input-prefix"><CreditCard size={14} /></span>
                    <input {...register('bankAccNo', { 
                      required: 'Account no is required',
                      pattern: { value: /^[0-9]{9,18}$/, message: 'Invalid length (9-18 digits)' }
                    })} 
                    onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 18)}
                    placeholder="Account Number" className="form-input" style={{ borderRadius: 9, height: 38, fontSize: '0.8125rem' }} />
                  </div>
                </Field>

                <Field label="IFSC Code" error={errors.bankIfsc} required>
                  <div className="input-group">
                    <span className="input-prefix"><Building2 size={14} /></span>
                    <input {...register('bankIfsc', { 
                      required: 'IFSC is required',
                      pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/i, message: 'Invalid IFSC' }
                    })} 
                    onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                    placeholder="Bank IFSC" className="form-input" style={{ borderRadius: 9, height: 38, fontSize: '0.8125rem', textTransform: 'uppercase' }} />
                  </div>
                </Field>

                <Field label="Bank Name" error={errors.bankName} required>
                  <div className="input-group">
                    <span className="input-prefix"><Building2 size={14} /></span>
                    <input {...register('bankName', { required: 'Bank name is required' })} 
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/\b\w/g, c => c.toUpperCase());
                    }}
                    placeholder="e.g. State Bank of India" className="form-input" style={{ borderRadius: 9, height: 38, fontSize: '0.8125rem' }} />
                  </div>
                </Field>
              </div>
            </div>

            <div className="btn-group btn-group-mobile-row" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="btn" 
                style={{ flex: 1, height: 48, borderRadius: 16, fontSize: '0.875rem', fontWeight: 600, background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B' }}
              >
                Back
              </button>
              <button 
                type="button" 
                onClick={handleNext} 
                className="btn btn-primary" 
                style={{ flex: 2, height: 48, borderRadius: 16, fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                Next Step <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fadeIn">
            {/* Step 3: Document Proofs */}
            <div style={{ marginBottom: 12, padding: '12px 14px', background: '#F1F5F9', borderRadius: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                 <Files size={14} color="#7C3AED" />
                 <span style={{ fontSize: '0.75rem', fontWeight: 850, color: '#1E293B' }}>Required Documents</span>
              </div>

              <div className="grid sm-grid-cols-2 gap-2">
                <DocUploadField label="Aadhar Card" icon={FileText} register={register} name="docAadhar" required />
                <DocUploadField label="PAN Card" icon={FileText} register={register} name="docPan" required />
                <DocUploadField label="Business Logo" icon={Image} register={register} name="docLogo" required />
                <DocUploadField label="Authorized Signature" icon={PenTool} register={register} name="docSignature" required />
              </div>
            </div>

            <div className="btn-group btn-group-mobile-row" style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
              <button 
                type="button" 
                onClick={() => setStep(2)} 
                className="btn" 
                style={{ flex: 1, height: 48, borderRadius: 16, fontSize: '0.875rem', fontWeight: 600, background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B' }}
              >
                Back
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading} 
                style={{ flex: 2, height: 48, borderRadius: 16, fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? <Loader2 size={18} className="spin" /> : <>Setup Business <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>
        )}
      </form>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; } 
        @keyframes spin { to { transform: rotate(360deg); } }
        .hover\\:border-purple-300:hover { border-color: #C4B5FD !important; }
        .hover\\:bg-purple-50:hover { background-color: #F5F3FF !important; }
        
        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out forwards;
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
