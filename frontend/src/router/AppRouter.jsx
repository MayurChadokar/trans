import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'

// Layouts
import AuthLayout     from '../layouts/AuthLayout'
import MainLayout     from '../layouts/MainLayout'
import ProtectedRoute from './ProtectedRoute'

// Auth pages (eager)
import Login      from '../pages/auth/Login'
import AdminLogin from '../pages/auth/AdminLogin'
import OTPVerify  from '../pages/auth/OTPVerify'
import RoleSelect from '../pages/auth/RoleSelect'
import TransportRegistration from '../pages/auth/TransportRegistration'
import GarageRegistration    from '../pages/auth/GarageRegistration'
import TransportVehicleSetup from '../pages/auth/TransportVehicleSetup'
import SubscriptionPlans     from '../pages/auth/SubscriptionPlans'
import LanguageSelect       from '../pages/auth/LanguageSelect'


import TransportDashboard from '../pages/transport/TransportDashboard'
import GarageDashboard    from '../pages/garage/GarageDashboard'
import AdminDashboard     from '../pages/admin/AdminDashboard'

// App pages (lazy)
const Dashboard        = lazy(() => import('../pages/dashboard/Dashboard'))
const BillList         = lazy(() => import('../pages/bills/BillList'))
const CreateBill       = lazy(() => import('../pages/bills/CreateBill'))
const BillDetail       = lazy(() => import('../pages/bills/BillDetail'))
const Finance          = lazy(() => import('../pages/finance/Finance'))
const Profile          = lazy(() => import('../pages/profile/Profile'))
const BusinessProfile  = lazy(() => import('../pages/profile/BusinessProfile'))
const BankDetails      = lazy(() => import('../pages/profile/BankDetails'))
const QRCode           = lazy(() => import('../pages/profile/QRCode'))
const AddMovement      = lazy(() => import('../pages/finance/AddMovement'))
const UserProfile      = lazy(() => import('../pages/profile/UserProfile'))

// Phase 2 — Party management
const PartyList        = lazy(() => import('../pages/parties/PartyList'))
const AddParty         = lazy(() => import('../pages/parties/AddParty'))
const PartyDetail      = lazy(() => import('../pages/parties/PartyDetail'))

// Phase 2 — Transport
const TransportVehicleList = lazy(() => import('../pages/transport/VehicleList'))
const AddVehicle           = lazy(() => import('../pages/transport/AddVehicle'))
const TripManagement       = lazy(() => import('../pages/transport/TripManagement'))
const DailyExpense         = lazy(() => import('../pages/transport/DailyExpense'))

// Phase 2 — Garage
const GarageVehicles = lazy(() => import('../pages/garage/GarageVehicles'))
const AddGarageVehicle = lazy(() => import('../pages/garage/AddGarageVehicle'))
const GarageServices = lazy(() => import('../pages/garage/GarageServices'))

// Insurance Module
const InsuranceHome = lazy(() => import('../pages/insurance/InsuranceHome'))
const InsuranceForm = lazy(() => import('../pages/insurance/InsuranceForm'))

// Admin pages
const AdminUsers     = lazy(() => import('../pages/admin/UserManagement'))
const AdminBilling   = lazy(() => import('../pages/admin/BillingMonitor'))
const AdminSettings  = lazy(() => import('../pages/admin/SystemSettings'))
const AdminManage    = lazy(() => import('../pages/admin/ManageBusiness'))
const Specialized    = lazy(() => import('../pages/admin/SpecializedManagement'))
const AdminNotifications = lazy(() => import('../pages/admin/AdminNotifications'))
const GarageServiceLogs  = lazy(() => import('../pages/admin/GarageServiceLogs'))
const TripHistoryLogs    = lazy(() => import('../pages/admin/TripHistoryLogs'))
const AdminFinance     = lazy(() => import('../pages/admin/finance/FinanceModule'))
const SoftwareSales     = lazy(() => import('../pages/admin/SoftwareSales'))
const AdminBanners      = lazy(() => import('../pages/admin/AdminBanners'))

// Loader fallback
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <Loader2 size={28} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

