import React, { useState, useMemo } from 'react'
import { Search, Filter, IndianRupee, CreditCard, ChevronLeft, ChevronRight, FileText, ArrowUpRight } from 'lucide-react'

const ITEMS_PER_PAGE = 8

export default function Receivables({ invoices, onReceivePayment, onViewLedger }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return invoices.filter(inv => {
      const matchSearch = !q || inv.partyName.toLowerCase().includes(q) || inv.id.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [invoices, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const getStatusStyle = (status) => {
    switch (status) {
      case 'paid': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }
      case 'partial': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }
      case 'unpaid': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }
      default: return { bg: 'var(--bg-alt)', color: 'var(--text-muted)' }
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-group" style={{ flex: '1 1 300px' }}>
            <Search className="input-icon" size={18} />
            <input
              type="text" className="form-input" placeholder="Search by Party Name or ID..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ paddingLeft: 44, height: 44 }}
            />
          </div>
          <select className="form-input" style={{ height: 44, width: 140, fontWeight: 700 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="All">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['Invoice / Date', 'Party Name', 'Total Amount', 'Paid', 'Due', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '13px 24px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(inv => {
                const style = getStatusStyle(inv.status)
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '0.85rem' }}>{inv.id}</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{inv.date}</p>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <button 
                        onClick={() => onViewLedger(inv.partyName)}
                        style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                      >
                       <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                         {inv.partyName} <ArrowUpRight size={12} />
                       </span>
                      </button>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontWeight: 800 }}>₹{inv.totalAmount.toLocaleString()}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>₹{inv.paidAmount.toLocaleString()}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ color: '#EF4444', fontWeight: 700 }}>₹{inv.dueAmount.toLocaleString()}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 99,
                        background: style.bg, color: style.color
                      }}>{inv.status}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {inv.status !== 'paid' && (
                          <button 
                            className="btn btn-primary sm" 
                            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                            onClick={() => onReceivePayment(inv)}
                          >
                            Receive Payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No receivables matching your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Page {page} of {totalPages}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
            <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
