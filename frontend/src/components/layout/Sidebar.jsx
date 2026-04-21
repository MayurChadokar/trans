import { useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Building2, Receipt,
  BarChart2, Bell, ShieldCheck,
  LogOut, ChevronLeft, ChevronRight, Truck,
  Wrench, Monitor, Layout,
  Plus, ChevronDown, UserCircle, MapPin, Banknote, CreditCard
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { useAdmin } from '../../context/AdminContext'
import { useTranslation } from 'react-i18next'
import logo from '../../assets/trans-logo.png'

function NavItem({ item, expanded, toggleSection, sidebarCollapsed, mobileMenuOpen, closeMobileMenu, accentColor, level = 0 }) {
  if (item.isCollapsible) {
    return (
      <div className="nav-collapsible" style={{ marginBottom: 4 }}>
        <button
          className="nav-item w-full"
          onClick={() => toggleSection(item.id)}
          style={{ 
            background: 'none', border: 'none', textAlign: 'left', 
            display: 'flex', alignItems: 'center', gap: 12, 
            padding: `12px 12px 12px ${12 + (level * 20)}px`, 
            borderRadius: 10, position: 'relative' 
          }}
        >
          {item.icon && <item.icon size={20} className="nav-icon" color="rgba(255,255,255,0.6)" />}
          {!sidebarCollapsed && (
            <>
              <span className="nav-label" style={{ flex: 1, fontSize: level === 0 ? '0.875rem' : '0.8rem', fontWeight: 650, color: 'rgba(255,255,255,0.8)' }}>{item.label}</span>
              <ChevronDown size={14} color="rgba(255,255,255,0.4)" style={{ transform: expanded[item.id] ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
            </>
          )}
        </button>
        {expanded[item.id] && !sidebarCollapsed && (
          <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {item.children.map(child => (
              <NavItem 
                key={child.id || child.to} 
                item={child} 
                expanded={expanded} 
                toggleSection={toggleSection} 
                sidebarCollapsed={sidebarCollapsed} 
                mobileMenuOpen={mobileMenuOpen}
                closeMobileMenu={closeMobileMenu}
                accentColor={accentColor} 
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={closeMobileMenu}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 12, 
        padding: `12px 12px 12px ${12 + (level * 20)}px`, 
        borderRadius: 10,
        background: isActive ? accentColor : 'transparent',
        marginBottom: 4, transition: '0.2s', position: 'relative',
        boxShadow: isActive ? `0 4px 15px ${accentColor}40` : 'none'
      })}
    >
      {({ isActive }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          {item.icon && <item.icon size={20} className="nav-icon" color={isActive ? 'white' : 'rgba(255,255,255,0.6)'} />}
          {(!sidebarCollapsed || mobileMenuOpen) && (
            <span className="nav-label" style={{ fontSize: level === 0 ? '0.875rem' : '0.8rem', fontWeight: 650, color: isActive ? 'white' : 'rgba(255,255,255,0.8)' }}>
              {item.label}
            </span>
          )}
        </div>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { logout, user, isAdmin } = useAuth()
  const { sidebarCollapsed, toggleSidebar, mobileMenuOpen, closeMobileMenu } = useApp()
  const { mode, switchMode } = useAdmin()
  const navigate = useNavigate()

  const [expanded, setExpanded] = useState({
    userMgmt: false,
    transporterMgmt: false,
    bizMgmt: false
  })

  const toggleSection = (s) => setExpanded(p => ({ ...p, [s]: !p[s] }))

  const { t } = useTranslation()
  const isTransport = mode === 'transport'
  const accentColor = '#7C3AED'

  const handleLogout = async () => {
    await logout()
    navigate(isAdmin ? '/admin' : '/login')
  }

  // Navigation for Transporters
  const transportItems = [
    { to: '/transport/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/transport/bills', icon: Receipt, label: t('bills') },
    { to: '/transport/parties', icon: Users, label: t('parties') },
    { to: '/transport/vehicles', icon: Truck, label: t('vehicles') },
    { to: '/transport/trips', icon: MapPin || Monitor, label: t('trips') },
    { to: '/transport/expenses', icon: Banknote, label: 'Daily Expense' },
    { to: '/profile', icon: UserCircle, label: t('profile') },
  ]

  // Navigation for Garage Owners
  const garageItems = [
    { to: '/garage/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/garage/bills', icon: Receipt, label: t('bills') },
    { to: '/garage/parties', icon: Users, label: t('parties') },
    { to: '/garage/vehicles', icon: Truck, label: t('vehicles') },
    { to: '/garage/services', icon: Wrench, label: t('services') },
    { to: '/finance', icon: Banknote || Receipt, label: t('finance') },
    { to: '/profile', icon: UserCircle, label: t('profile') },
  ]

  // Navigation for Admins
  const adminItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/admin/users', icon: Users, label: isTransport ? "Transport Owners" : "Garage Owners" },
    { to: '/admin/manage', icon: Building2, label: isTransport ? "Transport Business" : "Garage Business" },
    { to: '/admin/billing', icon: Receipt, label: t('bills') },
    { to: '/admin/software-sales', icon: CreditCard, label: t('software_sales') },
    { to: '/admin/banners', icon: Layout, label: 'Dashboard Banners' },
    
    // Only show Trip Management in Transport Mode
    ...(isTransport ? [{ to: '/admin/trips/history', icon: MapPin, label: t('trips') }] : []),
  ]

  const navItems = isAdmin ? adminItems : (user?.role === 'transport' ? transportItems : garageItems)

  const sidebarCls = `sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`

  return (
    <aside className={sidebarCls}>
      {/* ── Close Button (Mobile Only) ── */}
      {mobileMenuOpen && (
        <button 
          onClick={closeMobileMenu}
          className="mobile-close-btn"
          style={{
            position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}
        >
          <LogOut size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
      )}

      {/* ── Branding ── */}
      <div className="flex items-center gap-3 px-6 pt-10 pb-6" style={{ cursor: 'pointer', marginBottom: 10 }} onClick={() => { navigate('/dashboard'); closeMobileMenu(); }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s'
        }}>
          <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        {!sidebarCollapsed && (
          <div style={{ lineHeight: 1 }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', fontStyle: 'italic' }}>
               TRANS
            </span>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginTop: 2 }}>
               {isAdmin ? 'Admin Panel' : (user?.role === 'transport' ? 'Transport Hub' : 'Garage Hub')}
            </div>
          </div>
        )}
      </div>

      {/* ── Mode Switcher (Admin Only) ── */}
      {!sidebarCollapsed && isAdmin && (
        <div className="px-4 mb-6">
          <div style={{
            background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 4, display: 'flex', gap: 4,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button
              onClick={() => switchMode('transport')}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: isTransport ? '#7C3AED' : 'transparent',
                color: isTransport ? 'white' : 'rgba(255,255,255,0.4)',
                fontSize: '0.72rem', fontWeight: 800, transition: '0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: isTransport ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
              }}
            >
              <Truck size={14} /> Transport
            </button>
            <button
              onClick={() => switchMode('garage')}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: !isTransport ? '#7C3AED' : 'transparent',
                color: !isTransport ? 'white' : 'rgba(255,255,255,0.4)',
                fontSize: '0.72rem', fontWeight: 800, transition: '0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: !isTransport ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
              }}
            >
              <Wrench size={14} /> Garage
            </button>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="sidebar-nav" style={{ flex: 1, padding: '0 12px' }}>
        <p style={{
          fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.25)',
          textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 12px', marginBottom: 12, marginTop: 16
        }}>Main Navigation</p>

        {navItems.map(item => (
          <NavItem 
            key={item.id || item.to} 
            item={item} 
            expanded={expanded} 
            toggleSection={toggleSection} 
            sidebarCollapsed={sidebarCollapsed}
            mobileMenuOpen={mobileMenuOpen}
            closeMobileMenu={closeMobileMenu}
            accentColor={accentColor} 
          />
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer" style={{ padding: 18, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}
        >
          <div className="avatar" style={{ 
            width: 38, height: 38, borderRadius: 10, 
            background: user?.logoUrl ? 'transparent' : 'linear-gradient(135deg, #7C3AED, #A855F7)', 
            color: 'white', fontWeight: 900, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
             {user?.logoUrl ? (
               <img src={user.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             ) : (
               user?.name?.[0]?.toUpperCase() || 'A'
             )}
          </div>
          {!sidebarCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '0.8125rem', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.businessName || user?.name || (isAdmin ? 'Super Admin' : 'Business Owner')}</p>
              <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{isAdmin ? (isTransport ? 'Transport Ops' : 'Garage Ops') : (user?.role?.toUpperCase())}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="btn-icon"
          style={{ width: '100%', background: 'rgba(255,100,100,0.08)', padding: '10px', borderRadius: 10, color: '#FF6B6B', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: 'none', cursor: 'pointer' }}
        >
          <LogOut size={18} /> {!sidebarCollapsed && t('logout')}
        </button>
      </div>

      <button 
        className="sidebar-toggle-btn"
        onClick={toggleSidebar} 
        style={{
          position: 'absolute', top: 50, right: -12, width: 24, height: 24, borderRadius: '50%', background: accentColor, border: '2px solid #111',
          color: 'white', cursor: 'pointer', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        {sidebarCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
      </button>

      <style>{`
        .sidebar { background: #0f1014; color: rgba(255,255,255,0.8); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border-right: 1px solid rgba(255,255,255,0.05); }
        .nav-item:hover:not(.active) { background: rgba(255,255,255,0.03); }
        .nav-item.active { color: white !important; }
        .nav-item.active .nav-label { color: white !important; }
      `}</style>
    </aside>
  )
}
