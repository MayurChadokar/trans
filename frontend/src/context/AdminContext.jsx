import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

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
  useEffect(() => {
    setUsersRaw(load(lsKey(mode, 'users')))
    setBusinessesRaw(load(lsKey(mode, 'businesses')))
    
    // Load both mock invoices and real user invoices
    const mocks = load(lsKey(mode, 'invoices'))
    const real = gatherRealBills(mode)
    setInvoicesRaw([...real, ...mocks])
    
    setDriversRaw(load(lsKey(mode, mode === 'transport' ? 'drivers' : 'mechanics')))
    setStaffRaw(load(lsKey(mode, 'staff')))
  }, [mode, gatherRealBills])

  /* ─── setters that also persist ─── */
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
      save(lsKey(mode, mode === 'transport' ? 'drivers' : 'mechanics'), next)
      return next
    })
  }, [mode])

  const setStaff = useCallback((fn) => {
    setStaffRaw(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      save(lsKey(mode, 'staff'), next)
      return next
    })
  }, [mode])

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

  const setPlans = useCallback((fn) => {
    setPlansRaw(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      save('admin_global_subscription_plans', next)
      return next
    })
  }, [])

  /* ─── switch mode (synced with AppContext view_mode) ─── */
  const switchMode = useCallback((m) => {
    localStorage.setItem('view_mode', m)
    setMode(m)
  }, [])

  /* ─── CRUD: Users ─── */
  const addUser = useCallback((data) => {
    const row = { id: uid(), ...data, status: 'Active', plan: 'Free', joinedAt: today() }
    setUsers(p => [row, ...p])
    return row
  }, [setUsers])

  const updateUser = useCallback((id, patch) => {
    setUsers(p => p.map(u => u.id === id ? { ...u, ...patch } : u))
  }, [setUsers])

  const deleteUser = useCallback((id) => {
    setUsers(p => p.filter(u => u.id !== id))
  }, [setUsers])

  /* ─── CRUD: Businesses ─── */
  const addBusiness = useCallback((data) => {
    const row = { id: uid(), ...data, status: 'Active', revenue: 0, joinedAt: today() }
    setBusinesses(p => [row, ...p])
    return row
  }, [setBusinesses])

  const updateBusiness = useCallback((id, patch) => {
    setBusinesses(p => p.map(b => b.id === id ? { ...b, ...patch } : b))
  }, [setBusinesses])

  const deleteBusiness = useCallback((id) => {
    setBusinesses(p => p.filter(b => b.id !== id))
  }, [setBusinesses])

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
  const addDriver = useCallback((data) => {
    const row = { id: uid(), ...data, status: 'Active', joinedAt: today() }
    setDrivers(p => [row, ...p])
    return row
  }, [setDrivers])

  const updateDriver = useCallback((id, patch) => {
    setDrivers(p => p.map(d => d.id === id ? { ...d, ...patch } : d))
  }, [setDrivers])

  const deleteDriver = useCallback((id) => {
    setDrivers(p => p.filter(d => d.id !== id))
  }, [setDrivers])

  /* ─── CRUD: Staff ─── */
  const addStaff = useCallback((data) => {
    const row = { id: uid(), ...data, status: 'Active', joinedAt: today() }
    setStaff(p => [row, ...p])
    return row
  }, [setStaff])

  const updateStaff = useCallback((id, patch) => {
    setStaff(p => p.map(s => s.id === id ? { ...s, ...patch } : s))
  }, [setStaff])

  const deleteStaff = useCallback((id) => {
    setStaff(p => p.filter(s => s.id !== id))
  }, [setStaff])

  /* ─── CRUD: Software Sales ─── */
  const addSoftwareSale = useCallback((data) => {
    const row = { 
      id: `SALE-${Date.now().toString().slice(-4)}`, 
      ...data, 
      pendingAmount: data.totalAmount - data.amountPaid,
      status: data.amountPaid >= data.totalAmount ? 'Paid' : (data.amountPaid > 0 ? 'Partial' : 'Pending'),
      paymentHistory: [{ date: today(), amount: data.amountPaid, mode: data.paymentMode || 'Cash' }]
    }
    setSoftwareSales(p => [row, ...p])
    return row
  }, [setSoftwareSales])

  const updateSoftwareSale = useCallback((id, patch) => {
    setSoftwareSales(p => p.map(s => {
      if (s.id !== id) return s
      const updated = { ...s, ...patch }
      updated.pendingAmount = updated.totalAmount - updated.amountPaid
      updated.status = updated.amountPaid >= updated.totalAmount ? 'Paid' : (updated.amountPaid > 0 ? 'Partial' : 'Pending')
      return updated
    }))
  }, [setSoftwareSales])

  const addSalePayment = useCallback((id, payment) => {
    setSoftwareSales(p => p.map(s => {
      if (s.id !== id) return s
      const newPaid = s.amountPaid + Number(payment.amount)
      const updated = { 
        ...s, 
        amountPaid: newPaid,
        pendingAmount: s.totalAmount - newPaid,
        status: newPaid >= s.totalAmount ? 'Paid' : 'Partial',
        paymentHistory: [...s.paymentHistory, { ...payment, date: today() }]
      }
      return updated
    }))
  }, [setSoftwareSales])

  const deleteSoftwareSale = useCallback((id) => {
    setSoftwareSales(p => p.filter(s => s.id !== id))
  }, [setSoftwareSales])

  /* ─── CRUD: Plans ─── */
  const addPlan = useCallback((data) => {
    const row = { id: uid(), ...data }
    setPlans(p => [row, ...p])
    return row
  }, [setPlans])

  const updatePlan = useCallback((id, patch) => {
    setPlans(p => p.map(x => x.id === id ? { ...x, ...patch } : x))
  }, [setPlans])

  const deletePlan = useCallback((id) => {
    setPlans(p => p.filter(x => x.id !== id))
  }, [setPlans])

  /* ─── Computed stats (live) ─── */
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'Active').length,
    totalBusinesses: businesses.length,
    totalInvoices: invoices.length,
    totalRevenue: invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + (Number(i.total) || 0), 0),
    pendingRevenue: invoices.filter(i => i.status === 'Pending').reduce((acc, i) => acc + (Number(i.total) || 0), 0),
    paidInvoices: invoices.filter(i => i.status === 'Paid').length,
    pendingInvoices: invoices.filter(i => i.status === 'Pending').length,
    totalDrivers: drivers.length,
    totalStaff: staff.length,
  }

  const value = {
    mode, switchMode,
    users, addUser, updateUser, deleteUser,
    businesses, addBusiness, updateBusiness, deleteBusiness,
    invoices, addInvoice, updateInvoice, deleteInvoice,
    drivers, addDriver, updateDriver, deleteDriver,
    staff, addStaff, updateStaff, deleteStaff,
    vehicles, setVehicles,
    softwareSales, addSoftwareSale, updateSoftwareSale, deleteSoftwareSale, addSalePayment,
    plans, addPlan, updatePlan, deletePlan,
    stats,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used inside <AdminProvider>')
  return ctx
}
