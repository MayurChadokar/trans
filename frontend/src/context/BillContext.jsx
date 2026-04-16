import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { getBills, getBillDetail, createBill as createBillApi, updateBill as updateBillApi, deleteBillApi } from '../api/billApi'

const BillContext = createContext(null)

export function BillProvider({ children }) {
  const { user } = useAuth()
  const [bills, setBills] = useState([])
  const [loaded, setLoaded] = useState(false)

  const loadBills = useCallback(async () => {
    if (!user) return
    try {
      const res = await getBills()
      if (res.success) setBills(res.bills)
    } catch (e) {
      console.error("Failed to load bills", e)
    } finally {
      setLoaded(true)
    }
  }, [user])

  useEffect(() => {
    loadBills()
  }, [loadBills])

  const addBill = useCallback(async (data) => {
    const res = await createBillApi(data)
    if (res.success) {
      setBills(prev => [res.bill, ...prev])
      return res.bill
    }
    throw new Error("Failed to create bill")
  }, [])

  const updateBill = useCallback(async (id, data) => {
    const res = await updateBillApi(id, data)
    if (res.success) {
      setBills(prev => prev.map(b => (b._id === id || b.id === id) ? res.bill : b))
      return res.bill
    }
    throw new Error("Failed to update bill")
  }, [])

  const recordPayment = useCallback(async (id, amount) => {
    try {
      const res = await updateBillApi(id, {
        status: 'paid',
        paidAmount: amount,
        paymentDate: new Date().toISOString()
      })
      if (res.success) {
        setBills(prev => prev.map(b => (b._id === id || b.id === id) ? res.bill : b))
        return res.bill
      }
    } catch (e) {
      console.error("Failed to record payment", e)
      throw e
    }
  }, [])

  // Returns from local cache first; falls back to API (handles hard refresh)
  const getBill = useCallback((id) => bills.find(b => b._id === id || b.id === id), [bills])

  const fetchBill = useCallback(async (id) => {
    // Try local state first
    const local = bills.find(b => b._id === id || b.id === id)
    if (local) return local
    // Fall back to API
    try {
      const res = await getBillDetail(id)
      if (res.success) {
        setBills(prev => {
          const exists = prev.find(b => b._id === id || b.id === id)
          return exists ? prev : [res.bill, ...prev]
        })
        return res.bill
      }
    } catch (e) {
      console.error("Failed to fetch bill detail", e)
    }
    return null
  }, [bills])

  const deleteBill = useCallback(async (id) => {
    try {
      await deleteBillApi(id)
      setBills(prev => prev.filter(b => b._id !== id && b.id !== id))
    } catch (e) {
      console.error('Failed to delete bill', e)
      throw e
    }
  }, [])

  return (
    <BillContext.Provider value={{ bills, loaded, addBill, updateBill, deleteBill, getBill, fetchBill, recordPayment, refreshBills: loadBills }}>
      {children}
    </BillContext.Provider>
  )
}

export function useBills() {
  const ctx = useContext(BillContext)
  if (!ctx) throw new Error('useBills must be inside <BillProvider>')
  return ctx
}
