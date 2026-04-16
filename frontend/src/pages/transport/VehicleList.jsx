import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Truck, Hash, Trash2, Edit2, X } from 'lucide-react'
import { useVehicles } from '../../context/VehicleContext'

const VehicleCard = ({ v, onEdit, onDelete }) => {
  const [act, setAct] = useState(false)
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: '14px 16px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex',
      alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden',
      border: '1px solid rgba(0,0,0,0.04)',
    }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Truck size={22} color="#D97706" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F0D2E', letterSpacing: '0.04em' }}>
          {v.vehicleNumber?.toUpperCase()}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 3 }}>
          {v.vehicleType || 'Transport'} • Added {new Date(v.createdAt).toLocaleDateString('en-IN')}
        </div>
      </div>
      <button onClick={() => setAct(s => !s)} style={{ width: 28, height: 28, border: 'none', background: '#F4F4F8', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
        <Edit2 size={13} />
      </button>
      {act && (
        <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, background: 'white', display: 'flex', alignItems: 'center', borderLeft: '1px solid #F3F4F6', borderRadius: '0 16px 16px 0', animation: 'slideInRight 0.18s ease both' }}>
          <button onClick={() => onEdit(v)} style={{ padding: '0 14px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: '#7C3AED' }}>
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(v._id)} style={{ padding: '0 14px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: '#DC2626', borderRadius: '0 16px 16px 0' }}>
            <Trash2 size={14} />
          </button>
          <button onClick={() => setAct(false)} style={{ padding: '0 8px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF' }}>
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function TransportVehicleList() {
  const { vehicles, deleteVehicle } = useVehicles()
  const navigate = useNavigate()

  return (
    <div className="page-wrapper animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F0D2E', marginBottom: 2 }}>Vehicles</h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{vehicles.length} in your fleet</p>
        </div>
        <button id="btn-add-vehicle" className="btn btn-primary btn-sm" onClick={() => navigate('/transport/vehicles/add')}>
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 20, padding: '48px 24px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Truck size={28} color="#D97706" />
          </div>
          <h3 style={{ fontWeight: 700, marginBottom: 8, color: '#0F0D2E' }}>No vehicles yet</h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 20 }}>Add your transport vehicles to start billing trips</p>
          <button className="btn btn-primary" id="btn-add-first-vehicle" onClick={() => navigate('/transport/vehicles/add')}>
            <Plus size={16} /> Add Vehicle
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {vehicles.map(v => (
            <VehicleCard key={v._id} v={v} onEdit={() => navigate(`/transport/vehicles/edit/${v._id}`)} onDelete={deleteVehicle} />
          ))}
        </div>
      )}
    </div>
  )
}
