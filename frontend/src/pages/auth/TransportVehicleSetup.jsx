import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Truck, Plus, Loader2, ArrowRight, X, Info, CheckCircle2, Check, ChevronRight } from 'lucide-react'
import { useVehicles } from '../../context/VehicleContext'
import logo from '../../assets/trans-logo.png'

export default function TransportVehicleSetup() {
  const { addVehicle, vehicles } = useVehicles()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { vehicleNumber: '', vehicleType: 'Truck' }
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await addVehicle({ ...data, vehicleNumber: data.vehicleNumber.toUpperCase() })
      if (!res) {
        // addVehicle in VehicleContext doesn't return anything on error but logs it.
        // Let's assume the context handles the broad error, but we want to know why.
      }
      reset()
    } catch (e) {
      console.error('Add vehicle error:', e)
      const msg = e.response?.data?.message || 'Failed to add vehicle. Possibly already registered.'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header (Outside Card) */}
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <div style={{ 
          width: 50, height: 50, borderRadius: 16, background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
        }}>
          <img src={logo} alt="Logo" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.02em' }}>
          Step 4: Your Fleet
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>
          Add at least one vehicle to your transport business.
        </p>
      </div>

      <div style={{ 
        background: 'white', 
        borderRadius: 24, 
        padding: '30px', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ background: '#F8FAFC', borderRadius: 20, padding: 20, marginBottom: 20, border: '1px solid #E2E8F0' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
               <div className="form-group">
                 <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Vehicle Number</label>
                 <input 
                   {...register('vehicleNumber', { 
                     required: 'Required',
                     pattern: { value: /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i, message: 'Invalid format' }
                   })} 
                   placeholder="GJ15XX1234"
                   style={{ height: 50, borderRadius: 14, background: 'white' }}
                   className={`form-input ${errors.vehicleNumber ? 'error' : ''}`}
                 />
               </div>
               <div className="form-group">
                 <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>Type</label>
                 <select 
                   {...register('vehicleType')} 
                   style={{ height: 50, borderRadius: 14, background: 'white' }}
                   className="form-input"
                 >
                   <option>Tempo</option>
                   <option>Truck</option>
                   <option>Container</option>
                   <option>Tanker</option>
                   <option>Trailer</option>
                 </select>
               </div>
             </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: 56, height: 56, borderRadius: '50%', background: '#7C3AED', 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)', border: 'none', cursor: 'pointer'
              }}
            >
              {loading ? <Loader2 size={24} className="spin" /> : <Plus size={28} />}
            </button>
          </div>
        </form>

        {vehicles.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.02em' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }} />
              Ready Fleet ({vehicles.length})
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {vehicles.map(v => (
                <div key={v._id} style={{ 
                  background: '#F8FAFC', padding: '12px 14px', borderRadius: '16px', 
                  display: 'flex', flexDirection: 'column', gap: 4, border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Truck size={14} color="#7C3AED" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B', letterSpacing: '0.02em' }}>{v.vehicleNumber}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>{v.vehicleType || 'Truck'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {vehicles.length > 0 && (
          <button 
            onClick={() => navigate('/subscription')}
            style={{ 
              width: '100%', height: 56, borderRadius: 18, background: '#7C3AED',
              color: 'white', fontSize: '0.9375rem', fontWeight: 800, border: 'none',
              marginTop: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 10px 25px rgba(124, 58, 237, 0.25)', transition: 'all 0.2s'
            }}
            className="hover:scale-[1.02]"
          >
            Manage Plans for {vehicles.length} Vehicles <ChevronRight size={18} />
          </button>
        )}
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
