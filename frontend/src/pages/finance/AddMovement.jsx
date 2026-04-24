import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  ArrowLeft, CheckCircle2, Loader2, TrendingUp, TrendingDown, 
  Calendar, CreditCard, User, Tag, FileText 
} from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import { useParties } from '../../context/PartyContext'
import { useBills } from '../../context/BillContext'
import { useAuth } from '../../context/AuthContext'
import dayjs from 'dayjs'

function Field({ label, error, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}</label>
      {children}
      {error && <span className="form-error">{error.message}</span>}
    </div>
  )
}

export default function AddMovement() {
  const [searchParams] = useSearchParams()
  const typeParam = searchParams.get('type') || 'income'
  const partyIdParam = searchParams.get('partyId') || ''
  const billIdParam = searchParams.get('billId') || ''
  const amountParam = searchParams.get('amount') || ''
  
  const { user } = useAuth()
  const { addTransaction } = useFinance()
  const { parties } = useParties()
  const { recordPayment } = useBills()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      type: typeParam,
      date: dayjs().format('YYYY-MM-DD'),
      amount: amountParam,
      partyId: partyIdParam,
      billId: billIdParam,
      paymentMode: 'cash',
      category: billIdParam ? 'Bill Payment' : (typeParam === 'income' ? 'sales' : 'purchase'),
      notes: billIdParam ? `Payment for Bill #${billIdParam.split('_')[1]}` : '',
    }
  })

  const type = watch('type')

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      // Map frontend partyId to backend party field
      const payload = {
        ...data,
        party: data.partyId || null,
        bill: data.billId || null,
        amount: parseFloat(data.amount)
      }

      await addTransaction(payload)
      
      if (data.billId) {
        await recordPayment(data.billId, data.amount)
      }
      
      setDone(true)
      setTimeout(() => navigate('/finance'), 800)
    } catch (e) {
      alert("Failed to save transaction")
    } finally {
      setSaving(false)
    }
  }

  if (done) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CheckCircle2 size={32} color="#16A34A" />
      </div>
      <h3 style={{ fontWeight: 800 }}>Success!</h3>
      <p style={{ color: '#6B7280' }}>Transaction recorded.</p>
    </div>
  )

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 500, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate('/finance')} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} />
        </button>
        <h2 style={{ fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>Add {type === 'income' ? 'Income' : 'Expense'}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ background: 'white', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Type Toggle */}
          <div style={{ display: 'flex', background: '#F4F4F8', borderRadius: 14, padding: 4, gap: 4 }}>
            {[
              { val: 'income', label: 'Cash In', color: '#16A34A', bg: '#DCFCE7' },
              { val: 'expense', label: 'Cash Out', color: '#DC2626', bg: '#FEE2E2' },
            ].map(opt => {
              const isActive = type === opt.val
              return (
                <button key={opt.val} type="button" onClick={() => setValue('type', opt.val)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: 'none', fontSize: '0.85rem', fontWeight: 700,
                    background: isActive ? opt.bg : 'transparent',
                    color: isActive ? opt.color : '#6B7280',
                    transition: 'all 0.2s', cursor: 'pointer'
                  }}>
                  {isActive && (type === 'income' ? <TrendingUp size={14} style={{ marginRight: 6 }} /> : <TrendingDown size={14} style={{ marginRight: 6 }} />)}
                  {opt.label}
                </button>
              )
            })}
          </div>
          <input type="hidden" {...register('type')} />

          <Field label="Amount (₹)" error={errors.amount} required>
            <div className="input-group">
              <span className="input-prefix" style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹</span>
              <input {...register('amount', { required: 'Required', min: 1 })} type="number" placeholder="0" className="form-input" style={{ fontSize: '1.25rem', fontWeight: 800 }} inputMode="numeric" />
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date" required>
              <div className="input-group">
                <Calendar size={18} className="input-icon" />
                <input {...register('date')} type="date" className="form-input" style={{ paddingLeft: 44 }} />
              </div>
            </Field>
            <Field label="Mode">
              <div className="input-group">
                <CreditCard size={18} className="input-icon" />
                <select {...register('paymentMode')} className="form-input" style={{ paddingLeft: 44 }}>
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                  <option value="bank">Bank</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
            </Field>
          </div>

          <Field label="Related Party (Optional)">
            <div className="input-group">
              <User size={18} className="input-icon" />
              <select {...register('partyId')} className="form-input" style={{ paddingLeft: 44 }}>
                <option value="">— No Party —</option>
                {parties
                  .filter(p => p.partyType === (user?.role || 'transport'))
                  .map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>)
                }
              </select>
            </div>
          </Field>

          <Field label="Category">
             <div className="input-group">
              <Tag size={18} className="input-icon" />
              <input {...register('category')} placeholder="e.g. Fuel, Salary, Rent..." className="form-input" style={{ paddingLeft: 44 }} />
            </div>
          </Field>

          <Field label="Notes">
            <div className="input-group">
              <FileText size={18} className="input-icon" style={{ top: 18 }} />
              <textarea {...register('notes')} placeholder="Add details..." className="form-input" style={{ paddingLeft: 44, minHeight: 80 }} />
            </div>
          </Field>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={saving} style={{ marginTop: 8 }}>
            {saving ? <Loader2 className="spin" /> : 'Save Transaction'}
          </button>
        </div>
      </form>
    </div>
  )
}
