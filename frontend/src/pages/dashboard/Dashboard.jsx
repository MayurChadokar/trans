import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import TransportDashboard from '../transport/TransportDashboard'
import GarageDashboard   from '../garage/GarageDashboard'
import AdminDashboard     from '../admin/AdminDashboard'

export default function Dashboard() {
  const { user } = useAuth()
  const role = user?.role

  if (role === 'admin')     return <Navigate to="/admin/dashboard" replace />
  if (role === 'garage')    return <Navigate to="/garage/dashboard" replace />
  if (role === 'transport') return <Navigate to="/transport/dashboard" replace />

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h3>Invalid Role</h3>
      <p>Please contact support or re-login.</p>
    </div>
  )
}
