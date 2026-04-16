import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Truck, CheckCircle2, Loader2, ArrowLeft, ChevronDown } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useVehicles } from '../../context/VehicleContext'

const VEHICLE_TYPES = ['Tempo', 'Truck', 'Mini Truck', 'Heavy Truck', 'Container', 'Tanker', 'Trailer', 'Other']

function Field({ label, error, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}</label>
      {children}
      {error && <span className="form-error">{error.message}</span>}
    </div>
  )
}

export default function AddVehicle() {
  const { addVehicle, updateVehicle, vehicles } = useVehicles()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { vehicleNumber: '', vehicleType: 'Tempo', ownerName: '', notes: '' }
  })

  useEffect(() => {
    if (isEdit && vehicles.length > 0) {
      const v = vehicles.find(x => x._id === id)
      if (v) reset(v)
    }
  }, [isEdit, id, vehicles, reset])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateVehicle(id, data)
      } else {
        await addVehicle({ ...data, vehicleNumber: data.vehicleNumber.toUpperCase() })
      }
      navigate('/transport/vehicles')
    } catch (e) {
      alert('Failed to save vehicle')
    }
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 540, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate('/transport/vehicles')} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0F0D2E', margin: 0 }}>{isEdit ? 'Edit' : 'Add'} Vehicle</h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>{isEdit ? 'Update details' : 'Add to your transport fleet'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ background: 'white', borderRadius: 20, padding: '20px 20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20, border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={16} color="#D97706" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F0D2E', margin: 0 }}>Vehicle Details</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Vehicle Number" error={errors.vehicleNumber} required>
              <input
                id="field-vehicle-number"
                {...register('vehicleNumber', {
                  required: 'Vehicle number is required',
                  pattern: { value: /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i, message: 'e.g. GJ15XX1234' }
                })}
                placeholder="GJ15XX1234"
                className={`form-input ${errors.vehicleNumber ? 'error' : ''}`}
                style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, fontSize: '1.125rem' }}
              />
            </Field>

            <Field label="Vehicle Type">
              <div style={{ position: 'relative' }}>
                <select id="field-vehicle-type" {...register('vehicleType')} className="form-input" style={{ appearance: 'none', paddingRight: 36 }}>
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              </div>
            </Field>

            <Field label="Owner Name (if hired)">
              <input id="field-vehicle-owner" {...register('ownerName')} placeholder="Owner name (optional)" className="form-input" />
            </Field>

            <Field label="Notes">
              <textarea id="field-vehicle-notes" {...register('notes')} placeholder="Any notes about this vehicle…"
                className="form-input" style={{ resize: 'vertical', minHeight: 72 }} rows={3} />
            </Field>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" className="btn btn-ghost btn-full" onClick={() => navigate('/transport/vehicles')}>Cancel</button>
          <button id="btn-save-vehicle" type="submit" className="btn btn-primary btn-full btn-lg" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 size={18} className="spin" /> Saving…</> : <><CheckCircle2 size={18} /> {isEdit ? 'Save Changes' : 'Add Vehicle'}</>}
          </button>
        </div>
      </form>
      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
