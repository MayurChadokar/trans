import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Plus, Users, UserCircle, Truck, MapPin, Wrench, Banknote
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAdmin } from '../../context/AdminContext'
import { useTranslation } from 'react-i18next'

export default function BottomNav() {
  const { user, isAdmin } = useAuth()
  const { mode } = useAdmin()
  const navigate = useNavigate()

  const { t } = useTranslation()
  const isTransport = isAdmin ? (mode === 'transport') : (user?.role === 'transport')
  const modulePrefix = isTransport ? '/transport' : '/garage'
  
  // Define nav items for different roles/modes
  const leftItems = [
    { to: `${modulePrefix}/dashboard`, icon: LayoutDashboard, label: t('dashboard') },
    { to: `${modulePrefix}/bills`,     icon: FileText,        label: t('bills') },
  ]

  const rightItems = [
    { to: `${modulePrefix}/parties`,   icon: Users,           label: t('parties') },
    { to: '/profile',                  icon: UserCircle,      label: t('profile') },
  ]

  const handleNewClick = () => {
    if (isTransport) {
      navigate('/transport/trips')
    } else {
      navigate('/garage/bills/new')
    }
  }

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Bottom navigation">
      <div className="bottom-nav-inner">
        {/* Left Side */}
        {leftItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.endsWith('dashboard')}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <div className="bottom-nav-icon-wrap">
              <item.icon size={22} />
            </div>
            <span className="bottom-nav-label">
              {item.label}
            </span>
          </NavLink>
        ))}

        {/* Center PLUS FAB */}
        <button
          className="bottom-nav-fab"
          id="btn-create-new"
          onClick={handleNewClick}
          aria-label={isTransport ? t('new_trip') : 'New Job Card'}
        >
          <div className="fab-btn">
            <Plus size={28} color="white" strokeWidth={3} />
          </div>
          <span className="bottom-nav-label" style={{ marginTop: 6 }}>
            {isTransport ? 'Log New Trip' : 'New Job Card'}
          </span>
        </button>

        {/* Right Side */}
        {rightItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <div className="bottom-nav-icon-wrap">
              <item.icon size={22} />
            </div>
            <span className="bottom-nav-label">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
