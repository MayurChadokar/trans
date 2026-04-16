import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Plus, Users, UserCircle, Truck, MapPin, Wrench, Banknote
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAdmin } from '../../context/AdminContext'

export default function BottomNav() {
  const { user, isAdmin } = useAuth()
  const { mode } = useAdmin()
  const navigate = useNavigate()

  const isTransport = isAdmin ? (mode === 'transport') : (user?.role === 'transport')
  const modulePrefix = isTransport ? '/transport' : '/garage'
  
  // Define nav items for different roles/modes
  const leftItems = [
    { to: `${modulePrefix}/dashboard`, icon: LayoutDashboard, label: 'Home' },
    { to: `${modulePrefix}/bills`,     icon: FileText,        label: 'Bills' },
  ]

  const rightItems = [
    { to: `${modulePrefix}/parties`,   icon: Users,           label: 'Parties' },
    { to: '/profile',                  icon: UserCircle,      label: 'Profile' },
  ]

  const handleNewClick = () => {
    navigate(`${modulePrefix}/bills/new`)
  }

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Bottom navigation">
      <div className="bottom-nav-inner" style={{ gap: 0, overflowX: 'auto', padding: '0 4px', scrollbarWidth: 'none' }}>
        {/* Left Side */}
        {leftItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            style={{ minWidth: 54 }}
          >
            <div className="bottom-nav-icon-wrap">
              <item.icon size={20} />
            </div>
            <span className="bottom-nav-label" style={{ fontSize: '0.6rem' }}>{item.label}</span>
          </NavLink>
        ))}

        {/* Center PLUS FAB */}
        <button
          className="bottom-nav-fab"
          id="btn-create-new"
          onClick={handleNewClick}
          style={{ padding: '0 8px' }}
        >
          <div className="fab-btn" style={{ width: 46, height: 46, marginTop: -24 }}>
            <Plus size={24} color="white" />
          </div>
          <span style={{ fontSize: '0.6rem' }}>New</span>
        </button>

        {/* Right Side */}
        {rightItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            style={{ minWidth: 54 }}
          >
            <div className="bottom-nav-icon-wrap">
              <item.icon size={20} />
            </div>
            <span className="bottom-nav-label" style={{ fontSize: '0.6rem' }}>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
