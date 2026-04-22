import { useAuth } from '../../context/AuthContext'
import TransportBill from './TransportBill'
import GarageBill   from './GarageBill'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Truck, Wrench, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useBills } from '../../context/BillContext'

export default function CreateBill() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const typeParam = searchParams.get('type')
  const { fetchBill, getBill } = useBills()
  const role      = user?.role

  const [picked, setPicked] = useState(typeParam)
  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(!!id)

  // Redirect admin away
  useEffect(() => {
    if (role === 'admin') navigate('/admin/dashboard', { replace: true })
  }, [role, navigate])

  // If ID present, fetch bill
  useEffect(() => {
    if (!id) return
    const b = getBill(id)
    if (b) {
      setInitialData(b)
      setPicked(b.billType || (user.role === 'transport' ? 'transport' : 'garage'))
      setLoading(false)
    } else {
      fetchBill(id).then(res => {
        if (res) {
          setInitialData(res)
          setPicked(res.billType || (user.role === 'transport' ? 'transport' : 'garage'))
        }
        setLoading(false)
      })
    }
  }, [id, fetchBill, getBill, user.role])

  if (loading) return (
     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12, color: '#6B7280' }}>
       <Loader2 size={24} className="spin" />
       <span style={{ fontWeight: 600 }}>Loading bill data...</span>
       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
     </div>
  )

  // Role-specific: direct render (no picker needed)
  if (role === 'transport') return <TransportBill initialData={initialData} />
  if (role === 'garage')    return <GarageBill initialData={initialData} />

  // Admin — render nothing
  if (role === 'admin') return null

  // Picker chosen
  if (picked === 'transport') return <TransportBill initialData={initialData} />
  if (picked === 'garage')    return <GarageBill initialData={initialData} />

  // Default: show bill type picker
  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontWeight: 800, marginBottom: 6, color: '#0F0D2E' }}>New Bill</h2>
      <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 24 }}>Select the type of bill to create</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { type: 'transport', icon: Truck,  label: 'Transport Bill', sub: 'Freight / LR',     bg: '#FEF3C7', color: '#D97706' },
          { type: 'garage',    icon: Wrench, label: 'Garage Bill',    sub: 'Service Invoice',  bg: '#EDE9FE', color: '#7C3AED' },
        ].map(opt => (
          <button
            key={opt.type}
            id={`btn-create-${opt.type}`}
            onClick={() => setPicked(opt.type)}
            style={{
              background: 'white', border: '2px solid transparent', borderRadius: 20,
              padding: '28px 20px', cursor: 'pointer', textAlign: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none' }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 16, background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <opt.icon size={26} color={opt.color} />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F0D2E', marginBottom: 4 }}>{opt.label}</div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{opt.sub}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
