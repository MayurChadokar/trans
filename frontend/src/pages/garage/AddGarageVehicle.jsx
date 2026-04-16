import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Wrench, ArrowLeft, CheckCircle2, Loader2, ChevronDown } from 'lucide-react'
import { useVehicles } from '../../context/VehicleContext'

const COMPANIES = ['Maruti', 'Hyundai', 'Tata', 'Honda', 'Toyota', 'Mahindra', 'Ford', 'Kia', 'MG', 'Renault', 'Volkswagen', 'Skoda', 'Other']

function Field({ label, error, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}</label>
      {children}
      {error && <span className="form-error">{error.message}</span>}
    </div>
  )
}

export default function AddGarageVehicle() {
  const navigate = useNavigate()
  const { addVehicle } = useVehicles()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { vehicleNumber: '', company: 'Maruti', model: '', vehicleType: 'Car', kmReading: '', nextServiceKm: '', customerName: '', customerPhone: '' }
  })

  const onSubmit = async (data) => {
    const res = await addVehicle({ ...data, garageVehicle: true })
    if (res) navigate('/garage/vehicles')
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate('/garage/vehicles')} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F0D2E', margin: 0 }}>Add Vehicle</h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>Register a new customer vehicle</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 24, padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.02)' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <Field label="Company">
              <div style={{ position: 'relative' }}>
                <select {...register('company')} className="form-input" style={{ appearance: 'none', paddingRight: 32 }}>
                  {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              </div>
            </Field>
            <Field label="Model" error={errors.model} required>
              <input {...register('model', { required: 'Required' })} placeholder="e.g. Swift" className={`form-input ${errors.model ? 'error' : ''}`} />
            </Field>
            <Field label="Vehicle Number" error={errors.vehicleNumber} required>
              <input {...register('vehicleNumber', { required: 'Required' })} placeholder="GJ15AB1234" className={`form-input ${errors.vehicleNumber ? 'error' : ''}`} style={{ textTransform: 'uppercase' }} />
            </Field>
            <Field label="Current KM" error={errors.kmReading} required>
              <input {...register('kmReading', { required: 'Required' })} type="number" placeholder="0" className={`form-input ${errors.kmReading ? 'error' : ''}`} />
            </Field>
            <Field label="Next Service KM">
              <input {...register('nextServiceKm')} type="number" placeholder="Optional" className="form-input" />
            </Field>
            <Field label="Customer Name">
              <input {...register('customerName')} placeholder="Owner Name" className="form-input" />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn btn-ghost btn-full" onClick={() => navigate('/garage/vehicles')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 size={18} className="spin" /> Saving…</> : <><CheckCircle2 size={18} /> Save Vehicle</>}
            </button>
          </div>
        </form>
      </div>
      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
