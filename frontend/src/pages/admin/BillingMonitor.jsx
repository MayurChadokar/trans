import React, { useState, useMemo } from 'react'
import {
  FileText, Search, Plus, Filter, Download,
  IndianRupee, CheckCircle, AlertCircle, Clock,
  MoreVertical, X, Calendar, ChevronLeft, ChevronRight,
  TrendingUp, CreditCard, Banknote, Trash2, Edit3, Truck, Wrench
} from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

const ITEMS_PER_PAGE = 8

function InvoiceModal({ mode, businesses, users, existing, onSave, onClose }) {
  const isTransport = mode === 'transport'
  const [form, setForm] = useState(existing || {
    id: '',
    businessId: '',
    userId: '',
    total: '',
    status: 'Pending',
    notes: ''
  })

  // Derive businessName and userName for storage
  const handleSave = (e) => {
    e.preventDefault()
    const биз = businesses.find(b => b.id === form.businessId)
    const уср = users.find(u => u.id === form.userId)
    onSave({
      ...form,
      businessName: биз ? биз.name : 'Unknown Business',
      userName: уср ? уср.name : 'Unknown User',
      total: Number(form.total)
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div className="card animate-scaleIn" style={{ width: '100%', maxWidth: 500, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontWeight: 900 }}>{existing ? 'Invoice Details' : 'View Invoice'}</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
    <form style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          <div className="form-group">
            <label className="form-label">ASSOCIATED BUSINESS *</label>
            <input type="text" className="form-input" disabled value={form.businessName || 'N/A'} />
          </div>

          <div className="form-group">
            <label className="form-label">{isTransport ? 'TRANSPORTER / OWNER *' : 'OWNER / CUSTOMER *'}</label>
            <input type="text" className="form-input" disabled value={form.userName || 'N/A'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">TOTAL AMOUNT (₹) *</label>
              <div className="input-group">
                <IndianRupee className="input-icon" size={16} />
                <input type="number" className="form-input" disabled placeholder="0.00" value={form.total} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">PAYMENT STATUS</label>
              <select className="form-input" disabled value={form.status}>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">NOTES (OPTIONAL)</label>
            <textarea className="form-input" disabled style={{ height: 60, resize: 'none' }} placeholder="No additional details..." value={form.notes} />
          </div>

          {existing?.items && existing.items.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <label className="form-label">SERVICE ITEMS</label>
              <div style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: 12, marginTop: 6, fontSize: '0.8rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)', fontWeight: 800, color: 'var(--text-secondary)' }}>
                  <span>ITEM</span><span>QTY</span><span>AMT</span>
                </div>
                {existing.items.map((it, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, paddingTop: 8, fontWeight: 600 }}>
                    <span>{it.description}</span><span>{it.qty}</span><span>₹{Number(it.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-primary btn-full" onClick={onClose}>Close Details</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BillingMonitor() {
  const { mode, invoices, addInvoice, updateInvoice, deleteInvoice, businesses, users, stats } = useAdmin()
  const isTransport = mode === 'transport'
  const accentColor = '#7C3AED'
  const accentLight = '#EDE9FE'

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return invoices.filter(inv => {
      const matchSearch = !q || inv.id.toLowerCase().includes(q) || inv.businessName?.toLowerCase().includes(q) || inv.userName?.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [invoices, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleSave = (form) => {
    if (modal?.id) updateInvoice(modal.id, form)
    else addInvoice(form)
    setModal(null)
  }

  return (
    <div className="animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <CreditCard size={18} color={accentColor} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Financial Oversight · {isTransport ? 'Transport' : 'Garage'} Invoices
            </span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, margin: 0 }}>Billing Monitor</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Track and manage all system-wide financial transactions
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost"><Download size={18} /> Export Data</button>
        </div>
      </div>

      {/* ── Stats Summary ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Total Billed', value: `₹${(stats.totalRevenue + stats.pendingRevenue).toLocaleString()}`, icon: IndianRupee, color: accentColor, bg: accentLight },
          { label: 'Settled', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: CheckCircle, color: '#10B981', bg: '#D1FAE5' },
          { label: 'Outstanding', value: `₹${stats.pendingRevenue.toLocaleString()}`, icon: AlertCircle, color: '#EF4444', bg: '#FEE2E2' },
        ].map((s, idx) => (
          <div key={idx} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={26} color={s.color} />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{s.label}</p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '2px 0 0' }}>{s.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* ── Invoice Registry ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-group" style={{ flex: '1 1 300px' }}>
            <Search className="input-icon" size={18} />
            <input
              type="text" className="form-input" placeholder="Search by Invoice ID, Business or User..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ paddingLeft: 44, height: 44 }}
            />
          </div>
          <select className="form-input" style={{ height: 44, width: 140, fontWeight: 700 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
          </select>
          <button className="btn btn-ghost" style={{ height: 44 }}><Calendar size={18} /></button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['Ref / Date', 'Business Info', 'Associated User', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '13px 24px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} className="table-row-hover">
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={16} color="var(--primary)" />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.85rem' }}>{inv.id}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{inv.date}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isTransport ? <Truck size={14} color="var(--text-muted)" /> : <Wrench size={14} color="var(--text-muted)" />}
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{inv.businessName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{inv.userName}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 900, fontSize: '1rem' }}>₹{(inv.total || 0).toLocaleString()}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>TAX: ₹{(inv.tax || 0).toLocaleString()}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 99,
                      background: inv.status === 'Paid' ? 'var(--success-light)' : inv.status === 'Pending' ? '#FEF3C7' : 'var(--primary-lighter)',
                      color: inv.status === 'Paid' ? 'var(--success)' : inv.status === 'Pending' ? '#D97706' : 'var(--primary)'
                    }}>{inv.status}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost sm" style={{ color: accentColor, fontWeight: 700 }} onClick={() => setModal(inv)}>View Details</button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <FileText size={48} color="var(--text-muted)" strokeWidth={1} style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ margin: 0, fontWeight: 800 }}>No invoice records</h3>
                    <p style={{ margin: '6px 0 16px', color: 'var(--text-muted)' }}>The financial records history is currently empty.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Showing {paginated.length} results</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
            <button className="btn btn-primary btn-sm" style={{ background: accentColor, borderColor: accentColor }}>{page}</button>
            <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {modal && (
        <InvoiceModal
          mode={mode}
          businesses={businesses}
          users={users}
          existing={modal !== 'add' ? modal : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      <style>{`
        .table-row-hover:hover { background: rgba(0,0,0,0.01); }
      `}</style>
    </div>
  )
}