export default function AppRouter() {
  const { isAuthenticated, hasRole, user } = useAuth()

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={
        isAuthenticated 
          ? <Navigate to="/dashboard" replace /> 
          : <Navigate to="/login" replace />
      } />

      {/* ── Auth (public) ── */}
      <Route element={<Suspense fallback={<PageLoader />}><AuthLayout /></Suspense>}>
        <Route path="/login"         element={<Login />} />
        <Route path="/admin"         element={<AdminLogin />} />
        <Route path="/admin-login"   element={<Navigate to="/admin" replace />} />
        <Route path="/otp"           element={<OTPVerify />} />
        <Route path="/role-select"   element={<RoleSelect />} />
        <Route path="/register/transport" element={<TransportRegistration />} />
        <Route path="/register/garage"    element={<GarageRegistration />} />
        <Route path="/setup/vehicles"     element={<TransportVehicleSetup />} />
        <Route path="/subscription"       element={<SubscriptionPlans />} />
        <Route path="/language-select"   element={<LanguageSelect />} />
      </Route>

      {/* ── App (protected) ── */}
      <Route element={<ProtectedRoute />}>
        {/* MainLayout should NOT be inside Suspense so it never unmounts during lazy loading */}
        <Route element={<MainLayout />}>
          <Route element={<Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>}>

            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Finance */}
            <Route path="/finance" element={<Finance />} />
            <Route path="/finance/add" element={<AddMovement />} />

            {/* Profile */}
            <Route path="/profile"             element={<Profile />} />
            <Route path="/profile/edit"        element={<UserProfile />} />
            <Route path="/profile/business"    element={<BusinessProfile />} />
            <Route path="/profile/bank"        element={<BankDetails />} />
            <Route path="/profile/qr"          element={<QRCode />} />

            {/* ── Transport Module ── */}
            <Route element={<ProtectedRoute requireRole="transport" />}>
              <Route path="/transport/dashboard"         element={<TransportDashboard />} />
              <Route path="/transport/bills"             element={<BillList type="transport" />} />
              <Route path="/transport/bills/new"         element={<CreateBill />} />
              <Route path="/transport/bills/edit/:id"    element={<CreateBill />} />
              <Route path="/transport/parties"           element={<PartyList type="transport" />} />
              <Route path="/transport/parties/add"       element={<AddParty />} />
              <Route path="/transport/parties/edit/:id"  element={<AddParty />} />
              <Route path="/transport/parties/:id"       element={<PartyDetail />} />
              <Route path="/transport/vehicles"          element={<TransportVehicleList />} />
              <Route path="/transport/vehicles/add"      element={<AddVehicle />} />
              <Route path="/transport/vehicles/edit/:id" element={<AddVehicle />} />
              <Route path="/transport/trips"             element={<TripManagement />} />
              <Route path="/transport/expenses"          element={<DailyExpense />} />
            </Route>

            {/* ── Garage Module ── */}
            <Route element={<ProtectedRoute requireRole="garage" />}>
              <Route path="/garage/dashboard"         element={<GarageDashboard />} />
              <Route path="/garage/bills"             element={<BillList type="garage" />} />
              <Route path="/garage/bills/new"         element={<CreateBill />} />
              <Route path="/garage/bills/edit/:id"    element={<CreateBill />} />
              <Route path="/garage/parties"           element={<PartyList type="garage" />} />
              <Route path="/garage/parties/add"       element={<AddParty />} />
              <Route path="/garage/parties/edit/:id"  element={<AddParty />} />
              <Route path="/garage/parties/:id"       element={<PartyDetail />} />
              <Route path="/garage/vehicles"          element={<GarageVehicles />} />
              <Route path="/garage/vehicles/add"      element={<AddGarageVehicle />} />
              <Route path="/garage/vehicles/edit/:id" element={<AddGarageVehicle />} />
              <Route path="/garage/services"          element={<GarageServices />} />
            </Route>

            {/* ── Insurance Module ── */}
            <Route path="/insurance" element={<InsuranceHome />} />
            <Route path="/insurance/form/:type" element={<InsuranceForm />} />

            {/* ── Admin Module ── */}
            <Route element={<ProtectedRoute requireRole="admin" />}>
              <Route path="/admin/dashboard"  element={<AdminDashboard />} />
              <Route path="/admin/users"      element={<AdminUsers />} />
              <Route path="/admin/drivers"    element={<Specialized />} />
              <Route path="/admin/mechanics"  element={<Specialized />} />
              <Route path="/admin/staff"      element={<Specialized />} />
              <Route path="/admin/manage"     element={<AdminManage />} />
              <Route path="/admin/billing"    element={<AdminBilling />} />
              <Route path="/admin/settings"   element={<AdminSettings />} />
              <Route path="/admin/finance"    element={<AdminFinance />} />
              <Route path="/admin/software-sales" element={<SoftwareSales />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/services/garage" element={<GarageServiceLogs />} />
              <Route path="/admin/trips/history" element={<TripHistoryLogs />} />
              <Route path="/admin/banners" element={<AdminBanners />} />
            </Route>

            {/* Shared Bills View */}
            <Route path="/bills/new" element={<CreateBill />} />
            <Route path="/bills/:id" element={<BillDetail />} />

          </Route>
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
