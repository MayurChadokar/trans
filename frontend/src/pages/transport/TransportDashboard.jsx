import React, { useMemo, useState, useEffect } from 'react'
import { Truck, MapPin, Receipt, TrendingUp, TrendingDown, Clock, ArrowRight, Plus, Users, Shield, Loader2 } from 'lucide-react'
import { useBills } from '../../context/BillContext'
import { useVehicles } from '../../context/VehicleContext'
import { useParties } from '../../context/PartyContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import dayjs from 'dayjs'
import { getTransportStats } from '../../api/transportApi'

export default function TransportDashboard() {
  const { t } = useTranslation()
  const { bills } = useBills()
  const { vehicles } = useVehicles()
  const { parties } = useParties()
  const navigate = useNavigate()
  const [dbStats, setDbStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTransportStats().then(res => {
      if (res.success) setDbStats(res.stats)
      setLoading(false)
    })
  }, [])

  const transportBills = useMemo(() => bills.filter(b => b.billType === 'transport'), [bills])

  const stats = useMemo(() => {
    const totalFreight = dbStats?.totalRevenue || 0
    const pendingAmount = dbStats?.pendingRevenue || 0
    const totalTrips = dbStats?.activeTrips || 0
    const fleetSize = dbStats?.totalVehicles || 0

    return [
      { label: t('total_revenue'), value: `₹${totalFreight.toLocaleString()}`, sub: 'All bills', icon: TrendingUp, color: '#16A34A', bg: '#DCFCE7' },
      { label: t('total_parties'), value: parties.length.toString(), sub: 'Active accounts', icon: Users, color: '#7C3AED', bg: '#F5F3FF' },
      { label: t('pending_trips'), value: totalTrips.toString(), sub: 'Unbilled missions', icon: Truck, color: '#F3811E', bg: '#FFF7ED' },
      { label: t('total_fleet'), value: fleetSize.toString(), sub: 'Live vehicles', icon: Users, color: '#2563EB', bg: '#DBEAFE' },
    ]
  }, [dbStats, t])

  const chartData = useMemo(() => {
    if (!bills || bills.length === 0) return []
    return bills.filter(b => b.billType === 'transport').slice(-7).map(b => ({
      date: dayjs(b.billingDate || b.createdAt).format('D MMM'),
      amount: b.grandTotal || 0
    }))
  }, [bills])

  return (
    <div className="page-wrapper animate-fadeIn" style={{ paddingBottom: 60 }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0F0D2E, #2D2A5A)', borderRadius: 28, padding: '28px', color: 'white', marginBottom: 20, position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(15, 13, 46, 0.2)' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: 'white' }}>{t('transport')} {t('dashboard')}</h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>Manage logistics fleet and consolidated freight</p>
        </div>
        <Truck size={100} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', bottom: -20, right: 10, transform: 'rotate(-10deg)' }} />
      </div>

      {/* Insurance Banner - Small Horizontal Box */}
      <div 
        onClick={() => navigate('/insurance')}
        style={{ 
          background: 'white', 
          borderRadius: 20, 
          padding: '12px 20px', 
          marginBottom: 20, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 16, 
          cursor: 'pointer',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.borderColor = '#7C3AED'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.borderColor = '#E5E7EB'
        }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Shield size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 850, color: '#1F2937', display: 'flex', alignItems: 'center', gap: 6 }}>
            {t('insurance_service')} <span style={{ fontSize: '0.6rem', background: '#F59E0B', color: 'white', padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase' }}>{t('new_badge')}</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: 2 }}>Secure your fleet with 20+ insurers starting at ₹2094/yr</div>
        </div>
        <ArrowRight size={18} color="#9CA3AF" />
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 24, padding: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#111827' }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ background: 'white', borderRadius: 28, padding: '24px', marginBottom: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 20 }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button onClick={() => navigate('/transport/trips')} style={{ background: '#F5F3FF', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.1)' }}>
              <Truck size={22} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4B5563' }}>Log New Trip</span>
          </button>

          <button onClick={() => navigate('/transport/vehicles')} style={{ background: '#ECFDF5', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.1)' }}>
              <Plus size={22} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4B5563' }}>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: 'white', borderRadius: 28, padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{t('recent_activity')}</h3>
          <button onClick={() => navigate('/transport/bills')} className="btn btn-ghost btn-sm" style={{ color: '#4F46E5', fontWeight: 800 }}>{t('view_all')}</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {transportBills.slice(0, 4).map((b, i) => (
            <div key={b._id || i} onClick={() => navigate(`/bills/${b._id}`)} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#F9FAFB', padding: '14px', borderRadius: 20, cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FFF7ED', color: '#F3811E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Receipt size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {b.billedToName || 'Consolidated Bill'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                   {b.items?.length || 0} trip(s) • {dayjs(b.billingDate || b.createdAt).format('DD MMM')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#111827' }}>₹{(b.grandTotal || 0).toLocaleString()}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: b.status === 'paid' ? '#16A34A' : '#DC2626' }}>{t(b.status)}</div>
              </div>
            </div>
          ))}
          {transportBills.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF', fontSize: '0.875rem' }}>{t('no_activity')}</div>
          )}
        </div>
      </div>
    </div>
  )
}
