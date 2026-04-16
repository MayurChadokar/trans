import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import * as adminApi from '../api/adminApi'

const AdminContext = createContext(null)

/* ─── helpers ─── */
const lsKey = (mode, entity) => `admin_${mode}_${entity}`

const load = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] }
}
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data))

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

const today = () => new Date().toISOString().split('T')[0]

/* ─── initial seed (only if empty or khali array) ─── */
const seedIfEmpty = (key, rows) => {
  const existing = localStorage.getItem(key)
  if (!existing || existing === '[]' || (rows.length > 0 && JSON.parse(existing).length === 0)) {
     save(key, rows)
  }
}

// Seed transport data
seedIfEmpty(lsKey('transport', 'users'), [
  { 
    id: 'u1', name: 'Vivek Sharma', email: 'vivek@radhe.com', role: 'transport', status: 'Active', joinedAt: today(),
    documents: [
      { label: 'Aadhaar Card', type: 'id', url: '#' },
      { label: 'PAN Card', type: 'pan', url: '#' },
      { label: 'Driving License', type: 'dl', url: '#' }
    ]
  },
  { id: 'u2', name: 'Rajesh Gupta', email: 'rajesh@maruti.com', role: 'transport', status: 'Active', joinedAt: today() }
])
seedIfEmpty(lsKey('transport', 'businesses'), [
  { id: 'biz-1', name: 'Radhe Tempo Service', ownerName: 'Vivek Sharma', phone: '9812345678', city: 'Jaipur', status: 'Active', joinedAt: today(), kycStatus: 'Verified' },
  { id: 'biz-2', name: 'Maruti Logistics', ownerName: 'Rajesh Gupta', phone: '9876501234', city: 'Gurgaon', status: 'Active', joinedAt: today(), kycStatus: 'Pending' },
  { id: 'biz-3', name: 'Swift Cargo Pvt Ltd', ownerName: 'Ankit Verma', phone: '9988776655', city: 'Ahmedabad', status: 'Active', joinedAt: today(), kycStatus: 'Rejected' }
])
seedIfEmpty(lsKey('transport', 'invoices'), [
  { id: 'TRN-1001', businessName: 'Radhe Tempo', userName: 'Client A', total: 12500, status: 'Paid', date: today() },
  { id: 'TRN-1002', businessName: 'Maruti Logistics', userName: 'Client B', total: 8400, status: 'Pending', date: today() },
  { id: 'TRN-1003', businessName: 'Swift Cargo', userName: 'Client C', total: 15600, status: 'Paid', date: today() }
])
seedIfEmpty(lsKey('transport', 'drivers'), [])
seedIfEmpty(lsKey('transport', 'staff'), [])
seedIfEmpty(lsKey('transport', 'vehicles'), [
  { id: 'v1', ownerId: 'u1', ownerName: 'Vivek Sharma', plateNo: 'RJ14 GB 1234', type: 'Tempo', status: 'Active', model: 'Tata Ace' },
  { id: 'v2', ownerId: 'u2', ownerName: 'Rajesh Gupta', plateNo: 'HR55 XY 9876', type: 'Truck', status: 'Active', model: 'Eicher 10.90' },
  { id: 'v3', ownerId: 'u3', ownerName: 'Demo Transporter', plateNo: 'MH12 AB 0001', type: 'Tempo', status: 'Active', model: 'Force Traveller' },
  { id: 'v4', ownerId: 'u1', ownerName: 'Vivek Sharma', plateNo: 'RJ14 CC 4567', type: 'Container', status: 'In Service', model: 'Mahindra Blazo' }
])

