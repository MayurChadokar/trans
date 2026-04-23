import React, { useMemo, useState, useEffect } from 'react'
import { Truck, MapPin, Receipt, TrendingUp, TrendingDown, Clock, ArrowRight, Plus, Users, Shield, Loader2, Layout, AlertCircle } from 'lucide-react'
import { useBills } from '../../context/BillContext'
import { useVehicles } from '../../context/VehicleContext'
import { useParties } from '../../context/PartyContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFinance } from '../../context/FinanceContext'
import { getTransportStats } from '../../api/transportApi'
import { apiClient } from '../../api/apiClient'
import dayjs from 'dayjs'

export default function TransportDashboard() {
  const { t } = useTranslation()
  const { bills } = useBills()
  const { vehicles } = useVehicles()
  const { parties } = useParties()
  const { transactions } = useFinance()
  const navigate = useNavigate()
  const [dbStats, setDbStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const [banners, setBanners] = useState([])

  useEffect(() => {
    getTransportStats().then(res => {
      if (res.success) setDbStats(res.stats)
      setLoading(false)
    })
    
    // Fetch dynamic banners
    apiClient.get('/system/banners').then(res => {
      if (res.data.success && res.data.banners) {
        setBanners(res.data.banners.filter(b => b.active))
      }
    }).catch(e => console.error("Banner fetch failed", e))
  }, [])

  const transportBills = useMemo(() => bills.filter(b => b.billType === 'transport'), [bills])

  const stats = useMemo(() => {
    const totalFreight = dbStats?.totalRevenue || 0
    const pendingAmount = dbStats?.pendingRevenue || 0
    const fleetSize = dbStats?.totalVehicles || 0

    const todayExpense = transactions
      .filter(t => t.type === 'expense' && dayjs(t.date).isSame(dayjs(), 'day'))
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    return [
      { label: t('total_revenue'), value: `₹${totalFreight.toLocaleString()}`, sub: 'All bills', icon: TrendingUp, color: '#16A34A', bg: '#DCFCE7' },
      { label: t('total_parties'), value: parties.length.toString(), sub: 'Active accounts', icon: Users, color: '#7C3AED', bg: '#F5F3FF' },
      { label: t('total_fleet'), value: fleetSize.toString(), sub: 'Live vehicles', icon: Users, color: '#2563EB', bg: '#DBEAFE' },
      { label: "Today's Expense", value: `₹${todayExpense.toLocaleString()}`, sub: 'Fuel & Maintenance', icon: TrendingDown, color: '#DC2626', bg: '#FEE2E2' },
    ]
  }, [dbStats, transactions, parties.length, t])


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

      {/* Quick Actions */}
      <div style={{ background: 'white', borderRadius: 28, padding: '24px', marginBottom: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 20 }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <button onClick={() => navigate('/transport/trips')} style={{ background: '#F5F3FF', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.1)' }}>
              <Truck size={22} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4B5563' }}>Log New Trip</span>
          </button>

          <button onClick={() => navigate('/transport/expenses')} style={{ background: '#FFF7ED', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#F3811E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(243, 129, 30, 0.1)' }}>
              <TrendingDown size={22} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4B5563' }}>Daily Expense</span>
          </button>

          <button onClick={() => navigate('/transport/vehicles')} style={{ background: '#ECFDF5', border: 'none', borderRadius: 20, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.1)' }}>
              <Plus size={22} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4B5563' }}>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Dynamic Banners from Admin Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
        {banners.map((banner) => (
          <div 
            key={banner.id}
            onClick={() => {
              if (banner.link.startsWith('/')) navigate(banner.link)
              else window.open(banner.link, '_blank')
            }}
            style={{ 
              background: '#FFFFFF', 
              borderRadius: 28, 
              padding: '32px 36px', 
              color: '#0F172A',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s',
              minHeight: 180,
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #F1F5F9'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.12)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#0F172A' }}>{banner.title}</h2>
                {banner.badge && (
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, background: '#F59E0B', color: 'white', padding: '3px 12px', borderRadius: 100, textTransform: 'uppercase' }}>{banner.badge}</span>
                )}
              </div>
              <p style={{ fontSize: '1rem', color: '#64748B', margin: 0, maxWidth: '70%', fontWeight: 500, lineHeight: 1.4 }}>{banner.subtitle}</p>
              
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 800, color: '#4F46E5' }}>
                 Explore Now <ArrowRight size={16} />
              </div>
            </div>

            {/* Background Image / Icon */}
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%', zIndex: 1 }}>
              {banner.imageUrl ? (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <img src={banner.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 20 }} alt="B" />
                </div>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', opacity: 0.05, paddingRight: 40 }}>
                  <Shield size={140} style={{ transform: 'rotate(-20deg)' }} />
                </div>
              )}
            </div>
          </div>
        ))}
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
