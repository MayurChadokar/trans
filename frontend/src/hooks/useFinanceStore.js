import { useState, useEffect, useCallback } from 'react'

const INVOICES_KEY = 'admin_finance_invoices'
const PAYMENTS_KEY = 'admin_finance_payments'

const initialInvoices = [
  {
    id: 'INV-1001',
    partyName: 'ABC Traders',
    totalAmount: 10000,
    paidAmount: 0,
    dueAmount: 10000,
    status: 'unpaid',
    type: 'transport',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'INV-1002',
    partyName: 'XYZ Logistics',
    totalAmount: 25000,
    paidAmount: 5000,
    dueAmount: 20000,
    status: 'partial',
    type: 'transport',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'INV-1003',
    partyName: 'Global Motors',
    totalAmount: 15000,
    paidAmount: 15000,
    dueAmount: 0,
    status: 'paid',
    type: 'garage',
    date: new Date().toISOString().split('T')[0]
  }
]

export function useFinanceStore() {
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedInvoices = localStorage.getItem(INVOICES_KEY)
    const savedPayments = localStorage.getItem(PAYMENTS_KEY)

    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices))
    } else {
      setInvoices(initialInvoices)
      localStorage.setItem(INVOICES_KEY, JSON.stringify(initialInvoices))
    }

    if (savedPayments) {
      setPayments(JSON.parse(savedPayments))
    } else {
      setPayments([])
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify([]))
    }
    
    setLoading(false)
  }, [])

  const addPayment = useCallback((paymentData) => {
    const { invoiceId, amount, paymentMode, date } = paymentData

    setInvoices(prevInvoices => {
      const nextInvoices = prevInvoices.map(inv => {
        if (inv.id === invoiceId) {
          const newPaidAmount = inv.paidAmount + Number(amount)
          const newDueAmount = inv.totalAmount - newPaidAmount
          let newStatus = 'unpaid'
          if (newPaidAmount === inv.totalAmount) newStatus = 'paid'
          else if (newPaidAmount > 0) newStatus = 'partial'

          return {
            ...inv,
            paidAmount: newPaidAmount,
            dueAmount: newDueAmount,
            status: newStatus
          }
        }
        return inv
      })
      localStorage.setItem(INVOICES_KEY, JSON.stringify(nextInvoices))
      return nextInvoices
    })

    setPayments(prevPayments => {
      const selectedInvoice = invoices.find(i => i.id === invoiceId)
      const newPayment = {
        id: Date.now().toString(),
        invoiceId,
        partyName: selectedInvoice?.partyName || 'Unknown',
        amount: Number(amount),
        paymentMode,
        date
      }
      const nextPayments = [newPayment, ...prevPayments]
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(nextPayments))
      return nextPayments
    })
  }, [invoices])

  const stats = {
    totalReceivable: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    totalReceived: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
    totalPending: invoices.reduce((sum, inv) => sum + inv.dueAmount, 0)
  }

  return { invoices, payments, addPayment, stats, loading }
}
