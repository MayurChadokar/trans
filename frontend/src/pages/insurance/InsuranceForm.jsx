import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, CheckCircle2, Shield, Phone, HelpCircle } from 'lucide-react'

export default function InsuranceForm() {
  const { type } = useParams()
  const navigate = useNavigate()
  const [vehicleNo, setVehicleNo] = useState('')
  const [loading, setLoading] = useState(false)

  const insuranceTitle = {
    bike: 'Bike Insurance',
    car: 'Car Insurance',
    truck: 'Truck/Fleet Insurance',
    health: 'Health Insurance',
    life: 'Life Insurance',
    travel: 'Travel Insurance',
  }[type] || 'Insurance Details'

  const handleFindPlans = () => {
    if (!vehicleNo) return alert('Please enter vehicle number')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('Thank you! Our insurance expert will call you shortly to discuss plans.')
      navigate('/dashboard')
    }, 1500)
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ background: '#F9FAFB', minHeight: '100vh', margin: window.innerWidth < 640 ? '-16px' : '0' }}>
      {/* Header */}
      <div style={{ background: '#4C1D95', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 14, color: 'white', cursor: 'pointer' }}>
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{insuranceTitle}</span>
        <HelpCircle size={20} style={{ marginLeft: 'auto', opacity: 0.8 }} />
      </div>

      {/* Main Content */}
      <div style={{ padding: window.innerWidth < 640 ? '16px 16px' : '24px 20px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111827', margin: 0 }}>Compare & save <br/> up to 95%*</h1>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#6B7280', fontWeight: 650 }}>
              <CheckCircle2 size={14} color="#F59E0B" /> Choose from 20+ Insurers!
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#6B7280', fontWeight: 650 }}>
              <CheckCircle2 size={14} color="#F59E0B" /> Get Expert Help with Claims
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div style={{ background: 'white', borderRadius: 28, padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#374151', marginBottom: 6 }}>
            {type === 'health' || type === 'life' ? 'Enter Mobile Number' : 'Enter vehicle number'}
          </h3>
          <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginBottom: 20 }}>Compare plans from multiple insurers</p>
          
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder={type === 'health' || type === 'life' ? 'e.g. 9876543210' : 'Eg. KA01KA1234'} 
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
              style={{ 
                width: '100%', 
                height: 58, 
                borderRadius: 18, 
                border: '1.5px solid #E5E7EB',
                padding: '0 20px',
                fontSize: '1rem',
                fontWeight: 700,
                outline: 'none',
                transition: 'border-color 0.2s',
                textTransform: 'uppercase'
              }}
              onFocus={e => e.target.style.borderColor = '#7C3AED'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          <button 
            onClick={handleFindPlans}
            style={{ 
              width: '100%', 
              height: 56, 
              background: '#7C3AED', 
              color: 'white', 
              border: 'none', 
              borderRadius: 18, 
              fontSize: '0.95rem', 
              fontWeight: 850, 
              marginTop: 20,
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {loading ? 'Processing...' : 'Find Plans'}
          </button>

          <p style={{ fontSize: '0.65rem', color: '#9CA3AF', textAlign: 'center', marginTop: 16, lineHeight: 1.4 }}>
            By proceeding, you allow us to call you to provide insurance assistance
          </p>
        </div>

        {/* Benefits Section */}
        <div style={{ marginTop: 24, background: '#EFF6FF', borderRadius: 24, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={22} color="#3B82F6" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E40AF' }}>10.2 Cr+ vehicles insured</div>
            <div style={{ fontSize: '0.65rem', color: '#60A5FA', fontWeight: 600 }}>Most trusted platform for fleet safety</div>
          </div>
        </div>

        {/* Brand Section */}
        <div style={{ marginTop: 24, background: '#2D2A5A', borderRadius: 28, padding: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, color: 'white' }}>Buying a brand new vehicle?</h4>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Save up to 95% on first year premium</p>
            <button style={{ background: 'none', border: 'none', color: '#C4B5FD', padding: 0, marginTop: 10, fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              Insure Now <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
          <Shield size={60} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', bottom: -10, right: 10 }} />
        </div>

      </div>
    </div>
  )
}
