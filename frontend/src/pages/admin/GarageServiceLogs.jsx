import React, { useState, useMemo } from 'react'
import { Wrench, Search, Filter, Calendar, FileText, User, Car, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

const ITEMS_PER_PAGE = 8

export default function GarageServiceLogs() {
  const { invoices, mode } = useAdmin()
  const isTransport = mode === 'transport'
  const accentColor = '#7C3AED'
  
  // Filter only garage invoices that have service items
  const garageServices = useMemo(() => {
    // In a real app, we might check `type: 'garage'`. Here we filter GRG prefix or invoices with items.
    return invoices.filter(inv => inv.id.startsWith('GRG') && inv.items && inv.items.length > 0)
  }, [invoices])

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return garageServices.filter(s => 
      !q || s.businessName?.toLowerCase().includes(q) || 
      s.userName?.toLowerCase().includes(q) || 
      s.items?.some(it => it.description.toLowerCase().includes(q))
    )
  }, [garageServices, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Wrench size={18} color={accentColor} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
               Service Management · Platform Logs
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0 }}>Garage Service Logs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Detailed breakdown of all mechanical services performed across registered garages
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 14 }}>
          <div className="input-group" style={{ flex: 1 }}>
            <Search className="input-icon" size={18} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by garage, customer, or service item..." 
              value={search} 
              onChange={e => { setSearch(e.target.value); setPage(1) }} 
              style={{ paddingLeft: 44, height: 44 }} 
            />
          </div>
          <button className="btn btn-ghost" style={{ height: 44 }}><Filter size={18} /> Filters</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['Log ID / Date', 'Garage / Business', 'Service Items Breakdown', 'Customer', 'Profit / Amount'].map(h => (
                   <th key={h} style={{ padding: '13px 24px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                   <td style={{ padding: '16px 24px' }}>
                     <p style={{ margin: 0, fontWeight: 800, fontSize: '0.85rem' }}>{log.id}</p>
                     <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{log.date}</p>
                   </td>
                   <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{log.businessName}</div>
                      <div style={{ fontSize: '0.7rem', color: accentColor, fontWeight: 700 }}>VERIFIED WORKSHOP</div>
                   </td>
                   <td style={{ padding: '16px 24px', minWidth: 140 }}>
                      <button 
                        className="btn btn-ghost" 
                        style={{ fontSize: '0.75rem', fontWeight: 700, borderColor: `${accentColor}40`, color: accentColor, height: 36, padding: '0 16px' }}
                        onClick={() => setSelectedLog(log)}
                      >
                        <FileText size={14} style={{ marginRight: 6 }} /> Details
                      </button>
                   </td>
                   <td style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: 600 }}>{log.userName}</td>
                   <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontWeight: 900, fontSize: '1rem', color: '#16A34A' }}>₹{Number(log.total).toLocaleString()}</span>
                   </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                   <td colSpan="5" style={{ padding: '80px 24px', textAlign: 'center' }}>
                      <Wrench size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                      <h3 style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>No service logs found</h3>
                      <p style={{ color: 'var(--text-muted)' }}>Service data will appear once garage owners create itemized bills.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Service Entries: {filtered.length}</p>
           <div style={{ display: 'flex', gap: 8 }}>
             <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
             <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
           </div>
        </div>
      </div>
      {/* Details Modal */}
      {selectedLog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
          <div className="card animate-scaleIn" style={{ width: '90%', maxWidth: 450, padding: 0, border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.25rem' }}>Service Breakdown</h3>
                 <p style={{ margin: '4px 0 0', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Invoice ID: {selectedLog.id}</p>
               </div>
               <button className="btn-icon" onClick={() => setSelectedLog(null)} style={{ background: 'var(--bg-alt)' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '24px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 850, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Itemized Services</p>
                  {selectedLog.items.map((it, idx) => (
                    <div key={idx} style={{ padding: '16px', background: 'var(--bg-alt)', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                         <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{it.description}</span>
                         <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Qty: {it.qty || 1}</span>
                       </div>
                       <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-main)' }}>₹{(Number(it.amount) || 0).toLocaleString()}</span>
                    </div>
                  ))}
               </div>
               
               <div style={{ marginTop: 24, padding: '20px 16px', background: '#F0FDF4', borderRadius: 16, border: '1px dashed #16A34A40', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#166534', fontSize: '0.9rem' }}>Final Amount</span>
                  <span style={{ fontWeight: 900, fontSize: '1.5rem', color: '#16A34A' }}>₹{Number(selectedLog.total).toLocaleString()}</span>
               </div>
               
               <button className="btn btn-primary btn-full" style={{ marginTop: 24, background: accentColor, height: 48, fontSize: '0.9rem', fontWeight: 800 }} onClick={() => setSelectedLog(null)}>Close Breakdown</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  )
}
