import React, { useState } from 'react'
import { ArrowLeft, Download, Share2, Copy, Building2, Smartphone, Edit3, Save, X, Upload, Loader2, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { uploadSingleFile } from '../../api/uploadApi'

export default function QRCode() {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [upiId, setUpiId] = useState(user?.bankDetails?.upiId || '')
  const [qrFile, setQrFile] = useState(null)
  const [preview, setPreview] = useState(user?.bankDetails?.qrUrl || null)

  const business = user || {}
  const currentUpiId = business.bankDetails?.upiId || 'yourname@upi'
  const upiUrl = `upi://pay?pa=${currentUpiId}&pn=${encodeURIComponent(business.businessName || 'Business Owner')}&cu=INR`
  const displayQr = business.bankDetails?.qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`

  const copyUpi = () => {
    navigator.clipboard.writeText(currentUpiId)
    alert('UPI ID copied to clipboard')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setQrFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      let qrUrl = user?.bankDetails?.qrUrl || null
      if (qrFile) {
        const folder = `trans/users/${user?.phone || 'unknown'}/qr`
        const res = await uploadSingleFile(qrFile, { folder })
        if (res?.url) qrUrl = res.url
      }

      const updatedData = {
        bankDetails: {
          ...user?.bankDetails,
          upiId: upiId,
          qrUrl: qrUrl
        }
      }

      const res = await updateProfile(updatedData)
      if (res.success) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setIsEditing(false)
        }, 1500)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to update QR settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} className="btn-icon">
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Payment Settings</h2>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', 
              borderRadius: 12, border: 'none', background: '#F1F5F9', 
              color: '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' 
            }}
          >
            <Edit3 size={16} /> Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px 24px', position: 'relative', overflow: 'hidden' }}>
          {/* Glow bg */}
          <div style={{ position: 'absolute', top: -100, left: -100, width: 250, height: 250, background: 'radial-gradient(circle, var(--primary-lighter) 0%, transparent 70%)', opacity: 0.5 }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="avatar avatar-lg" style={{ width: 64, height: 64, margin: '0 auto 16px', fontSize: '1.25rem', background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)', color: 'white', fontWeight: 900 }}>
              {business.businessName ? business.businessName[0] : 'BP'}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: 4, color: '#1E293B' }}>{business.businessName || 'Your Business'}</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600, marginBottom: 24 }}>Scan to pay via any UPI App</p>

            {/* QR FRAME */}
            <div style={{ 
              background: 'white', padding: 20, borderRadius: 28, margin: '0 auto 24px', width: 240, height: 240,
              boxShadow: '0 20px 50px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', border: '1px solid #F1F5F9'
            }}>
              <img 
                src={displayQr}
                alt="QR Code"
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }}
              />
              {!business.bankDetails?.qrUrl && (
                <div style={{ 
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
                  width: 44, height: 44, background: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '2px solid #F8FAFC'
                }}>
                  <Building2 size={24} color="#7C3AED" />
                </div>
              )}
            </div>

            <div style={{ 
              background: '#F8FAFC', borderRadius: 20, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 32, border: '1.5px dashed #E2E8F0'
            }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Current UPI ID</p>
                <p style={{ fontSize: '1rem', fontWeight: 750, color: '#1E293B', margin: '2px 0 0' }}>{currentUpiId}</p>
              </div>
              <button onClick={copyUpi} className="btn-icon" style={{ width: 36, height: 36, borderRadius: 10, background: 'white', border: '1px solid #E2E8F0', color: '#64748B' }}>
                <Copy size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <button 
                className="btn btn-primary" 
                style={{ height: 48, borderRadius: 16, fontWeight: 800, fontSize: '0.9rem' }}
                onClick={() => window.open(displayQr, '_blank')}
              >
                <Download size={18} /> Save QR
              </button>
              <button className="btn btn-ghost" style={{ height: 48, borderRadius: 16, fontWeight: 700, fontSize: '0.9rem', background: '#F1F5F9', border: 'none', color: '#475569' }}>
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card animate-scaleIn" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
             <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>Update Payment Info</h3>
             <button onClick={() => setIsEditing(false)} className="btn-icon" style={{ background: '#FEE2E2', color: '#EF4444' }}>
                <X size={18} />
             </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* UPI ID Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 850, color: '#475569', marginBottom: 8, textTransform: 'uppercase' }}>
                UPI ID (Virtual Payment Address)
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                  <Smartphone size={18} />
                </div>
                <input 
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. business@okaxis"
                  style={{ 
                    width: '100%', padding: '12px 16px 12px 42px', borderRadius: 14, 
                    border: '2px solid #F1F5F9', background: '#F8FAFC', fontSize: '0.95rem', fontWeight: 600,
                    outline: 'none', transition: '0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#7C3AED'}
                  onBlur={(e) => e.target.style.borderColor = '#F1F5F9'}
                />
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>Default QR will be generated automatically for this ID.</p>
            </div>

            {/* Custom QR Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 850, color: '#475569', marginBottom: 12, textTransform: 'uppercase' }}>
                Custom QR Image (Optional)
              </label>
              <label style={{ 
                display: 'block', width: '100%', minHeight: 180, borderRadius: 20, 
                border: '2px dashed #E2E8F0', background: '#F8FAFC', cursor: 'pointer',
                position: 'relative', overflow: 'hidden', transition: '0.2s'
              }} className="hover:bg-slate-50">
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                {preview ? (
                  <div style={{ width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                    <img src={preview} alt="Preview" style={{ height: '100%', objectFit: 'contain', borderRadius: 8 }} />
                    <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700 }}>Change Image</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, gap: 10, color: '#94A3B8' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <Upload size={20} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#64748B' }}>Upload QR Screenshot</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.65rem' }}>Supports JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            <button 
              onClick={handleSave} 
              disabled={loading || success}
              style={{ 
                width: '100%', height: 52, borderRadius: 16, background: success ? '#16A34A' : '#7C3AED', 
                color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 10px 20px rgba(124, 58, 237, 0.2)', transition: '0.3s'
              }}
            >
              {loading ? <Loader2 className="spin" size={20} /> : 
               success ? <><CheckCircle2 size={20} /> Settings Saved</> : 
               <><Save size={20} /> Save Changes</>}
            </button>
          </div>
        </div>
      )}

      {/* Info Footer */}
      {!isEditing && (
        <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 20, background: '#EFF6FF', border: '1px solid #DBEAFE', display: 'flex', gap: 12 }}>
          <Smartphone size={20} color="#3B82F6" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E40AF', margin: 0 }}>Quick Tip</p>
            <p style={{ fontSize: '0.75rem', color: '#2563EB', margin: '2px 0 0', lineHeight: 1.4 }}>
              Ensure your UPI ID is correct to receive payments directly to your bank account without any platform fees.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

