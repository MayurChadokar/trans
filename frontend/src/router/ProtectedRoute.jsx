import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

/**
 * ProtectedRoute — wraps any routes that need authentication
 * Props:
 *   requireRole — if set, user must have this role (or 'admin' bypasses)
 */
export default function ProtectedRoute({ requireRole }) {
  const { isAuthenticated, hasRole, user, loading } = useAuth()

  // While hydrating from localStorage, show spinner
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 16
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'linear-gradient(135deg, var(--primary-light), var(--primary-dark))',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>BP</span>
        </div>
        <Loader2 size={22} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Not logged in → login page
  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Logged in but no role selected yet → role select
  if (!hasRole) return <Navigate to="/role-select" replace />

  // Role-gated route check
  if (requireRole && user?.role !== requireRole) {
    // If mismatch, send to their own specific module home
    const dest = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'
    return <Navigate to={dest} replace />
  }

  // Role-specific Onboarding & Subscription Enforcement
  if ((user?.role === 'transport' || user?.role === 'garage') && user?.id) {
    const rolePrefix = user.role;
    const currentPath = window.location.pathname;
    const isOnboardingPath = currentPath === `/register/${rolePrefix}` || 
                             currentPath === '/setup/vehicles' || 
                             currentPath === '/subscription' ||
                             currentPath === '/role-select' ||
                             currentPath === '/language-select';

    // 1. Force Profile Registration
    if (!user.setupComplete) {
      if (currentPath !== `/register/${rolePrefix}`) return <Navigate to={`/register/${rolePrefix}`} replace />;
    } 
    // 2. Force Vehicle Setup (Transport only) and Subscription
    else if (!user.subscriptionActive) {
      if (!isOnboardingPath) {
        // Transport needs vehicle setup first, Garage goes straight to subscription
        const nextStep = (rolePrefix === 'transport') ? '/setup/vehicles' : '/subscription';
        return <Navigate to={nextStep} replace />;
      }
    }
    // 3. Expiry Check
    else {
      const isExpired = user.subscriptionExpiry && new Date(user.subscriptionExpiry).getTime() < Date.now();
      if (isExpired && !isOnboardingPath) {
        return <Navigate to="/subscription" replace />;
      }
    }
  }

  return <Outlet />
}
