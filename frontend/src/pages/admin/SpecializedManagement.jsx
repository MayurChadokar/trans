import React, { useState, useCallback, useEffect } from 'react'
import {
  Users, Search, UserPlus, Trash2, Edit3,
  X, User, Phone, MapPin, ChevronLeft,
  ChevronRight, Truck, Wrench, Shield, Briefcase
} from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import { useLocation } from 'react-router-dom'
import * as adminApi from '../../api/adminApi'

const ITEMS_PER_PAGE = 8

export default function SpecializedManagement() {
  const { pathname } = useLocation()
  const { mode, addDriver, updateDriver, deleteDriver, addStaff, updateStaff, deleteStaff } = useAdmin()
  const isTransport = mode === 'transport'
  const accentColor = '#7C3AED'
  
  const isDriverPage = pathname.includes('drivers') || pathname.includes('mechanics')
  const typeLabel = isDriverPage ? (isTransport ? 'Driver' : 'Mechanic') : 'Staff'

  const addFn = isDriverPage ? addDriver : addStaff
  const updateFn = isDriverPage ? updateDriver : updateStaff
  const deleteFn = isDriverPage ? deleteDriver : deleteStaff

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [localData, setLocalData] = useState([])
  const [total, setTotal] = useState(0)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminApi.getAdminSpecialUsers({
        target: mode,
        role: isDriverPage ? (isTransport ? 'driver' : 'mechanic') : 'staff',
        page,
        limit: ITEMS_PER_PAGE,
        q: search
      })
      if (res.success) {
        setLocalData(res.users.map(u => ({ ...u, id: u._id })))
        setTotal(res.pagination.total)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [mode, isDriverPage, isTransport, page, search])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleSave = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const entry = Object.fromEntries(form.entries())
    if (modal?.id) await updateFn(modal.id, entry)
    else await addFn(entry)
    setModal(null)
    fetchItems()
  }

  const handleDelete = async (id) => {
    if (window.confirm(`Delete this ${typeLabel.toLowerCase()}?`)) {
      await deleteFn(id)
      fetchItems()
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, margin: 0 }}>{typeLabel} Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Manage active platform {typeLabel.toLowerCase()}s</p>
        </div>
        <button className="btn btn-primary" style={{ background: accentColor, borderColor: accentColor }} onClick={() => setModal('add')}>
          <UserPlus size={18} /> Add {typeLabel}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 14 }}>
          <div className="input-group" style={{ flex: 1 }}>
            <Search className="input-icon" size={18} />
            <input type="text" className="form-input" placeholder={`Search by ${typeLabel.toLowerCase()} name or phone...`} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} style={{ paddingLeft: 44, height: 44 }} />
          </div>
        </div>

        <div style={{ overflowX: 'auto', position: 'relative', minHeight: localData.length === 0 ? '200px' : 'auto' }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div className="animate-spin" style={{ width: 24, height: 24, border: '3px solid ' + accentColor, borderTopColor: 'transparent', borderRadius: '50%' }}></div>
            </div>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['ID', 'Name / Info', 'Contact Phone', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '13px 24px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {localData.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                  <td style={{ padding: '14px 24px', fontSize: '0.8rem', fontWeight: 700, color: accentColor }}>#{item.id.slice(-6).toUpperCase()}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>ID: {item.id}</div>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '0.875rem', fontWeight: 600 }}>{item.phone || '—'}</td>
                  <td style={{ padding: '14px 24px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{new Date(item.joinedAt).toLocaleDateString() || 'Just now'}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-icon sm" onClick={() => setModal(item)}><Edit3 size={15} /></button>
                      <button className="btn-icon sm" style={{ color: 'var(--danger)', background: '#FEE2E2' }} onClick={() => handleDelete(item.id)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {localData.length === 0 && !loading && (
                <tr>
                   <td colSpan="5" style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <Briefcase size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                      <p style={{ margin: 0, fontWeight: 800, color: 'var(--text-muted)' }}>No {typeLabel.toLowerCase()}s found</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Records: {total}</p>
           <div style={{ display: 'flex', gap: 8 }}>
             <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
             <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: 700 }}>Page {page} of {totalPages}</span>
             <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
           </div>
        </div>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: 420, padding: 0 }}>
             <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ margin:0, fontWeight: 900 }}>{modal === 'add' ? 'Add' : 'Edit'} {typeLabel}</h3>
                <button className="btn-icon" onClick={() => setModal(null)}><X size={20} /></button>
             </div>
             <form onSubmit={handleSave} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label className="form-label">NAME *</label><input type="text" name="name" className="form-input" required defaultValue={modal.name} /></div>
                <div><label className="form-label">PHONE *</label><input type="tel" name="phone" className="form-input" required defaultValue={modal.phone} /></div>
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                   <button type="button" className="btn btn-ghost btn-full" onClick={() => setModal(null)}>Cancel</button>
                   <button type="submit" className="btn btn-primary btn-full" style={{ background: accentColor, borderColor: accentColor }}>Save {typeLabel}</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
