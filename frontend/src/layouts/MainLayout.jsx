import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import BottomNav from '../components/layout/BottomNav'
import TopHeader from '../components/layout/TopHeader'
import MobileHeader from '../components/layout/MobileHeader'
import { useApp } from '../context/AppContext'

// Map route → page title & subtitle
const pageMeta = {
  '/dashboard':           { title: 'Dashboard',      subtitle: 'Overview of your business' },
  '/bills':               { title: 'Bills',          subtitle: 'All invoices & transactions' },
  '/bills/new':           { title: 'Create Bill',    subtitle: null },
  '/parties':             { title: 'Parties',        subtitle: 'Manage your clients' },
  '/finance':             { title: 'Finance',        subtitle: 'Reports & transactions' },
  '/profile':             { title: 'Profile',        subtitle: 'Business & account info' },
  '/transport/trips':     { title: 'Trips',          subtitle: 'Manage transport trips' },
  '/transport/vehicles':  { title: 'Vehicles',       subtitle: 'Your fleet' },
  '/garage/vehicles':     { title: 'Vehicles',       subtitle: 'Customer vehicles' },
  '/garage/services':     { title: 'Services',       subtitle: 'Service records' },
  '/admin/dashboard':     { title: 'Admin Panel',    subtitle: 'System overview' },
  '/admin/users':         { title: 'User Management',subtitle: 'Manage platform users' },
  '/admin/ads':           { title: 'Advertisements', subtitle: 'Manage banner ads' },
  '/admin/billing':       { title: 'Billing Monitor',subtitle: 'All system bills' },
  '/admin/reports':       { title: 'Reports',        subtitle: 'Revenue & usage analytics' },
  '/admin/software-sales': { title: null, subtitle: null }, // Handled dynamically
}

export default function MainLayout() {
  const { sidebarCollapsed, mobileMenuOpen, closeMobileMenu } = useApp()
  const location = useLocation()
  const isTransport = (localStorage.getItem('view_mode') || 'transport') === 'transport'

  let meta = pageMeta[location.pathname] || { title: 'TRANS', subtitle: null }

  if (location.pathname === '/admin/software-sales') {
    meta = {
      title: isTransport ? 'Transporter Sales' : 'Garage Sales',
      subtitle: `Manage ${isTransport ? 'transporter' : 'garage'} deals & payments`
    }
  }

  // On bill detail pages, show back arrow
  const showBack = location.pathname !== '/dashboard' &&
    (location.pathname.startsWith('/bills/') ||
     location.pathname.startsWith('/parties/') ||
     location.pathname.startsWith('/transport/') ||
     location.pathname.startsWith('/garage/') ||
     location.pathname.startsWith('/admin/'))

  return (
    <div className="app-layout">
      {/* Mobile Drawer Backdrop */}
      <div 
        className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`} 
        onClick={closeMobileMenu}
      />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        {/* Desktop top header */}
        <TopHeader title={meta.title} subtitle={meta.subtitle} />

        {/* Mobile sticky header */}
        <MobileHeader
          title={meta.title}
          showBack={showBack}
          showNotif={true}
        />

        {/* Page content */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navbar */}
      <BottomNav />
    </div>
  )
}
