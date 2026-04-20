import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Truck, Hash, Trash2, Edit2, X, Search, Calendar, MapPin, IndianRupee, ChevronRight } from 'lucide-react'
import { useVehicles } from '../../context/VehicleContext'
import { getVehicleDetail } from '../../api/transportApi'

const VehicleCard = ({ v, onEdit, onDelete, onClick }) => {
  const [act, setAct] = useState(false)
  return (
    <div 
      onClick={() => onClick(v)}
      style={{
        background: 'white', borderRadius: 16, padding: '14px 16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex',
        alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ width: 46, height: 46, borderRadius: 14, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Truck size={22} color="#D97706" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F0D2E', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 8 }}>
          {v.vehicleNumber?.toUpperCase()}
          {v.tripCount > 0 && (
            <span style={{ fontSize: '0.6rem', background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>
              {v.tripCount} TRIPS
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 3 }}>
          {v.vehicleType || 'Transport'} • Added {new Date(v.createdAt).toLocaleDateString('en-IN')}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button 
          onClick={(e) => { e.stopPropagation(); setAct(s => !s); }} 
          style={{ width: 28, height: 28, border: 'none', background: '#F4F4F8', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}
        >
          <Edit2 size={13} />
        </button>
        <ChevronRight size={18} color="#9CA3AF" />
      </div>
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

const VehicleDetailModal = ({ vehicleId, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useMemo(() => {
    if (!vehicleId) return
    setLoading(true)
    getVehicleDetail(vehicleId).then(res => {
      if (res.success) setData(res.vehicle)
      setLoading(false)
    })
  }, [vehicleId])

  if (!vehicleId) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div 
        onClick={e => e.stopPropagation()}
        style={{ 
          background: '#F8FAFC', width: '100%', maxWidth: 500, height: '90vh', 
          borderTopLeftRadius: 24, borderTopRightRadius: 24, 
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'slideInUp 0.3s ease-out'
        }}
      >
        <div style={{ padding: '20px 20px 10px', background: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>{data?.vehicleNumber?.toUpperCase() || 'Loading...'}</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>{data?.vehicleType || 'Vehicle'} Details</p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: 'none', background: '#F1F5F9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} color="#64748B" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>Fetching details...</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Total Trips</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{data?.tripCount || 0}</div>
                </div>
                <div style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Type</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{data?.vehicleType || 'N/A'}</div>
                </div>
              </div>

              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={16} color="#6366F1" /> Trip History
              </h4>

              {data?.trips?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 16, border: '1px dashed #E2E8F0', color: '#64748B', fontSize: '0.85rem' }}>
                  No trips found for this vehicle.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {data?.trips?.map(trip => (
                    <div key={trip._id} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>{trip.tripId}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>₹{trip.amount?.toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366F1' }}></div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>{trip.source}</div>
                        <ChevronRight size={12} color="#94A3B8" />
                        <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>{trip.destination}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#0F172A', fontWeight: 600 }}>{trip.party?.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TransportVehicleList() {
  const { vehicles, deleteVehicle } = useVehicles()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  const filteredVehicles = useMemo(() => {
    if (!search) return vehicles
    const s = search.toLowerCase()
    return vehicles.filter(v => v.vehicleNumber?.toLowerCase().includes(s))
  }, [vehicles, search])

  return (
    <div className="page-wrapper animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0F0D2E', marginBottom: 2 }}>Vehicles</h2>
          <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>{vehicles.length} in your fleet</p>
        </div>
        <button id="btn-add-vehicle" className="btn btn-primary" onClick={() => navigate('/transport/vehicles/add')} style={{ borderRadius: 12, padding: '10px 20px' }}>
          <Plus size={18} /> Add Vehicle
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search by vehicle number..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '14px 14px 14px 44px', borderRadius: 16, border: '1px solid #E5E7EB',
            fontSize: '0.95rem', background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = '#6366F1'}
          onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
        />
      </div>

      {filteredVehicles.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 20, padding: '48px 24px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Truck size={28} color="#D97706" />
          </div>
          <h3 style={{ fontWeight: 700, marginBottom: 8, color: '#0F0D2E' }}>
            {search ? 'No vehicles found' : 'No vehicles yet'}
          </h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 20 }}>
            {search ? `We couldn't find any vehicle matching "${search}"` : 'Add your transport vehicles to start billing trips'}
          </p>
          {!search && (
            <button className="btn btn-primary" id="btn-add-first-vehicle" onClick={() => navigate('/transport/vehicles/add')}>
              <Plus size={16} /> Add Vehicle
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredVehicles.map(v => (
            <VehicleCard 
              key={v._id} v={v} 
              onEdit={() => navigate(`/transport/vehicles/edit/${v._id}`)} 
              onDelete={deleteVehicle}
              onClick={(vehicle) => setSelectedVehicle(vehicle._id)}
            />
          ))}
        </div>
      )}

      <VehicleDetailModal 
        vehicleId={selectedVehicle} 
        onClose={() => setSelectedVehicle(null)} 
      />
    </div>
  )
}
