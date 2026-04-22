import React, { useState, useMemo } from 'react'
import { 
  ArrowLeft, Droplets, Wrench, LayoutDashboard, 
  TrendingDown, Calendar, CheckCircle2, Loader2, 
  Plus, Clock, Search, Trash2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFinance } from '../../context/FinanceContext'
import { useForm } from 'react-hook-form'
import dayjs from 'dayjs'

const EXPENSE_CATEGORIES = [
  { id: 'fuel', label: 'Fuel', icon: Droplets, color: '#F59E0B', bg: '#FFF7ED' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'other', label: 'Other', icon: LayoutDashboard, color: '#64748B', bg: '#F8FAFC' }
]

function Field({ label, error, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}</label>
      {children}
      {error && <span className="form-error">{error.message}</span>}
    </div>
  )
}

export default function DailyExpense() {
  const navigate = useNavigate()
  const { transactions, addTransaction, loaded } = useFinance()
  const [activeTab, setActiveTab] = useState('fuel')
  const [showHistory, setShowHistory] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      date: dayjs().format('YYYY-MM-DD'),
      amount: '',
      paymentMode: 'cash',
      notes: ''
    }
  })

  const onSubmit = async (data) => {
    if (saving) return;
    setSaving(true)
    try {
      const payload = {
        ...data,
        type: 'expense',
        category: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
        amount: parseFloat(data.amount)
      }
      await addTransaction(payload)
      setSuccess(true)
      reset({
        date: dayjs().format('YYYY-MM-DD'),
        amount: '',
        paymentMode: 'cash',
        notes: ''
      })
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      alert('Failed to save expense')
    } finally {
      setSaving(false)
    }
  }

  const expenseHistory = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense' && ['Fuel', 'Maintenance', 'Other'].includes(t.category))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [transactions])

  const monthlyTotals = useMemo(() => {
    const totals = {}
    expenseHistory.forEach(tx => {
      const m = dayjs(tx.date).format('YYYY-MM')
      totals[m] = (totals[m] || 0) + (tx.amount || 0)
    })
    return totals
  }, [expenseHistory])

  // Group by month
  const monthlyGroups = useMemo(() => {
    const groups = {}
    expenseHistory.forEach(tx => {
      const m = dayjs(tx.date).format('YYYY-MM')
      if (!groups[m]) groups[m] = []
      groups[m].push(tx)
    })
    return groups
  }, [expenseHistory])

  const filteredHistory = useMemo(() => {
    if (!selectedMonth) return []
    const base = monthlyGroups[selectedMonth] || []
    if (activeTab === 'all') return base
    const catLabel = activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
    return base.filter(t => t.category === catLabel)
  }, [monthlyGroups, selectedMonth, activeTab])

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={() => {
              if (selectedMonth) setSelectedMonth(null)
              else navigate(-1)
            }} 
            className="btn-icon"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              {selectedMonth ? dayjs(selectedMonth).format('MMMM YYYY') : 'Expense Mgmt'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
              {selectedMonth ? `Total: ₹${(monthlyTotals[selectedMonth] || 0).toLocaleString()}` : 'Log fuel, maintenance & more'}
            </p>
          </div>
        </div>
        {!selectedMonth && (
          <button 
            onClick={() => setShowHistory(!showHistory)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', 
              borderRadius: 12, border: 'none', background: showHistory ? '#0F0D2E' : '#F1F5F9', 
              color: showHistory ? 'white' : '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' 
            }}
          >
            {showHistory ? <Plus size={16} /> : <Clock size={16} />}
            {showHistory ? 'Add New' : 'By Month'}
          </button>
        )}
      </div>

      {!showHistory ? (
        // ... (logging form kept as is)
        <div className="animate-scaleIn">
          {/* Category Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
            {EXPENSE_CATEGORIES.map(cat => {
              const active = activeTab === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  style={{
                    background: active ? cat.bg : 'white',
                    border: active ? `2px solid ${cat.color}` : '2px solid transparent',
                    borderRadius: 20, padding: '16px 8px', textAlign: 'center',
                    cursor: 'pointer', transition: '0.2s',
                    boxShadow: active ? '0 10px 20px rgba(0,0,0,0.05)' : '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ 
                    width: 44, height: 44, borderRadius: 14, background: active ? 'white' : cat.bg, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
                    color: cat.color, boxShadow: active ? '0 4px 10px rgba(0,0,0,0.05)' : 'none'
                  }}>
                    {cat.icon && <cat.icon size={22} />}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: active ? '#0F0D2E' : '#64748B' }}>{cat.label}</span>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
               {/* Logging Indicator */}
               <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: EXPENSE_CATEGORIES.find(c => c.id === activeTab)?.color }}>
                  {(() => {
                    const CatIcon = EXPENSE_CATEGORIES.find(c => c.id === activeTab)?.icon
                    return CatIcon ? <CatIcon size={16} /> : null
                  })()}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>Logging {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Expense</span>
              </div>

              <Field label="Amount (₹)" error={errors.amount} required>
                <div className="input-group">
                  <span className="input-prefix" style={{ fontSize: '1.25rem', fontWeight: 900 }}>₹</span>
                  <input 
                    {...register('amount', { required: 'Enter amount', min: 1 })} 
                    type="number" 
                    placeholder="0.00" 
                    className="form-input" 
                    style={{ fontSize: '1.5rem', fontWeight: 900 }}
                  />
                </div>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Date" required>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input {...register('date')} type="date" className="form-input" style={{ paddingLeft: 38 }} />
                  </div>
                </Field>
                <Field label="Payment Mode">
                  <select {...register('paymentMode')} className="form-input">
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                    <option value="bank">Bank</option>
                  </select>
                </Field>
              </div>

              <Field label="Notes / Description">
                <textarea 
                  {...register('notes')} 
                  placeholder="e.g. Tank full at HP Petrol Pump, Engine oil change..." 
                  className="form-input" 
                  style={{ minHeight: 100, resize: 'none' }}
                />
              </Field>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving || success}
                style={{ 
                  height: 54, borderRadius: 18, fontSize: '1rem', fontWeight: 800,
                  background: success ? '#16A34A' : '#7C3AED',
                  boxShadow: '0 10px 20px rgba(124, 58, 237, 0.2)'
                }}
              >
                {saving ? <Loader2 size={20} className="spin" /> : 
                 success ? <><CheckCircle2 size={20} /> Saved Successfully</> : 
                 'Record Expense'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="animate-fadeIn">
          {/* Summary Stats */}
          {!selectedMonth && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div className="card" style={{ padding: 16, background: '#F5F3FF' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#5B21B6', textTransform: 'uppercase', marginBottom: 4 }}>This Month</p>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#4C1D95' }}>₹{expenseHistory.filter(t => dayjs(t.date).isSame(dayjs(), 'month')).reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()}</div>
              </div>
              <div className="card" style={{ padding: 16, background: '#FFF7ED' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9A3412', textTransform: 'uppercase', marginBottom: 4 }}>Fuel Only (TM)</p>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#7C2D12' }}>₹{expenseHistory.filter(t => t.category === 'Fuel' && dayjs(t.date).isSame(dayjs(), 'month')).reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Month List or Month Detail */}
          {!selectedMonth ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: '0.925rem', fontWeight: 800, color: '#0F0D2E', marginBottom: 4 }}>Monthly Summary</h3>
              {Object.keys(monthlyGroups).sort((a,b) => b.localeCompare(a)).map(m => (
                <button 
                  key={m} 
                  onClick={() => setSelectedMonth(m)}
                  className="card" 
                  style={{ 
                    padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    cursor: 'pointer', border: '1px solid #F1F5F9', textAlign: 'left', width: '100%' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B' }}>{dayjs(m).format('MMMM YYYY')}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{monthlyGroups[m].length} Expenses</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#DC2626' }}>₹{monthlyTotals[m].toLocaleString()}</div>
                    <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Total Spends</div>
                  </div>
                </button>
              ))}
              {Object.keys(monthlyGroups).length === 0 && (
                 <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                    <Search size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <p style={{ margin: 0, fontWeight: 700 }}>No expense records found</p>
                 </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{dayjs(selectedMonth).format('MMM YYYY')} History</h3>
                <select 
                  value={activeTab} 
                  onChange={(e) => setActiveTab(e.target.value)}
                  style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'white' }}
                >
                  <option value="all">All Items</option>
                  <option value="fuel">Fuel Only</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {filteredHistory.map((tx, idx) => {
                const config = EXPENSE_CATEGORIES.find(c => c.label === tx.category) || EXPENSE_CATEGORIES[2]
                return (
                  <div key={tx._id || idx} className="card animate-fadeIn" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: config.bg, color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {config.icon && <config.icon size={20} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#1E293B' }}>{tx.category}</p>
                        <p style={{ margin: 0, fontWeight: 900, fontSize: '1rem', color: '#DC2626' }}>-₹{tx.amount?.toLocaleString()}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{dayjs(tx.date).format('DD MMM YYYY')}</span>
                        <span style={{ color: '#CBD5E1' }}>•</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'capitalize' }}>{tx.paymentMode}</span>
                      </div>
                      {tx.notes && <p style={{ margin: '6px 0 0', fontSize: '0.7rem', color: '#94A3B8', fontStyle: 'italic', paddingLeft: 4, borderLeft: '2px solid #F1F5F9' }}>{tx.notes}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
