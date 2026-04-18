import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Sidebar from '../components/layout/Sidebar'
import BottomNav from '../components/layout/BottomNav'
import TopHeader from '../components/layout/TopHeader'
import MobileHeader from '../components/layout/MobileHeader'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'


export default function MainLayout() {
  const { t } = useTranslation()
  const { sidebarCollapsed, mobileMenuOpen, closeMobileMenu } = useApp()
  const { user } = useAuth()
  const location = useLocation()
  const isTransport = (localStorage.getItem('view_mode') || 'transport') === 'transport'

  // Safety: If somehow a user lands on a path that doesn't match their role
  // (Defense-in-depth in case of manual URL manipulation)
  if (user && user.role) {
    if (location.pathname.startsWith('/admin') && user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />
    }
    if (location.pathname.startsWith('/transport') && user.role !== 'transport' && user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />
    }
    if (location.pathname.startsWith('/garage') && user.role !== 'garage' && user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />
    }
  }

  const pageMeta = {
    '/transport/dashboard': { title: t('dashboard'), subtitle: 'Overview of logistics' },
    '/transport/bills': { title: t('bills'), subtitle: 'Freight & consolidated invoices' },
    '/transport/parties': { title: t('parties'), subtitle: 'Manage your transport clients' },
    '/garage/dashboard': { title: t('dashboard'), subtitle: 'Overview of service workshop' },
    '/garage/bills': { title: t('bills'), subtitle: 'Service & spare invoices' },
    '/garage/parties': { title: t('parties'), subtitle: 'Manage your garage customers' },
    '/finance': { title: t('finance'), subtitle: 'Reports & transactions' },
    '/profile': { title: t('profile'), subtitle: 'Business & account info' },
    '/transport/trips': { title: t('trips'), subtitle: 'Manage transport trips' },
    '/transport/vehicles': { title: t('vehicles'), subtitle: 'Your fleet' },
    '/garage/vehicles': { title: t('vehicles'), subtitle: 'Customer vehicles' },
    '/garage/services': { title: t('services'), subtitle: 'Service records' },
    '/admin/dashboard': { title: t('admin'), subtitle: 'System overview' },
    '/admin/users': { title: t('user_mgmt'), subtitle: 'Manage platform users' },
    '/admin/billing': { title: t('bills'), subtitle: 'All system bills' },
    '/admin/software-sales': { title: null, subtitle: null },
  }

  let meta = pageMeta[location.pathname] || { title: 'TRANS', subtitle: null }

  if (location.pathname === '/admin/software-sales') {
    meta = {
      title: isTransport ? t('transport') + ' ' + t('software_sales') : t('garage') + ' ' + t('software_sales'),
      subtitle: `Manage ${isTransport ? 'transporter' : 'garage'} deals & payments`
    }
  }

  // Global Navigation: Level 1 pages (Dashboard, main lists) get Hamburger. 
  // Level 2+ pages (Details, Forms) get Back Button.
  const pathParts = location.pathname.split('/').filter(Boolean)

  // Decide if this is a main top-level page
  const isTopLevel = pathParts.length <= 1 ||
    (pathParts.length === 2 && (pathParts[1] === 'dashboard' || pathParts[1] === 'bills' || pathParts[1] === 'parties' || pathParts[1] === 'vehicles' || pathParts[1] === 'services'))

  const showBack = !isTopLevel && location.pathname !== '/dashboard' && !location.pathname.endsWith('/dashboard')

  return (
    <div className={`app-layout ${location.pathname.startsWith('/admin') ? 'admin-layout' : ''}`}>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        {/* Desktop top header (Only for Non-Admin) */}
        {!location.pathname.startsWith('/admin') && <TopHeader title={meta.title} subtitle={meta.subtitle} />}

        {/* Mobile sticky header (Only for Non-Admin) */}
        {!location.pathname.startsWith('/admin') && (
          <MobileHeader
            title={meta.title}
            showBack={showBack}
            showNotif={true}
          />
        )}

        {/* Page content */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navbar */}
      {!location.pathname.startsWith('/admin') && <BottomNav />}
    </div>
  )
}
