import React, { useMemo, useState, useEffect } from 'react'
import { Wrench, Car, User, TrendingUp, Clock, AlertTriangle, ArrowRight, Plus, Bell, Calendar as CalIcon, X, Shield } from 'lucide-react'
import { useBills } from '../../context/BillContext'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import dayjs from 'dayjs'
import { getGarageStats } from '../../api/garageApi'

export default function GarageDashboard() {
  const { bills } = useBills()
  const navigate = useNavigate()
  const [showReminders, setShowReminders] = useState(false)
  const [apiStats, setApiStats] = useState(null)
  
  useEffect(() => {
    getGarageStats().then(res => {
      if (res.success) setApiStats(res.stats)
    })
  }, [])
  
  const formatVehicleNo = (no) => {
    if (!no) return '—'
    const clean = no.toUpperCase().replace(/\s+/g, '')
    if (clean.length === 10) {
      return `${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 6)} ${clean.slice(6)}`
    }
    if (clean.length === 9) {
      return `${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 5)} ${clean.slice(5)}`
    }
    return clean
  }

  const garageBills = useMemo(() => bills.filter(b => b.billType === 'garage'), [bills])

  const remindersList = useMemo(() => {
    const today = dayjs().startOf('day')
    // Get unique vehicles and their latest service
    const latestByVehicle = {}
    garageBills.forEach(b => {
      if (!b.vehicleNo) return
      if (!latestByVehicle[b.vehicleNo] || dayjs(b.billingDate || b.createdAt).isAfter(dayjs(latestByVehicle[b.vehicleNo].billingDate || latestByVehicle[b.vehicleNo].createdAt))) {
        latestByVehicle[b.vehicleNo] = b
      }
    })

    return Object.values(latestByVehicle)
      .filter(b => b.nextServiceDate)
      .map(b => {
        const dueDate = dayjs(b.nextServiceDate)
        const daysDiff = dueDate.diff(today, 'day')
        let status = 'upcoming'
        if (daysDiff < 0) status = 'overdue'
        else if (daysDiff === 0) status = 'due_today'
        else if (daysDiff <= 7) status = 'upcoming_soon'

        return {
          ...b,
          daysLeft: daysDiff,
          reminderStatus: status
        }
      })
      .filter(r => r.reminderStatus !== 'upcoming')
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }, [garageBills])

  const stats = useMemo(() => {
    const totalService = apiStats?.totalSales ?? garageBills.reduce((s, b) => s + (b.grandTotal || 0), 0)
    const pendingAmount = apiStats?.receivables ?? garageBills.filter(b => b.status !== 'paid').reduce((s, b) => s + (b.grandTotal || 0), 0)
    const servicesDone = apiStats?.servicesDone ?? garageBills.length
    const activeReminders = apiStats?.criticalReminders ?? remindersList.length

    return [
      { label: 'Total Sales', value: `₹${totalService.toLocaleString()}`, sub: 'From all job cards', icon: TrendingUp, color: '#16A34A', bg: '#DCFCE7' },
      { label: 'Receivables', value: `₹${pendingAmount.toLocaleString()}`, sub: 'Payment pending', icon: Clock, color: '#DC2626', bg: '#FEE2E2' },
      { label: 'Services Done', value: servicesDone.toString(), sub: 'Completed', icon: Wrench, color: '#7C3AED', bg: '#EDE9FE' },
      { label: 'Critical Reminders', value: activeReminders.toString(), sub: 'Due or overdue', icon: AlertTriangle, color: '#D97706', bg: '#FEF3C7' },
    ]
  }, [garageBills, remindersList, apiStats])

  const chartData = useMemo(() => {
    return garageBills.slice(-7).map(b => ({
      date: dayjs(b.billingDate || b.createdAt).format('D MMM'),
      amount: b.grandTotal || 0
    }))
  }, [garageBills])

  return (
    <div className="page-wrapper animate-fadeIn">
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: 24, padding: '24px', color: 'white', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'white' }}>Garage Dashboard</h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.95)', marginTop: 4 }}>Manage job cards, spares, and customer vehicle services</p>
        </div>
        <Wrench size={64} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', bottom: -12, right: 12, transform: 'rotate(-15deg)' }} />
      </div>

      {/* Insurance Service Banner - Horizontal Box */}
      <div 
        onClick={() => navigate('/insurance')}
        style={{ 
           background: 'white', 
           borderRadius: 20, 
           padding: '12px 18px', 
           marginBottom: 20, 
           display: 'flex', 
           alignItems: 'center', 
           gap: 14, 
           cursor: 'pointer',
           boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
           border: '1px solid #E5E7EB',
           transition: 'all 0.2s'
        }}
        onMouseEnter={e => {
           e.currentTarget.style.transform = 'translateY(-2px)'
           e.currentTarget.style.borderColor = '#10B981'
        }}
        onMouseLeave={e => {
           e.currentTarget.style.transform = 'translateY(0)'
           e.currentTarget.style.borderColor = '#E5E7EB'
        }}
      >
        <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Shield size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1F2937', display: 'flex', alignItems: 'center', gap: 6 }}>
            Insurance Service <span style={{ fontSize: '0.55rem', background: '#3B82F6', color: 'white', padding: '2px 6px', borderRadius: 100, textTransform: 'uppercase' }}>New</span>
          </div>
          <div style={{ fontSize: '0.625rem', color: '#6B7280', marginTop: 1 }}>Compare rates for your customer's vehicles and earn more</div>
        </div>
        <ArrowRight size={16} color="#D1D5DB" />
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 14px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', position: 'relative' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
            {s.label === 'Critical Reminders' && remindersList.length > 0 && (
               <span style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1.5s infinite' }} />
            )}
          </div>
        ))}
      </div>

      {/* Service Notification Banner */}
      {remindersList.length > 0 && (
         <div className="animate-fadeInLeft" style={{ background: '#FFF7ED', border: '1.5px solid #FDBA74', borderRadius: 20, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
               <Bell className={remindersList.some(r => r.reminderStatus === 'overdue') ? 'shake' : ''} size={22} />
            </div>
            <div style={{ flex: 1 }}>
               <h4 style={{ fontSize: '0.875rem', fontWeight: 900, color: '#92400E', margin: 0 }}>Service Alerts ({remindersList.length})</h4>
               <p style={{ fontSize: '0.75rem', color: '#B45309', margin: '2px 0 0' }}>
                  {remindersList.filter(r => r.reminderStatus === 'overdue').length || 0} overdue and {remindersList.filter(r => r.reminderStatus !== 'overdue').length || 0} due soon.
               </p>
            </div>
            <button 
              onClick={() => setShowReminders(true)}
              className="btn btn-sm" 
              style={{ background: '#92400E', color: 'white', borderRadius: 10, height: 32, fontSize: '0.75rem', fontWeight: 800 }}
            >
              Check Now
            </button>
         </div>
      )}

      {/* Quick Actions */}
      <div className="card" style={{ padding: '24px 16px', marginBottom: 20 }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button onClick={() => navigate('/garage/bills/new')} style={{ background: '#F5F3FF', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.1)' }}>
              <Plus size={22} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4B5563' }}>New Job Card</span>
          </button>
          
          <button onClick={() => setShowReminders(true)} style={{ background: '#FFF7ED', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#F3811E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(243, 129, 30, 0.1)' }}>
              <Bell size={22} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4B5563' }}>Service Alerts</span>
          </button>

          <button onClick={() => navigate('/parties')} style={{ background: '#ECFDF5', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.1)' }}>
              <Users size={22} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4B5563' }}>Customers</span>
          </button>

          <button onClick={() => navigate('/garage/bills')} style={{ background: '#EFF6FF', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.1)' }}>
              <Receipt size={22} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4B5563' }}>Bill History</span>
          </button>
        </div>
      </div>

      {/* Recent Activity / Upcoming List */}
      <div className="card" style={{ padding: '18px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Upcoming / Recent Jobs</h3>
          <button onClick={() => navigate('/garage/bills')} className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)', fontWeight: 700 }}>View All</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {garageBills.slice(0, 5).map((b, i) => (
            <div key={b._id || i} onClick={() => navigate(`/bills/${b._id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', padding: '10px 12px', borderRadius: 14, cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Car size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {b.customerName || 'Customer'} • {formatVehicleNo(b.vehicleNo)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dayjs(b.billingDate || b.createdAt).format('DD MMM')} • {b.vehicleModel || '—'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{(b.grandTotal || 0).toLocaleString()}</div>
                <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: b.status === 'paid' ? '#16A34A' : '#DC2626' }}>{b.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reminders Detail Drawer/Modal */}
      {showReminders && (
         <div onClick={() => setShowReminders(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s ease both' }}>
            <div 
               onClick={(e) => e.stopPropagation()}
               className="animate-fadeInRight"
               style={{ width: '100%', maxWidth: 400, background: 'white', height: '100%', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' }}
            >
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F0D2E', margin: 0 }}>Service Alerts</h2>
                  <button onClick={() => setShowReminders(false)} style={{ border: 'none', background: '#F3F4F6', color: '#6B7280', borderRadius: 10, width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <X size={22} />
                  </button>
               </div>
 
               <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {remindersList.length > 0 ? remindersList.map(r => (
                     <div key={r.id} style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: '14px', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                           <div style={{ width: 36, height: 36, borderRadius: 10, background: r.reminderStatus === 'overdue' ? '#FEE2E2' : '#EFF6FF', color: r.reminderStatus === 'overdue' ? '#EF4444' : '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Car size={18} />
                           </div>
                           <div>
                              <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>{formatVehicleNo(r.vehicleNo)}</div>
                              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{r.customerName}</div>
                           </div>
                           <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                              <div style={{ fontSize: '0.625rem', fontWeight: 900, padding: '2px 8px', borderRadius: 6, background: r.reminderStatus === 'overdue' ? '#EF4444' : '#3B82F6', color: 'white', textTransform: 'uppercase' }}>
                                 {r.reminderStatus.replace('_', ' ')}
                              </div>
                           </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', padding: '8px 10px', background: '#F9FAFB', borderRadius: 10 }}>
                           <span style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}><CalIcon size={12} /> Due: {dayjs(r.nextServiceDate).format('DD MMM YYYY')}</span>
                           <span style={{ fontWeight: 700, color: r.reminderStatus === 'overdue' ? '#EF4444' : '#3B82F6' }}>
                              {r.reminderStatus === 'overdue' ? `Delayed by ${Math.abs(r.daysLeft)} days` : `In ${r.daysLeft} days`}
                           </span>
                        </div>
                        <button 
                           onClick={() => navigate(`/garage/bills/new?vehicleNo=${r.vehicleNo}`)}
                           style={{ width: '100%', marginTop: 10, background: '#0F0D2E', color: 'white', border: 'none', borderRadius: 10, padding: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                           Create New Job Card
                        </button>
                     </div>
                  )) : (
                     <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
                        <Bell size={48} style={{ opacity: 0.1, marginBottom: 12 }} />
                        <p>No active service reminders.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}
 
      <button 
        onClick={() => navigate('/garage/bills/new')} 
        className="btn btn-primary btn-lg btn-fab-mobile" 
        style={{ position: 'fixed', bottom: 84, right: 20, borderRadius: 20, boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)', zIndex: 100, display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <Plus size={20} /> <span className="fab-text">New Job Card</span>
      </button>

      <style>{`
         @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
         }
         @keyframes shake {
            0%, 100% { transform: rotate(0); }
            25% { transform: rotate(-10deg); }
            75% { transform: rotate(10deg); }
         }
         .shake { animation: shake 0.5s infinite; }
         
         @media (max-width: 640px) {
            .btn-fab-mobile {
               padding: 0 16px !important;
               height: 48px !important;
               border-radius: 16px !important;
            }
            .btn-fab-mobile .fab-text {
               font-size: 0.8125rem;
               font-weight: 800;
            }
         }
      `}</style>
      <div style={{ height: 20 }} />
    </div>
  )
}
