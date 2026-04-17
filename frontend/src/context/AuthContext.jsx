import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { sendOtp, verifyOtp as verifyOtpApi, setUserRole, updateUserProfile, transportRegister, garageRegister, getMe, logoutApi, adminLogoutApi } from '../api/authApi'

const AuthContext = createContext(null)

function stripLargeFields(u) {
  if (!u) return u
  const {
    // keep known-small, app-critical fields
    id, phone, name, role, businessName, setupComplete,
    email, address, city, pincode, panNo, gstin, aadharNo,
    bankDetails, logoUrl, signatureUrl, documents,
    subscriptionActive, subscriptionExpiry, planName, allowedVehicles,
    // drop anything else potentially large
    ...rest
  } = u

  const safe = {
    id, phone, name, role, businessName, setupComplete,
    email, address, city, pincode, panNo, gstin, aadharNo,
    bankDetails,
    subscriptionActive, subscriptionExpiry, planName, allowedVehicles,
    logoUrl: typeof logoUrl === 'string' && logoUrl.startsWith('data:') ? null : (logoUrl || null),
    signatureUrl: typeof signatureUrl === 'string' && signatureUrl.startsWith('data:') ? null : (signatureUrl || null),
    documents: documents && typeof documents === 'object' ? documents : undefined,
  }

  // remove undefined keys
  Object.keys(safe).forEach(k => safe[k] === undefined && delete safe[k])
  // prevent accidental huge objects getting persisted
  void rest
  return safe
}

function safeSetBillingUser(u) {
  try {
    localStorage.setItem('billing_user', JSON.stringify(stripLargeFields(u)))
  } catch (e) {
    // if quota exceeded, fall back to minimal identity
    try {
      const minimal = u ? { id: u.id, phone: u.phone, role: u.role, name: u.name, businessName: u.businessName } : null
      if (minimal) localStorage.setItem('billing_user', JSON.stringify(minimal))
      else localStorage.removeItem('billing_user')
    } catch (_) {
      try { localStorage.removeItem('billing_user') } catch (_) { /* ignore */ }
    }
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [sendingOTP, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError]       = useState('')
  const [adminModule, setAdminModule] = useState(localStorage.getItem('admin_module') || 'Transport')

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      try {
        const saved = localStorage.getItem('billing_user')
        if (saved) setUser(JSON.parse(saved))
      } catch (_) {
        localStorage.removeItem('billing_user')
      }

      try {
        const me = await getMe()
        if (!cancelled && me?.success) {
          const profile = me.user || me.admin
          if (profile) {
            setUser(profile)
            safeSetBillingUser(profile)
          }
        }
      } catch (_) {
        // If access token is expired, apiClient interceptor will refresh and retry once.
        // If refresh fails, it redirects to /login and clears storage.
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    hydrate()
    return () => { cancelled = true }
  }, [])

  const clearError = useCallback(() => setError(''), [])

  const sendOTP = useCallback(async (phone) => {
    setSending(true)
    setError('')
    try {
      return await sendOtp(phone)
    } catch (e) {
      setError('Failed to send OTP. Please try again.')
      return { success: false }
    } finally {
      setSending(false)
    }
  }, [])

  const verifyOTP = useCallback(async (phone, otp) => {
    setVerifying(true)
    setError('')
    try {
      const res = await verifyOtpApi(phone, otp)
      if (res.success) {
        setUser(res.user)
        safeSetBillingUser(res.user)
        if (res.accessToken) localStorage.setItem('access_token', res.accessToken)
      } else {
        setError(res.message)
      }
      return res
    } catch (e) {
      setError('Verification failed. Please try again.')
      return { success: false }
    } finally {
      setVerifying(false)
    }
  }, [])

  const setRole = useCallback((role) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, role, isNewUser: false }
      safeSetBillingUser(updated)
      return updated
    })
    // fire-and-forget: persist role on backend as well
    try {
      const saved = localStorage.getItem('billing_user')
      const phone = saved ? JSON.parse(saved)?.phone : user?.phone
      if (phone) setUserRole(phone, role)
    } catch (_) {
      // ignore
    }
  }, [user])

  const updateProfile = useCallback(async (profileData) => {
    try {
      const { updateProfile: updateProfileApi } = await import('../api/profileApi')
      const res = await updateProfileApi(profileData)
      
      if (res.success && res.user) {
        setUser(res.user)
        safeSetBillingUser(res.user)
        return res
      }
      return res
    } catch (e) {
      console.error('Update profile API failed:', e)
      return { success: false, message: e.message }
    }
  }, [])

  const completeTransportSetup = useCallback(async (profileData) => {
    try {
      const res = await transportRegister(profileData)
      if (res.success) {
        setUser(res.user)
        safeSetBillingUser(res.user)
      }
      return res
    } catch (e) {
      return { success: false, message: 'Registration failed' }
    }
  }, [])

  const completeGarageSetup = useCallback(async (profileData) => {
    try {
      const res = await garageRegister(profileData)
      if (res.success) {
        setUser(res.user)
        safeSetBillingUser(res.user)
      }
      return res
    } catch (e) {
      return { success: false, message: 'Registration failed' }
    }
  }, [])

  const logout = useCallback(async () => {
    const role = user?.role
    setUser(null)
    localStorage.removeItem('billing_user')
    localStorage.removeItem('access_token')
    try {
      if (role === 'admin') await adminLogoutApi()
      else await logoutApi()
    } catch (_) {
      // ignore
    }
  }, [user?.role])

  const switchAdminModule = useCallback((moduleName) => {
    setAdminModule(moduleName)
    localStorage.setItem('admin_module', moduleName)
  }, [])

  const login = useCallback(async (userData) => {
    setUser(userData)
    localStorage.setItem('billing_user', JSON.stringify(userData))
    return { success: true, user: userData }
  }, [])

  const value = {
    user,
    loading,
    sendingOTP,
    verifying,
    error,
    clearError,
    sendOTP,
    verifyOTP,
    setRole,
    updateProfile,
    completeTransportSetup,
    completeGarageSetup,
    logout,
    login,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isTransport: user?.role === 'transport',
    isGarage: user?.role === 'garage',
    hasRole: !!user?.role,
    adminModule,
    switchAdminModule,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