// Seed garage data
seedIfEmpty(lsKey('garage', 'users'), [
  { 
    id: 'u3', name: 'Suresh Kumar', phone: '9876543210', email: 'suresh@reliable.com', role: 'garage', status: 'Active', joinedAt: today(),
    documents: [
       { label: 'Workshop License', type: 'license', url: '#' },
       { label: 'GST Certificate', type: 'gst', url: '#' }
    ]
  },
  { id: 'u4', name: 'Amit Singh', phone: '9922334455', email: 'amit@cityauto.com', role: 'garage', status: 'Active', joinedAt: today() },
  { id: 'u5', name: 'Vinay Shah', phone: '8877665544', email: 'vinay@modern.com', role: 'garage', status: 'Active', joinedAt: today() }
])
seedIfEmpty(lsKey('garage', 'businesses'), [
  { id: 'gb-1', name: 'City Auto Workshop', ownerName: 'Rajesh Kumar', phone: '9876543210', location: 'Main Road', city: 'Delhi', status: 'Active', joinedAt: today(), kycStatus: 'Verified' },
  { id: 'gb-2', name: 'Reliable Repairs', ownerName: 'Suresh Kumar', phone: '9911223344', location: 'Okhla Phase 3', city: 'Delhi', status: 'Active', joinedAt: today(), kycStatus: 'Pending' },
  { id: 'gb-3', name: 'Modern Garage Inc', ownerName: 'Deepak Pal', phone: '8877665544', location: 'Andheri West', city: 'Mumbai', status: 'Active', joinedAt: today(), kycStatus: 'Pending' }
])
seedIfEmpty(lsKey('garage', 'invoices'), [
  { 
    id: 'GRG-452101', businessId: 'gb-1', businessName: 'City Auto Workshop', userName: 'Amit Singh', 
    total: 4500, status: 'Paid', date: today(), 
    items: [
      { description: 'Full Oil Service', qty: 1, rate: 2500, amount: 2500 },
      { description: 'Brake Pad Set', qty: 1, rate: 1500, amount: 1500 },
      { description: 'Labour Charge', qty: 1, rate: 500, amount: 500 }
    ]
  },
  { id: 'GRG-452102', userName: 'Suresh Kumar', businessName: 'Reliable Repairs', total: 3200, status: 'Paid', date: today() },
  { id: 'GRG-452103', userName: 'Vinay Shah', businessName: 'Modern Garage', total: 9800, status: 'Pending', date: today() }
])
seedIfEmpty(lsKey('garage', 'mechanics'), [])
seedIfEmpty(lsKey('garage', 'staff'), [])

// Seed Software Sales data
seedIfEmpty('admin_global_software_sales', [
  { 
    id: 'SALE-001', 
    transporterName: 'Vivek Sharma', 
    businessName: 'Radhe Tempo Service', 
    phone: '9812345678', 
    totalAmount: 25000, 
    amountPaid: 15000, 
    pendingAmount: 10000, 
    saleDate: today(),
    status: 'Partial',
    paymentHistory: [
      { date: today(), amount: 15000, mode: 'UPI' }
    ]
  },
  { 
    id: 'SALE-002', 
    transporterName: 'Rajesh Gupta', 
    businessName: 'Maruti Logistics', 
    phone: '9876501234', 
    totalAmount: 30000, 
    amountPaid: 30000, 
    pendingAmount: 0, 
    saleDate: today(),
    status: 'Paid',
    paymentHistory: [
      { date: today(), amount: 30000, mode: 'Bank Transfer' }
    ]
  }
])

// Seed Subscription Plans
seedIfEmpty('admin_global_subscription_plans', [
  { id: 'p1', name: 'Basic Monthly', interval: 'Monthly', price: 1500, features: 'Core Billing, 1 Business' },
  { id: 'p2', name: 'Pro Yearly', interval: 'Yearly', price: 15000, features: 'Core Billing, Multi-Business, Priority Support' }
])

