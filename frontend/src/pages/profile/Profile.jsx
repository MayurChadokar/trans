import { UserCircle, Building2, CreditCard, QrCode, ChevronRight, LogOut, Zap, Calendar } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const menuItems = [
  { icon: Building2,  label: 'Business Details', sub: 'Name, address, GST/PAN', to: '/profile/business', color: 'var(--primary)' },
  { icon: CreditCard, label: 'Bank Details',     sub: 'Account & UPI info',     to: '/profile/bank',     color: '#2563EB'        },
  { icon: QrCode,     label: 'QR Code',          sub: 'Payment QR code',         to: '/profile/qr',       color: '#16A34A'        },
  { icon: Zap,        label: 'Subscription',     sub: 'Plan & Billing',          to: '/subscription',     color: '#D97706'        },
]

export default function Profile() {
  const { user, logout } = useAuth()
  const { language, changeLanguage } = useApp()
  const navigate = useNavigate()

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.phone?.slice(-2) || '?'

  return (
    <div className="page-wrapper animate-fadeIn">
      {/* Profile header */}
      <div className="card" style={{ marginBottom: 16, textAlign: 'center', padding: '28px 20px' }}>
        <div className="avatar avatar-lg" style={{ margin: '0 auto 12px', width: 64, height: 64, fontSize: '1.25rem', overflow: 'hidden', background: '#F1F5F9' }}>
          {user?.logoUrl ? (
            <img src={user.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Logo" />
          ) : initials}
        </div>
        <h3 style={{ fontWeight: 800, fontSize: '1.125rem' }}>{user?.businessName || user?.name || 'Business Owner'}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 4 }}>
          +91 {user?.phone?.replace(/(\d{5})(\d{5})/, '$1 $2') || 'XXXXX XXXXX'}
        </p>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button 
            onClick={() => navigate('/profile/edit')}
            className="btn btn-sm" 
            style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <UserCircle size={14} /> Edit Profile
          </button>
          <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
            {user?.role || 'User'} Account
          </span>
        </div>
      </div>

      {/* Subscription Status Card */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 16, background: 'linear-gradient(135deg, #FDFCFB 0%, #F5F3FF 100%)', border: '1px solid #7C3AED20' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.1)' }}>
            <Zap size={22} color={user?.subscriptionActive ? '#7C3AED' : '#94A3B8'} fill={user?.subscriptionActive ? '#7C3AED' : 'none'} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Current Plan</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>
              {user?.subscriptionActive ? 'Premium Plan' : 'No Active Plan'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {user?.subscriptionActive ? (
              <span className="badge badge-success">Active</span>
            ) : (
              <span className="badge badge-danger">Expired</span>
            )}
          </div>
        </div>
        
        {user?.subscriptionExpiry && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              <Calendar size={14} /> Expires on {dayjs(user.subscriptionExpiry).format('DD MMM YYYY')}
            </div>
            <button 
              onClick={() => navigate('/subscription')}
              style={{ background: 'none', border: 'none', color: '#7C3AED', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
            >
              Manage
            </button>
          </div>
        )}
      </div>

      {/* Language Selection */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Language / भाषा</h4>
          <span className="badge badge-info">{language === 'en' ? 'English' : 'हिंदी'}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            onClick={() => changeLanguage('en')}
            className={`btn btn-sm ${language === 'en' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8125rem' }}
          >
            English
          </button>
          <button
            onClick={() => changeLanguage('hi')}
            className={`btn btn-sm ${language === 'hi' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8125rem' }}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Menu items */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            id={`btn-profile-${item.label.toLowerCase().replace(/ /g, '-')}`}
            onClick={() => navigate(item.to)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: 14, padding: '16px 20px', background: 'none',
              border: 'none', borderBottom: i < menuItems.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer', transition: 'var(--transition)', fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: item.color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <item.icon size={18} color={item.color} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.sub}</div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        id="btn-profile-logout"
        className="btn btn-ghost btn-full"
        onClick={async () => { await logout(); navigate(user?.role === 'admin' ? '/admin' : '/login') }}
        style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)', gap: 8 }}
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  )
}
