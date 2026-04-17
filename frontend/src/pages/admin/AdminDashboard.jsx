import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, FileText, Banknote, TrendingUp,
  Truck, Wrench, MapPin, CreditCard,
  Building2, ChevronRight, Globe, Activity,
  AlertCircle, CheckCircle, Clock, IndianRupee
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { useAdmin } from '../../context/AdminContext'
import { useTranslation } from 'react-i18next'

const COLORS_T = ['#7C3AED', '#6366F1', '#10B981', '#EF4444']
const COLORS_G = ['#7C3AED', '#10B981', '#8B5CF6', '#EF4444']

export default function AdminDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    mode, stats,
    users, businesses, invoices
  } = useAdmin()

  const isTransport = mode === 'transport'
  const COLORS = isTransport ? COLORS_T : COLORS_G
  const accentColor = '#7C3AED'
  const accentLight = '#EDE9FE'

  /* Last 6 days activity from invoices */
  const chartData = useMemo(() => {
    const days = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (5 - i))
      return d.toISOString().split('T')[0]
    })
    return days.map(date => ({
      name: new Date(date).toLocaleDateString(t('en'), { weekday: 'short' }),
      invoices: invoices.filter(inv => inv.date === date).length,
      revenue: invoices.filter(inv => inv.date === date && inv.status === 'Paid')
        .reduce((s, inv) => s + (Number(inv.total) || 0), 0),
    }))
  }, [invoices, t])

  const pieData = [
    { name: t('paid'), value: stats.paidInvoices },
    { name: t('outstanding'), value: stats.pendingInvoices },
    { name: t('parties'), value: stats.totalBusinesses },
    { name: t('user_mgmt'), value: stats.totalUsers },
  ].filter(d => d.value > 0)

  const kpiCards = [
    {
      label: isTransport ? t('transport') : t('garage'),
      value: stats.totalUsers,
      icon: Users,
      color: '#6366F1',
      bg: '#EEF2FF',
      sub: `${stats.activeUsers} ${t('active')}`
    },
    {
      label: isTransport ? t('transport') : t('garage'),
      value: stats.totalBusinesses,
      icon: Building2,
      color: accentColor,
      bg: accentLight,
      sub: 'registered'
    },
    {
      label: isTransport ? t('bills') : t('bills'),
      value: stats.totalInvoices,
      icon: FileText,
      color: '#10B981',
      bg: '#ECFDF5',
      sub: `${stats.pendingInvoices} pending`
    },
    {
      label: t('total_revenue'),
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: '#059669',
      bg: '#D1FAE5',
      sub: `₹${stats.pendingRevenue.toLocaleString('en-IN')} pending`
    },
  ]

  const recentUsers = [...users].slice(0, 4)
  const recentInvoices = [...invoices].slice(0, 5)

  return (
    <div className="animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Globe size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {isTransport ? '🚛 ' + t('transport') : '🔧 ' + t('garage')} · Live Dashboard
            </span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            {t('admin')} Console
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Real-time overview of all {isTransport ? t('transport') : t('garage')} operations
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(isTransport ? '/admin/transport' : '/admin/garage')}
          style={{ background: accentColor, borderColor: accentColor }}
        >
          {isTransport ? <Truck size={16} /> : <Wrench size={16} />}
          {t('edit')} {isTransport ? t('transport') : t('garage')}
        </button>
      </div>

      {/* ── Mode Badge ── */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
        background: `${accentColor}15`, borderRadius: 99, border: `1px solid ${accentColor}30`,
        marginBottom: 28
      }}>
        {isTransport ? <Truck size={15} color={accentColor} /> : <Wrench size={15} color={accentColor} />}
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: accentColor }}>
          Currently viewing: {isTransport ? 'Transport' : 'Garage'} data
        </span>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: accentColor,
          boxShadow: `0 0 0 3px ${accentColor}30`, animation: 'pulse 1.5s infinite'
        }} />
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        {kpiCards.map((kpi, i) => (
          <div key={i} className="card" style={{ padding: '22px 24px', borderTop: `3px solid ${kpi.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                {kpi.label}
              </p>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={18} color={kpi.color} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6, fontWeight: 600 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>

        {/* Area Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1rem' }}>Invoice Activity (Last 6 Days)</h3>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: accentColor, background: `${accentColor}15`, padding: '4px 10px', borderRadius: 99 }}>LIVE</span>
          </div>
          {chartData.some(d => d.invoices > 0 || d.revenue > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accentColor} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="invoices" stroke={accentColor} strokeWidth={3} fill="url(#colInv)" name="Invoices" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Activity size={40} color="var(--text-muted)" strokeWidth={1.5} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'center' }}>No invoice data yet</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>Transactions history will appear here</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/billing')}>View Billing Monitor</button>
            </div>
          )}
        </div>

        {/* Pie Chart / Summary */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontWeight: 900, fontSize: '1rem' }}>System Snapshot</h3>
          {pieData.length > 0 ? (
            <>
              <PieChart width={180} height={180} style={{ margin: '0 auto' }}>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 700 }} />
              </PieChart>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                    </span>
                    <span style={{ fontWeight: 900 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 220, gap: 12 }}>
              <TrendingUp size={40} color="var(--text-muted)" strokeWidth={1.5} />
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>Add data to see breakdown</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row: Recent Users + Recent Invoices ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Recent Users */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontWeight: 900, fontSize: '0.9375rem' }}>Recent {isTransport ? 'Transporters' : 'Garage Owners'}</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/users')} style={{ paddingInline: 12 }}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {recentUsers.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <Users size={32} color="var(--text-muted)" strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>No users yet. Add one from User Management.</p>
              </div>
            ) : recentUsers.map(u => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px',
                borderBottom: '1px solid var(--border)', transition: 'background 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: `${accentColor}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, color: accentColor, fontSize: '0.9rem'
                }}>
                  {(u.name || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '0.875rem' }}>{u.name}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{u.phone || u.email || '—'}</p>
                </div>
                <span style={{
                  fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                  padding: '3px 8px', borderRadius: 99,
                  background: u.status === 'Active' ? 'var(--success-light)' : '#FEF3C7',
                  color: u.status === 'Active' ? 'var(--success)' : '#D97706'
                }}>{u.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontWeight: 900, fontSize: '0.9375rem' }}>Recent Invoices</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/billing')} style={{ paddingInline: 12 }}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {recentInvoices.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <FileText size={32} color="var(--text-muted)" strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>No invoices records found in history.</p>
              </div>
            ) : recentInvoices.map(inv => (
              <div key={inv.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px',
                borderBottom: '1px solid var(--border)', transition: 'background 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: 'var(--bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FileText size={16} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '0.8125rem' }}>{inv.id}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{inv.businessName || inv.user || '—'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: '0.875rem' }}>₹{(inv.total || 0).toLocaleString('en-IN')}</p>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                    padding: '3px 8px', borderRadius: 99,
                    background: inv.status === 'Paid' ? 'var(--success-light)' : inv.status === 'Partial' ? 'var(--primary-lighter)' : '#FEF3C7',
                    color: inv.status === 'Paid' ? 'var(--success)' : inv.status === 'Partial' ? 'var(--primary)' : '#D97706'
                  }}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
