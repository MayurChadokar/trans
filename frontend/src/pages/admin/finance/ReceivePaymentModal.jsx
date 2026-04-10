import React, { useState } from 'react'
import { X, IndianRupee, Calendar, CreditCard } from 'lucide-react'

export default function ReceivePaymentModal({ invoice, onSave, onClose }) {
  const [form, setForm] = useState({
    amount: '',
    paymentMode: 'Cash',
    date: new Date().toISOString().split('T')[0]
  })
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const amt = Number(form.amount)
    
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    if (amt > invoice.dueAmount) {
      setError(`Amount cannot exceed due amount (₹${invoice.dueAmount.toLocaleString()})`)
      return
    }

    onSave({
      invoiceId: invoice.id,
      amount: amt,
      paymentMode: form.paymentMode,
      date: form.date
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)'
    }}>
      <div className="card animate-scaleIn" style={{ width: '100%', maxWidth: 450, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontWeight: 900 }}>Receive Payment</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">PARTY NAME</label>
            <input type="text" className="form-input" value={invoice.partyName} disabled style={{ background: 'var(--bg-alt)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">DUE AMOUNT</label>
              <div className="input-group">
                <IndianRupee className="input-icon" size={16} />
                <input type="text" className="form-input" value={invoice.dueAmount.toLocaleString()} disabled style={{ background: 'var(--bg-alt)' }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">TOTAL AMOUNT</label>
              <div className="input-group">
                <IndianRupee className="input-icon" size={16} />
                <input type="text" className="form-input" value={invoice.totalAmount.toLocaleString()} disabled style={{ background: 'var(--bg-alt)' }} />
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

          <div className="form-group">
            <label className="form-label">RECEIVE AMOUNT *</label>
            <div className="input-group">
              <IndianRupee className="input-icon" size={16} color="var(--primary)" />
              <input 
                type="number" 
                className="form-input" 
                placeholder="0.00" 
                autoFocus
                value={form.amount}
                onChange={e => { setForm(p => ({ ...p, amount: e.target.value })); setError('') }}
                required
              />
            </div>
            {error && <p style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 700, marginTop: 6, margin: 0 }}>{error}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">PAYMENT MODE</label>
              <div className="input-group">
                <CreditCard className="input-icon" size={16} />
                <select 
                  className="form-input" 
                  value={form.paymentMode} 
                  onChange={e => setForm(p => ({ ...p, paymentMode: e.target.value }))}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI / QR">UPI / QR</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">DATE</label>
              <div className="input-group">
                <Calendar className="input-icon" size={16} />
                <input 
                  type="date" 
                  className="form-input" 
                  value={form.date} 
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">Record Payment</button>
          </div>
        </form>
      </div>
    </div>
  )
}
