import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Bell, Search, Menu, X, ChevronDown, FileText,
  LogOut, Settings, UserCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function TopHeader({ title, subtitle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate(user?.role === 'admin' ? '/admin' : '/login')
  }

  const displayName = user?.businessName || user?.name || ''
  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.phone?.slice(-2) || '??'

  return (
    <header className="top-header">
      {/* Left — page title */}
      <div>
        {title && <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>}
        {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search (Hide for Admin) */}
        {!user?.role?.includes('admin') && (
          <button 
            className="btn-icon" 
            aria-label="Search" 
            id="btn-header-search"
            onClick={() => navigate(location.pathname.startsWith('/transport') ? '/transport/bills' : '/garage/bills')}
            style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 10, width: 36, height: 36, cursor: 'pointer' }}
          >
            <Search size={18} />
          </button>
        )}

        {/* Notifications */}
        <button
          className="btn-icon"
          aria-label="Notifications"
          id="btn-header-notifications"
          onClick={() => alert('No new notifications. You are all caught up! ✨')}
          style={{ position: 'relative', background: 'rgba(0,0,0,0.05)', borderRadius: 10, width: 36, height: 36, cursor: 'pointer' }}
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--danger)', border: '1.5px solid white'
          }} />
        </button>

        {/* Profile dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            id="btn-header-profile"
            onClick={() => setProfileOpen(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'transparent', border: 'none',
              cursor: 'pointer', padding: '4px 8px', borderRadius: 'var(--radius-md)',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div className="avatar avatar-sm">{initials}</div>
            <div style={{ textAlign: 'left', lineHeight: 1.3 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user?.businessName || user?.name || 'User'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {user?.role || 'User'}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)"
              style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                onClick={() => setProfileOpen(false)}
              />
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                minWidth: 180, zIndex: 100, overflow: 'hidden',
                animation: 'fadeInUp 0.15s ease both'
              }}>
                <button
                  onClick={() => { navigate('/profile'); setProfileOpen(false) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: 10, padding: '11px 16px', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <UserCircle size={16} color="var(--text-muted)" /> Profile
                </button>
                <button
                  onClick={() => { navigate('/profile/settings'); setProfileOpen(false) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: 10, padding: '11px 16px', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <Settings size={16} color="var(--text-muted)" /> Settings
                </button>
                <div className="divider" style={{ margin: 0 }} />
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: 10, padding: '11px 16px', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: '0.875rem', color: 'var(--danger)',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
