import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import {
  Wrench, User, Plus, Trash2, CheckCircle2,
  Loader2, ArrowLeft, ChevronDown, FileText, Car, CreditCard
} from 'lucide-react'
import { useState } from 'react'
import { useBills } from '../../context/BillContext'
import { useParties } from '../../context/PartyContext'
import { useVehicles } from '../../context/VehicleContext'
import dayjs from 'dayjs'

// Import services data from CSV (raw text)
import servicesRaw from '../../data/services.csv?raw'

// Parse labels: extract strings starting with [ ], remove brackets, trim
// Headers are lines that don't start with whitespace
const SERVICES_DATA = servicesRaw
  .split('\n')
  .filter(line => line.includes('[ ]'))
  .map(line => {
    const isHeader = !line.startsWith(' ') && !line.startsWith('\t');
    const label = line.replace(/\[\s*\]/, '').trim();
    return { label, isHeader };
  })
  .filter(item => item.label.length > 0);

function Field({ label, error, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}</label>
      {children}
      {error && <span className="form-error">{error.message}</span>}
    </div>
  )
}

function SectionCard({ icon: Icon, iconBg, iconColor, title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '18px 18px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 14, border: '1px solid rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={iconColor} />
        </div>
        <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F0D2E', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}



export default function GarageBill({ initialData }) {
  const { addBill, updateBill } = useBills()
  const { parties } = useParties()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [savedBill, setSavedBill] = useState(null)
  
  const isEdit = !!initialData?._id

  // Custom dropdown state
  const [activeIdx, setActiveIdx] = useState(null)

  const { register, handleSubmit, watch, setValue, control, formState: { errors }, reset } = useForm({
    defaultValues: {
      billDate: dayjs(initialData?.billingDate || initialData?.billDate).format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
      partyId: initialData?.party?._id || initialData?.party || '',
      customerName: initialData?.customerName || '',
      customerPhone: initialData?.customerPhone || '',
      customerEmail: initialData?.customerEmail || '',
      customerAddress: initialData?.customerAddress || '',
      customerCity: initialData?.customerCity || '',
      customerState: initialData?.customerState || '',
      customerPincode: initialData?.customerPincode || '',
      customerGstin: initialData?.customerGstin || '',
      customerPan: initialData?.customerPan || '',
      customerSignatureUrl: initialData?.customerSignatureUrl || '',
      vehicleNo: initialData?.vehicleNo || '',
      vehicleModel: initialData?.vehicleModel || '',
      vehicleCompany: initialData?.vehicleCompany || '',
      kmReading: initialData?.kmReading || '',
      nextServiceKm: initialData?.nextServiceKm || '',
      nextServiceDate: initialData?.nextServiceDate ? dayjs(initialData.nextServiceDate).format('YYYY-MM-DD') : '',
      gstPercent: initialData?.gstPercent?.toString() || '0',
      laborCharge: initialData?.laborCharge?.toString() || '0',
      notes: initialData?.notes || '',
      items: initialData?.items?.map(it => ({ ...it, qty: it.qty?.toString(), rate: it.rate?.toString(), amount: it.amount?.toString() })) || [{ description: '', qty: '1', rate: '', amount: '' }],
    }
  })

  useEffect(() => {
    if (initialData?._id) {
      reset({
        billDate: dayjs(initialData.billingDate || initialData.billDate).format('YYYY-MM-DD'),
        partyId: initialData.party?._id || initialData.party || '',
        customerName: initialData.customerName || '',
        customerPhone: initialData.customerPhone || '',
        customerEmail: initialData.customerEmail || '',
        customerAddress: initialData.customerAddress || '',
        customerCity: initialData.customerCity || '',
        customerState: initialData.customerState || '',
        customerPincode: initialData.customerPincode || '',
        customerGstin: initialData.customerGstin || '',
        customerPan: initialData.customerPan || '',
        customerSignatureUrl: initialData.customerSignatureUrl || '',
        vehicleNo: initialData.vehicleNo || '',
        vehicleModel: initialData.vehicleModel || '',
        vehicleCompany: initialData.vehicleCompany || '',
        kmReading: initialData.kmReading || '',
        nextServiceKm: initialData.nextServiceKm || '',
        nextServiceDate: initialData?.nextServiceDate ? dayjs(initialData.nextServiceDate).format('YYYY-MM-DD') : '',
        gstPercent: initialData.gstPercent?.toString() || '0',
        laborCharge: initialData.laborCharge?.toString() || '0',
        notes: initialData.notes || '',
        items: initialData.items?.map(it => ({ ...it, qty: it.qty?.toString(), rate: it.rate?.toString(), amount: it.amount?.toString() })) || [{ description: '', qty: '1', rate: '', amount: '' }],
      })
    }
  }, [initialData, reset])

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
 
  const gstPercent  = watch('gstPercent')
  const laborCharge = watch('laborCharge')
  const items       = watch('items')
  const partyId     = watch('partyId')
  const vehicleNo   = watch('vehicleNo')

  const { vehicles } = useVehicles()

  // Auto-fill from vehicle number
  useEffect(() => {
    if (!vehicleNo || vehicleNo.length < 4) return
    const v = vehicles.find(x => x.vehicleNumber?.toUpperCase().replace(/\s+/g, '') === vehicleNo.toUpperCase().replace(/\s+/g, ''))
    
    if (v) {
      if (v.company) setValue('vehicleCompany', v.company)
      if (v.model) setValue('vehicleModel', v.model)
      if (v.kmReading) setValue('kmReading', v.kmReading)
      if (v.nextServiceKm) setValue('nextServiceKm', v.nextServiceKm)
      
      // If vehicle is linked to a party, auto-fill party as well
      if (v.partyId && !partyId) {
        setValue('partyId', v.partyId)
      } else if (v.customerName && !partyId) {
        // Fallback for independent vehicles
        setValue('customerName', v.customerName)
        if (v.customerPhone) setValue('customerPhone', v.customerPhone)
      }
    }
  }, [vehicleNo, vehicles, setValue, partyId])

  // Auto-fill from party
  useEffect(() => {
    if (!partyId) return
    const p = parties.find(x => x._id === partyId || x.id === partyId)
    if (p) {
      setValue('customerName', p.name)
      setValue('customerPhone', p.phone || '')
      setValue('customerEmail', p.email || '')
      setValue('customerAddress', p.address || '')
      setValue('customerCity', p.city || '')
      setValue('customerState', p.state || '')
      setValue('customerPincode', p.pincode || '')
      setValue('customerGstin', p.gstin || '')
      setValue('customerPan', p.pan || '')
      setValue('customerSignatureUrl', p.signatureUrl || '')
    }
  }, [partyId, parties, setValue])

  // Auto-calc item amounts
  useEffect(() => {
    (items || []).forEach((item, i) => {
      const qty = parseFloat(item.qty) || 0
      const rate = parseFloat(item.rate) || 0
      const amt = (qty * rate).toFixed(2)
      if (item.amount !== amt) setValue(`items.${i}.amount`, amt)
    })
  }, [items?.map(i => `${i.qty}_${i.rate}`).join(',')])

  const partsTotal  = (items || []).reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
  const labor       = parseFloat(laborCharge) || 0
  const subtotal    = partsTotal + labor
  const gstAmount   = subtotal * (parseFloat(gstPercent) || 0) / 100
  const grandTotal  = subtotal + gstAmount

  const onSubmit = async (data, statusArg = 'unpaid') => {
    if (saving) return;
    setSaving(true)
    try {
      const finalStatus = statusArg === 'draft' ? 'draft' : 'unpaid';

      const payload = {
        billType: 'garage',
        billingDate: data.billDate,
        party: data.partyId,
        ...data,
        partsTotal,
        laborCharge: labor,
        subTotal: subtotal,
        gstAmount,
        grandTotal,
        status: finalStatus,
      }

      let res;
      if (isEdit) {
        res = await updateBill(initialData._id, payload)
      } else {
        res = await addBill(payload)
      }
      setSavedBill(res)
    } catch (e) {
      alert('Failed to save bill. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (savedBill) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, textAlign: 'center', padding: 24 }}>
      <div style={{ width: 68, height: 68, borderRadius: 20, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeInUp 0.3s ease both' }}>
        <CheckCircle2 size={36} color="#16A34A" />
      </div>
      <h2 style={{ fontWeight: 800, color: '#0F0D2E' }}>Bill Created!</h2>
      <p style={{ color: '#6B7280' }}>Bill Number: #{savedBill.billNumber || 'Draft'}</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/bills/${savedBill._id || savedBill.id}`)}><FileText size={16} /> View Invoice</button>
        <button className="btn btn-ghost" onClick={() => navigate('/garage/bills/new')}><Plus size={16} /> New Bill</button>
        <button className="btn btn-ghost" onClick={() => navigate('/garage/bills')}>All Bills</button>
      </div>
    </div>
  )

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate('/garage/bills')} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0F0D2E', margin: 0 }}>Garage Bill</h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>Vehicle Service Invoice</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <input type="date" {...register('billDate')} className="form-input" style={{ fontSize: '0.8125rem', padding: '6px 10px', borderRadius: 10, background: 'white' }} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Customer */}
        <SectionCard icon={User} iconBg="#EDE9FE" iconColor="#7C3AED" title="Customer">
          {!partyId ? (
            <div className="grid grid-cols-1 gap-3">
              <Field label="Select Party">
                <div style={{ position: 'relative' }}>
                  <select {...register('partyId')} className="form-input" style={{ appearance: 'none', paddingRight: 36 }}>
                    <option value="">— Select customer —</option>
                    {parties.map(p => <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>)}
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                </div>
              </Field>
              <div className="grid sm-grid-cols-2 gap-3">
                <Field label="Customer Name" error={errors.customerName} required>
                  <input {...register('customerName', { required: 'Required' })} placeholder="Name" className={`form-input ${errors.customerName ? 'error' : ''}`} />
                </Field>
                <Field label="Phone">
                  <input {...register('customerPhone')} placeholder="Phone" className="form-input" inputMode="numeric" maxLength={10} />
                </Field>
                <Field label="Email">
                  <input {...register('customerEmail')} placeholder="Email" className="form-input" />
                </Field>
                <Field label="Address">
                  <input {...register('customerAddress')} placeholder="Address" className="form-input" />
                </Field>
                <Field label="City">
                  <input {...register('customerCity')} placeholder="City" className="form-input" />
                </Field>
                <Field label="State">
                  <input {...register('customerState')} placeholder="State" className="form-input" />
                </Field>
                <Field label="Pincode">
                  <input {...register('customerPincode')} placeholder="Pincode" className="form-input" />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="GSTIN">
                    <input {...register('customerGstin')} placeholder="GSTIN" className="form-input" />
                  </Field>
                  <Field label="PAN">
                    <input {...register('customerPan')} placeholder="PAN" className="form-input" />
                  </Field>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '16px', borderRadius: 20, border: '1.5px solid #F1F5F9' }}>
               <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0F0D2E', marginBottom: 2 }}>{watch('customerName')}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>
                    {watch('customerPhone') && `${watch('customerPhone')} • `}
                    {watch('customerCity') || watch('customerState') || 'No Location Details'}
                  </div>
               </div>
               <button 
                 type="button" 
                 onClick={() => {
                    setValue('partyId', '')
                    setValue('customerName', '')
                    setValue('customerPhone', '')
                    setValue('customerEmail', '')
                    setValue('customerAddress', '')
                    setValue('customerCity', '')
                    setValue('customerState', '')
                    setValue('customerPincode', '')
                    setValue('customerGstin', '')
                    setValue('customerPan', '')
                 }} 
                 style={{ background: 'white', color: '#7C3AED', border: '1.5px solid #7C3AED', borderRadius: 12, padding: '8px 16px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: '0.2s' }}
                 onMouseEnter={e => { e.currentTarget.style.background = '#F5F3FF' }}
                 onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
                >
                  Change Party
               </button>
            </div>
          )}
        </SectionCard>

        {/* Vehicle */}
        <SectionCard icon={Car} iconBg="#FEF3C7" iconColor="#D97706" title="Vehicle">
          <div className="grid sm-grid-cols-2 gap-3">
            <Field label="Vehicle Number" error={errors.vehicleNo} required>
              <input {...register('vehicleNo', { required: 'Required' })} placeholder="GJ15AB1234" className={`form-input ${errors.vehicleNo ? 'error' : ''}`} style={{ textTransform: 'uppercase' }} />
            </Field>
            <Field label="KM Reading">
              <input {...register('kmReading')} type="number" placeholder="45000" className="form-input" inputMode="numeric" />
            </Field>
            <Field label="Company">
              <input {...register('vehicleCompany')} placeholder="Maruti" className="form-input" />
            </Field>
            <Field label="Model">
              <input {...register('vehicleModel')} placeholder="Swift" className="form-input" />
            </Field>
            <Field label="Next Service KM">
              <input {...register('nextServiceKm')} type="number" placeholder="50000" className="form-input" inputMode="numeric" />
            </Field>
            <Field label="Next Service Date">
              <input {...register('nextServiceDate')} type="date" className="form-input" min={dayjs().format('YYYY-MM-DD')} />
            </Field>
          </div>
        </SectionCard>

        {/* Service Items */}
        <SectionCard icon={Wrench} iconBg="#DCFCE7" iconColor="#16A34A" title="Parts & Services">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Header - Desktop only */}
            <div className="hide-mobile" style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 0.8fr 0.8fr 36px', gap: 8, padding: '0 4px' }}>
              {['Description', 'Qty', 'Rate', 'Amount', ''].map(h => (
                <div key={h} style={{ fontSize: '0.625rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fields.map((field, index) => {
                const currentDesc = watch(`items.${index}.description`) || ''
                const filtered = SERVICES_DATA.filter(item => 
                  currentDesc === '' || item.label.toLowerCase().includes(currentDesc.toLowerCase())
                )

                return (
                  <div key={field.id} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 0.6fr 0.8fr 0.8fr 36px', 
                    gap: 8, 
                    alignItems: 'center',
                    position: 'relative'
                  }}>
                    {/* Description */}
                    <div style={{ position: 'relative' }}>
                      <input
                        {...register(`items.${index}.description`, { required: true })}
                        placeholder="Service / Part name"
                        className="form-input"
                        style={{ fontSize: '0.875rem', padding: '10px', width: '100%' }}
                        onFocus={() => setActiveIdx(index)}
                        onBlur={() => setTimeout(() => setActiveIdx(null), 200)}
                        autoComplete="off"
                      />
                      
                      {activeIdx === index && filtered.length > 0 && (
                        <div style={{
                          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                          background: 'white', border: '1px solid #E5E7EB', borderRadius: 12,
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                          marginTop: 4, maxHeight: 200, overflowY: 'auto'
                        }}>
                          {filtered.map((item, i) => (
                            <div key={i} onMouseDown={(e) => {
                              if (item.isHeader) return
                              e.preventDefault()
                              setValue(`items.${index}.description`, item.label, { shouldValidate: true })
                              setActiveIdx(null)
                            }} style={{
                              padding: '10px 14px', fontSize: '0.8125rem',
                              fontWeight: item.isHeader ? 800 : 500,
                              color: item.isHeader ? '#7C3AED' : '#0F0D2E',
                              background: item.isHeader ? '#F9F8FF' : 'white',
                            }}>
                              {item.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Qty */}
                    <input {...register(`items.${index}.qty`)} type="number" min="0.1" step="0.1" placeholder="1" className="form-input" style={{ fontSize: '0.875rem', padding: '10px', textAlign: 'center' }} inputMode="decimal" />

                    {/* Rate */}
                    <input {...register(`items.${index}.rate`)} type="number" min="0" step="0.01" placeholder="0" className="form-input" style={{ fontSize: '0.875rem', padding: '10px' }} inputMode="decimal" />

                    {/* Amount */}
                    <div style={{ background: '#F1F5F9', borderRadius: 10, padding: '10px', fontSize: '0.875rem', fontWeight: 700, color: '#0F0D2E', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      ₹{parseFloat(items[index]?.amount || 0).toFixed(0)}
                    </div>

                    {/* Delete */}
                    <button type="button" onClick={() => fields.length > 1 && remove(index)}
                      disabled={fields.length === 1}
                      style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: fields.length > 1 ? '#FEE2E2' : '#F1F5F9', cursor: fields.length > 1 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={14} color={fields.length > 1 ? '#DC2626' : '#CBD5E1'} />
                    </button>
                  </div>
                )
              })}
            </div>

            <button type="button" onClick={() => append({ description: '', qty: '1', rate: '', amount: '' })}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EDE9FE', color: '#7C3AED', border: 'none', borderRadius: 12, padding: '10px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8125rem', width: 'fit-content', marginTop: 8 }}>
              <Plus size={16} /> Add Another Item
            </button>

            {/* Labor + GST */}
            <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: 16, marginTop: 8 }}>
              <div className="grid sm-grid-cols-2 gap-3 mb-4">
                <Field label="Labour Charge (₹)">
                  <div className="input-group">
                    <span className="input-prefix">₹</span>
                    <input {...register('laborCharge')} type="number" min="0" step="0.01" placeholder="0" className="form-input" inputMode="decimal" />
                  </div>
                </Field>
                <Field label="GST Percentage">
                  <div style={{ position: 'relative' }}>
                    <select {...register('gstPercent')} className="form-input" style={{ appearance: 'none', paddingRight: 30 }}>
                      {['0','5','12','18'].map(g => <option key={g} value={g}>{g}%</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  </div>
                </Field>
              </div>

              {/* Summary Box */}
              <div style={{ background: '#1E1B4B', borderRadius: 18, padding: '16px 20px', boxShadow: '0 10px 25px -5px rgba(30, 27, 75, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.8125rem', marginBottom: 6 }}>
                  <span>Parts Subtotal</span><span>₹{partsTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.8125rem', marginBottom: 6 }}>
                  <span>Labour Charge</span><span>₹{labor.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.8125rem', marginBottom: 10 }}>
                  <span>GST Amount ({gstPercent}%)</span><span>₹{gstAmount.toFixed(2)}</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', color: 'white', fontWeight: 800, fontSize: '1.25rem' }}>
                  <span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Payment Mode */}


        {/* Notes */}
        <div style={{ background: 'white', borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 20, border: '1px solid #F1F5F9' }}>
          <Field label="Notes">
            <textarea {...register('notes')} placeholder="Warranty, terms..." className="form-input" style={{ minHeight: 60, fontSize: '0.875rem' }} />
          </Field>
        </div>

        <div className="btn-group btn-group-mobile-col" style={{ gap: 12 }}>
          <button type="button" className="btn btn-ghost btn-full" onClick={() => navigate('/garage/bills')} style={{ height: 52 }}>Cancel</button>
          
          <div style={{ flex: 2, display: 'flex', gap: 12 }}>
            <button 
              type="button" 
              className="btn btn-ghost btn-full" 
              onClick={handleSubmit(d => onSubmit(d, 'draft'))}
              disabled={saving}
              style={{ height: 52, flex: 1, border: '1.5px solid #E5E7EB' }}
            >
              Save as Draft
            </button>
            <button 
              id="btn-save-garage-bill" 
              type="submit" 
              className="btn btn-primary btn-full btn-lg" 
              disabled={saving} 
              style={{ height: 52, flex: 1.5 }}
            >
              {saving ? <><Loader2 size={18} className="spin" /> Generating…</> : <><CheckCircle2 size={18} /> {isEdit ? 'Update Bill' : 'Create Bill'}</>}
            </button>
          </div>
        </div>
      </form>
      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