export function AdminProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('view_mode') || 'transport')

  /* ─── users ─── */
  const [users, setUsersRaw] = useState(() => load(lsKey(mode, 'users')))
  /* ─── businesses ─── */
  const [businesses, setBusinessesRaw] = useState(() => load(lsKey(mode, 'businesses')))
  /* ─── invoices ─── */
  const [invoices, setInvoicesRaw] = useState(() => load(lsKey(mode, 'invoices')))
  /* ─── drivers / mechanics ─── */
  const [drivers, setDriversRaw] = useState(() => load(lsKey(mode, 'drivers')))
  /* ─── staff ─── */
  const [staff, setStaffRaw] = useState(() => load(lsKey(mode, 'staff')))
  /* ─── vehicles (transport only) ─── */
  const [vehicles, setVehiclesRaw] = useState(() => load(lsKey('transport', 'vehicles')))
  /* ─── software sales ─── */
  const [softwareSales, setSoftwareSalesRaw] = useState(() => load('admin_global_software_sales'))
  /* ─── subscription plans ─── */
  const [plans, setPlansRaw] = useState(() => load('admin_global_subscription_plans'))
  const [loading, setLoading] = useState(false)
  const [dbStats, setDbStats] = useState(null)

  // Force re-seed if empty to ensure UI has data
  useEffect(() => {
    const kUsers = lsKey(mode, 'users')
    const currentU = load(kUsers)
    if (currentU.length === 0 && mode === 'garage') {
       const dummies = [
         { id: 'u3', name: 'Suresh Kumar', phone: '9876543210', email: 'suresh@reliable.com', role: 'garage', status: 'Active', joinedAt: today() },
         { id: 'u4', name: 'Amit Singh', phone: '9922334455', email: 'amit@cityauto.com', role: 'garage', status: 'Active', joinedAt: today() },
         { id: 'u5', name: 'Vinay Shah', phone: '8877665544', email: 'vinay@modern.com', role: 'garage', status: 'Active', joinedAt: today() }
       ]
       setUsersRaw(dummies)
       save(kUsers, dummies)
    }

    const kVehicles = lsKey('transport', 'vehicles')
    const currentV = load(kVehicles)
    const hasDemo = currentV.some(v => v.ownerName === 'Demo Transporter')
    if (currentV.length === 0 || !hasDemo) {
       const dummiesV = [
         { id: 'v1', ownerId: 'u1', ownerName: 'Vivek Sharma', plateNo: 'RJ14 GB 1234', type: 'Tempo', status: 'Active', model: 'Tata Ace' },
         { id: 'v2', ownerId: 'u2', ownerName: 'Rajesh Gupta', plateNo: 'HR55 XY 9876', type: 'Truck', status: 'Active', model: 'Eicher 10.90' },
         { id: 'v3', ownerId: 'u3', ownerName: 'Demo Transporter', plateNo: 'MH12 AB 0001', type: 'Tempo', status: 'Active', model: 'Force Traveller' },
         ...currentV.filter(v => v.ownerName !== 'Demo Transporter' && v.id !== 'v3')
       ]
       setVehiclesRaw(dummiesV)
       save(kVehicles, dummiesV)
    }
  }, [mode])

  /* ─── helpers to gather real bills ─── */
  const gatherRealBills = useCallback((m) => {
    const all = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('bills_')) {
        try {
          const userBills = JSON.parse(localStorage.getItem(key)) || []
          // Map to billing monitor format if needed
          const formatted = userBills
            .filter(b => b.type === m)
            .map(b => ({
              id: b.id.replace('bill_', 'INV-'),
              invoiceNo: b.invoiceNo,
              businessName: b.billedToName || 'Unknown Business',
              userName: b.billedToName || 'Guest User',
              total: b.grandTotal,
              status: b.status === 'paid' ? 'Paid' : 'Pending',
              date: b.billDate || b.createdAt?.split('T')[0],
              items: b.items || [],
              tax: b.gstAmount || 0,
              isReal: true
            }))
          all.push(...formatted)
        } catch (e) {}
      }
    }
    return all
  }, [])

  /* Reload all state whenever mode changes */
  const refreshAll = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, uRes, bRes, fRes] = await Promise.all([
        adminApi.getAdminDashboardStats(mode),
        adminApi.adminListUsers({ role: mode }),
        adminApi.getAdminTransportBills(mode),
        mode === 'transport' ? adminApi.getAdminTransportFleet() : Promise.resolve({ success: true, vehicles: [] })
      ])
      
      if (sRes.success) setDbStats(sRes.stats)
      if (uRes.success) {
        setUsersRaw(uRes.users)
        // Derive businesses from users who have businessName set
        const realBiz = uRes.users
          .filter(u => u.setupComplete || u.name) 
          .map(u => ({
            id: u.id,
            name: u.businessName || u.name || 'Unnamed Business',
            businessName: u.businessName,
            ownerName: u.name,
            phone: u.phone,
            email: u.email,
            role: u.role,
            city: u.city || 'Unknown',
            address: u.address || '',
            documents: u.documents || {},
            kycStatus: u.kycStatus || 'Pending',
            status: u.setupComplete ? 'Active' : 'Pending',
            onboardedAt: u.createdAt
          }))
        setBusinessesRaw(realBiz)
      }

      if (bRes.success) {
        const formatted = bRes.bills.map(b => ({
          id: b.billNumber || b._id,
          businessName: b.owner?.businessName || b.owner?.name || 'N/A',
          userName: b.owner?.name || 'N/A',
          total: b.grandTotal,
          status: b.status === 'paid' ? 'Paid' : b.status === 'draft' ? 'Draft' : 'Pending',
          date: new Date(b.billingDate || b.createdAt).toISOString().split('T')[0],
          tax: b.gstAmount || 0,
          items: b.items || []
        }))
        setInvoicesRaw(formatted)
      }

      if (fRes.success && mode === 'transport') {
        const formattedV = fRes.vehicles.map(v => ({
          id: v._id,
          ownerName: v.owner?.name || 'N/A',
          plateNo: v.vehicleNumber,
          type: v.vehicleType || 'Truck',
          status: 'Active',
          model: v.model || 'N/A'
        }))
        setVehiclesRaw(formattedV)
      }

      // Load Real Software Sales
      const sSalesRes = await adminApi.getAdminSales()
      if (sSalesRes.success) {
        setSoftwareSalesRaw(sSalesRes.sales.map(s => ({
          ...s,
          id: s._id,
          transporterName: s.transporter?.name || 'N/A',
          businessName: s.transporter?.businessName || 'N/A',
          phone: s.transporter?.phone || 'N/A',
          pendingAmount: s.totalAmount - s.amountPaid,
          status: s.status.charAt(0).toUpperCase() + s.status.slice(1),
          paymentHistory: s.paymentHistory.map(ph => ({
            ...ph,
            date: new Date(ph.date).toLocaleDateString()
          }))
        })))
      }
      
      // Load Plans
      const plansRes = await adminApi.getAdminPlans(mode) // Fetch plans for current mode
      if (plansRes.success) {
        setPlansRaw(plansRes.plans.map(p => ({ ...p, id: p._id })))
      }
      
      // Load Specialized Users
      const specRes = await adminApi.getAdminSpecialUsers({ target: mode })
      if (specRes.success) {
        setDriversRaw(specRes.users.filter(u => u.role === (mode === 'transport' ? 'driver' : 'mechanic')).map(u => ({ ...u, id: u._id })))
        setStaffRaw(specRes.users.filter(u => u.role === 'staff').map(u => ({ ...u, id: u._id })))
      }
      
    } catch (e) {
      console.error('Admin sync failed:', e)
      const isLoginPage = window.location.pathname === '/admin' || window.location.pathname === '/admin-login'
      if (e?.response?.status === 403 && isUIAdminPath && !isLoginPage) {
        // Only redirect if they're actually TRYING to access a protected admin page
        window.location.href = '/admin'
      }
    } finally {
      setLoading(false)
    }
  }, [mode])

  useEffect(() => {
    // Only refresh if we are on an admin route to avoid infinite 403 redirect loops on login pages
    const isUIAdminPath = window.location.pathname.startsWith('/admin')
    if (isUIAdminPath) {
      refreshAll()
    }
  }, [refreshAll])

  /* ─── setters that also persist (Backward compatibility for local-only stuff) ─── */
  const setUsers = useCallback((fn) => {
    setUsersRaw(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      save(lsKey(mode, 'users'), next)
      return next
    })
  }, [mode])

  const setBusinesses = useCallback((fn) => {
    setBusinessesRaw(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      save(lsKey(mode, 'businesses'), next)
      return next
    })
  }, [mode])

  const setInvoices = useCallback((fn) => {
    setInvoicesRaw(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      save(lsKey(mode, 'invoices'), next)
      return next
    })
  }, [mode])

  const setDrivers = useCallback((fn) => {
    setDriversRaw(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      return next
    })
  }, [])

  const setStaff = useCallback((fn) => {
    setStaffRaw(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      return next
    })
  }, [])

  const setVehicles = useCallback((fn) => {
    setVehiclesRaw(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      save(lsKey('transport', 'vehicles'), next)
      return next
    })
  }, [])

  const setSoftwareSales = useCallback((fn) => {
    setSoftwareSalesRaw(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      save('admin_global_software_sales', next)
      return next
    })
  }, [])

  /* ─── switch mode (synced with AppContext view_mode) ─── */
  const switchMode = useCallback((m) => {
    localStorage.setItem('view_mode', m)
    setMode(m)
  }, [])

  /* ─── CRUD: Users ─── */
  const addUser = useCallback(async (data) => {
    try {
      const res = await adminApi.adminCreateUser({ ...data, role: mode })
      if (res.success) {
        refreshAll()
        return res.user
      }
    } catch (e) { console.error(e) }
    return null
  }, [mode, refreshAll])

  const updateUser = useCallback(async (id, patch) => {
    try {
      const res = await adminApi.adminUpdateUser(id, patch)
      if (res.success) refreshAll()
    } catch (e) { console.error(e) }
  }, [refreshAll])

  const deleteUser = useCallback(async (id) => {
    try {
      const res = await adminApi.adminDeleteUser(id)
      if (res.success) {
        setUsersRaw(p => p.filter(u => u.id !== id))
        refreshAll()
      }
    } catch (e) { console.error(e) }
  }, [refreshAll])

  /* ─── CRUD: Businesses (Linked to User creation) ─── */
  const addBusiness = useCallback(async (data) => {
    // In this app, adding a business adds a user with business details
    return await addUser(data)
  }, [addUser])

  const updateBusiness = useCallback(async (id, patch) => {
    return await updateUser(id, patch)
  }, [updateUser])

  const deleteBusiness = useCallback(async (id) => {
    return await deleteUser(id)
  }, [deleteUser])

  /* ─── CRUD: Invoices ─── */
  const addInvoice = useCallback((data) => {
    const seq = Date.now().toString().slice(-6)
    const prefix = mode === 'transport' ? 'TRN' : 'GRG'
    const row = {
      id: `${prefix}-${seq}`,
      ...data,
      status: data.status || 'Pending',
      date: today(),
      tax: Math.round((data.total || 0) * 0.18)
    }
    setInvoices(p => [row, ...p])
    return row
  }, [mode, setInvoices])

  const updateInvoice = useCallback((id, patch) => {
    setInvoices(p => p.map(inv => inv.id === id ? { ...inv, ...patch } : inv))
  }, [setInvoices])

  const deleteInvoice = useCallback((id) => {
    setInvoices(p => p.filter(inv => inv.id !== id))
  }, [setInvoices])

  /* ─── CRUD: Drivers / Mechanics ─── */
  const addDriver = useCallback(async (data) => {
    try {
      const res = await adminApi.createAdminSpecialUser({ 
        ...data, 
        role: mode === 'transport' ? 'driver' : 'mechanic',
        target: mode
      })
      if (res.success) refreshAll()
    } catch (e) { console.error(e) }
  }, [mode, refreshAll])

  const updateDriver = useCallback(async (id, patch) => {
    try {
      const res = await adminApi.updateAdminSpecialUser(id, patch)
      if (res.success) refreshAll()
    } catch (e) { console.error(e) }
  }, [refreshAll])

  const deleteDriver = useCallback(async (id) => {
    try {
      const res = await adminApi.deleteAdminSpecialUser(id)
      if (res.success) refreshAll()
    } catch (e) { console.error(e) }
  }, [refreshAll])

  /* ─── CRUD: Staff ─── */
  const addStaff = useCallback(async (data) => {
    try {
      const res = await adminApi.createAdminSpecialUser({ 
        ...data, 
        role: 'staff',
        target: mode
      })
      if (res.success) refreshAll()
    } catch (e) { console.error(e) }
  }, [mode, refreshAll])

  const updateStaff = useCallback(async (id, patch) => {
    try {
      const res = await adminApi.updateAdminSpecialUser(id, patch)
      if (res.success) refreshAll()
    } catch (e) { console.error(e) }
  }, [refreshAll])

  const deleteStaff = useCallback(async (id) => {
    try {
      const res = await adminApi.deleteAdminSpecialUser(id)
      if (res.success) refreshAll()
    } catch (e) { console.error(e) }
  }, [refreshAll])

  /* ─── CRUD: Software Sales ─── */
  const addSoftwareSale = useCallback(async (data) => {
    try {
      const res = await adminApi.createAdminSale(data)
      if (res.success) {
        refreshAll()
        return res.sale
      }
    } catch (e) {
      console.error('Failed to create sale', e)
    }
    return null
  }, [refreshAll])

  const updateSoftwareSale = useCallback((id, patch) => {
    setSoftwareSalesRaw(p => p.map(s => s.id === id ? { ...s, ...patch } : s))
  }, [])

  const addSalePayment = useCallback(async (id, payment) => {
    try {
      const res = await adminApi.addAdminSalePayment(id, payment)
      if (res.success) {
        refreshAll()
      }
    } catch (e) {
      console.error('Failed to add payment', e)
    }
  }, [refreshAll])

  const deleteSoftwareSale = useCallback((id) => {
    setSoftwareSalesRaw(p => p.filter(s => s.id !== id))
  }, [])

  /* ─── CRUD: Plans (Real API linked) ─── */
  const addPlan = useCallback(async (data) => {
    try {
      const res = await adminApi.createAdminPlan({ ...data, target: mode })
      if (res.success) {
        refreshAll()
        return res.plan
      }
    } catch (e) { console.error(e) }
    return null
  }, [mode, refreshAll])

  const updatePlan = useCallback(async (id, patch) => {
    try {
      const res = await adminApi.updateAdminPlan(id, patch)
      if (res.success) refreshAll()
    } catch (e) { console.error(e) }
  }, [refreshAll])

  const deletePlan = useCallback(async (id) => {
    try {
      const res = await adminApi.deleteAdminPlan(id)
      if (res.success) refreshAll()
    } catch (e) { console.error(e) }
  }, [refreshAll])

  /* ─── Computed stats (live) ─── */
  const stats = useMemo(() => ({
    totalUsers: dbStats?.totalUsers || users.length,
    activeUsers: dbStats?.activeUsers || users.filter(u => u.status === 'Active').length,
    totalBusinesses: dbStats?.totalBusinesses || businesses.length,
    totalInvoices: dbStats?.totalInvoices || invoices.length,
    totalRevenue: dbStats?.totalRevenue || invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + (Number(i.total) || 0), 0),
    pendingRevenue: dbStats?.pendingRevenue || invoices.filter(i => i.status === 'Pending').reduce((acc, i) => acc + (Number(i.total) || 0), 0),
    paidInvoices: dbStats?.paidInvoices ?? invoices.filter(i => i.status === 'Paid').length,
    pendingInvoices: dbStats?.pendingInvoices ?? invoices.filter(i => i.status === 'Pending').length,
    totalDrivers: drivers.length,
    totalStaff: staff.length,
  }), [dbStats, users, businesses, invoices, drivers, staff])

  const value = useMemo(() => ({
    mode, switchMode, loading, refreshAll,
    users, addUser, updateUser, deleteUser,
    businesses, addBusiness, updateBusiness, deleteBusiness,
    invoices, addInvoice, updateInvoice, deleteInvoice,
    drivers, addDriver, updateDriver, deleteDriver,
    staff, addStaff, updateStaff, deleteStaff,
    vehicles, setVehicles,
    softwareSales, addSoftwareSale, updateSoftwareSale, deleteSoftwareSale, addSalePayment,
    plans, addPlan, updatePlan, deletePlan,
    stats,
  }), [
    mode, switchMode, loading, refreshAll,
    users, addUser, updateUser, deleteUser,
    businesses, addBusiness, updateBusiness, deleteBusiness,
    invoices, addInvoice, updateInvoice, deleteInvoice,
    drivers, addDriver, updateDriver, deleteDriver,
    staff, addStaff, updateStaff, deleteStaff,
    vehicles, setVehicles,
    softwareSales, addSoftwareSale, updateSoftwareSale, deleteSoftwareSale, addSalePayment,
    plans, addPlan, updatePlan, deletePlan,
    stats
  ])

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used inside <AdminProvider>')
  return ctx
}
