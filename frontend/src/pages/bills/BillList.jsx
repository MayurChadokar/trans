import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, FileText, Truck, Wrench, X, Trash2, Eye } from 'lucide-react'
import { useBills } from '../../context/BillContext'
import { useAuth } from '../../context/AuthContext'
import dayjs from 'dayjs'

const STATUS_MAP = {
  paid:    { label: 'Paid',    color: '#16A34A', bg: '#DCFCE7' },
  unpaid:  { label: 'Unpaid',  color: '#DC2626', bg: '#FEE2E2' },
  partial: { label: 'Partial', color: '#D97706', bg: '#FEF3C7' },
  topay:   { label: 'To Pay',  color: '#D97706', bg: '#FEF3C7' },
  tbb:     { label: 'TBB',     color: '#2563EB', bg: '#DBEAFE' },
  draft:   { label: 'Draft',   color: '#6B7280', bg: '#F3F4F6' },
}

function PartyCard({ party, onClick }) {
  const billCount = party.bills.length
  return (
    <div
      onClick={() => onClick(party.name)}
      style={{
        background: 'white', borderRadius: 20, padding: '18px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
        border: '1px solid rgba(0,0,0,0.02)', transition: '0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-lighter)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.02)'; e.currentTarget.style.transform = 'none' }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 16, flexShrink: 0,
        background: '#F0F9FF', color: '#0369A1',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.25rem'
      }}>
        {party.name[0]?.toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0F0D2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {party.name}
        </h3>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>
          {billCount} Bill{billCount !== 1 ? 's' : ''} • {party.bills.filter(b => b.status === 'paid').length} Paid
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 900, fontSize: '1rem', color: '#0F0D2E', marginBottom: 2 }}>
          ₹{party.totalAmount.toLocaleString()}
        </div>
        {party.pendingAmount > 0 && (
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#DC2626', background: '#FEE2E2', padding: '2px 6px', borderRadius: 6, display: 'inline-block' }}>
            PENDING: ₹{party.pendingAmount.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}

function BillCard({ bill, onClick, onDelete }) {
  const status = STATUS_MAP[bill.status] || STATUS_MAP.unpaid
  const isTransport = bill.billType === 'transport'
  
  const partyName = isTransport ? (bill.billedToName || bill.party?.name || 'Consolidated Bill') : (bill.customerName || bill.party?.name || '—')
  const itemCount = bill.items?.length || 0
  const subInfo = isTransport 
    ? `${itemCount} Trip${itemCount !== 1 ? 's' : ''}` 
    : (bill.vehicleNo || '—')

  return (
    <div
      onClick={() => onClick(bill)}
      style={{
        background: 'white', borderRadius: 20, padding: '16px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
        border: '1px solid rgba(0,0,0,0.02)', transition: '0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-lighter)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.02)'; e.currentTarget.style.transform = 'none' }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: isTransport ? '#FFF7ED' : '#F5F3FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isTransport
          ? <Truck size={22} color="#F3811E" />
          : <Wrench size={22} color="#7C3AED" />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F0D2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {bill.billNumber || 'DRAFT'}
          </span>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {dayjs(bill.billDate || bill.createdAt).format('DD MMM')} • {subInfo}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div style={{ fontWeight: 900, fontSize: '1rem', color: '#0F0D2E', marginBottom: 6 }}>
          ₹{(bill.grandTotal || 0).toLocaleString()}
        </div>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <button onClick={e => { e.stopPropagation(); onClick(bill) }}
            style={{ width: 28, height: 28, border: 'none', background: '#F3F4F6', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Eye size={12} color="#6B7280" />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(bill._id) }}
            style={{ width: 28, height: 28, border: 'none', background: '#FEE2E2', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={12} color="#DC2626" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BillList({ type }) {
  const { bills, deleteBill, loaded } = useBills()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedParty, setSelectedParty] = useState(null)

  const userRole = user?.role || 'transport'
  const moduleType = type || userRole
  const isAdmin = userRole === 'admin'

  const filtered = useMemo(() => {
    let list = bills
    // Filter by module if not admin
    if (!isAdmin) {
       list = list.filter(b => b.billType === moduleType)
    } else if (type) {
       list = list.filter(b => b.billType === type)
    }

    if (filter === 'paid')      list = list.filter(b => b.status === 'paid')
    if (filter === 'draft')     list = list.filter(b => b.status === 'draft')
    if (filter === 'unpaid')    list = list.filter(b => (b.status !== 'paid' && b.status !== 'draft'))
    if (filter === 'transport') list = list.filter(b => b.billType === 'transport')
    if (filter === 'garage')    list = list.filter(b => b.billType === 'garage')
    
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(b =>
        b.billNumber?.toLowerCase().includes(q) ||
        b.billedToName?.toLowerCase().includes(q) ||
        b.customerName?.toLowerCase().includes(q) ||
        b.vehicleNo?.toLowerCase().includes(q) ||
        b.items?.some(item => 
          item.companyFrom?.toLowerCase().includes(q) || 
          item.companyTo?.toLowerCase().includes(q) || 
          item.chalanNo?.toLowerCase().includes(q)
        )
      )
    }
    return list
  }, [bills, filter, search, isAdmin, userRole, moduleType, type])

  const groupedByParty = useMemo(() => {
    const map = {};
    filtered.forEach(bill => {
      const name = bill.billType === 'transport' 
        ? (bill.billedToName || bill.party?.name || 'Uncategorized') 
        : (bill.customerName || bill.party?.name || 'Uncategorized');
      
      const key = name.toLowerCase().trim();
      if (!map[key]) {
        map[key] = { name, bills: [], totalAmount: 0, pendingAmount: 0 };
      }
      map[key].bills.push(bill);
      map[key].totalAmount += (bill.grandTotal || 0);
      if (bill.status !== 'paid' && bill.status !== 'draft') {
        map[key].pendingAmount += (bill.grandTotal || 0);
      }
    });

    // If a search is active, we might want to prioritize parties that match the search name
    // but the 'filtered' list already filters individual bills. 
    return Object.values(map).sort((a,b) => b.totalAmount - a.totalAmount);
  }, [filtered]);

  const displayedBillsForParty = useMemo(() => {
    if (!selectedParty) return [];
    return filtered.filter(bill => {
      const name = bill.billType === 'transport' 
        ? (bill.billedToName || bill.party?.name || 'Uncategorized') 
        : (bill.customerName || bill.party?.name || 'Uncategorized');
      return name.toLowerCase().trim() === selectedParty.toLowerCase().trim();
    });
  }, [selectedParty, filtered]);

  const totals = useMemo(() => {
    const list = (isAdmin && !type) ? bills : bills.filter(b => b.billType === (type || userRole))
    const paid = list.filter(b => b.status === 'paid').reduce((s, b) => s + (b.grandTotal || 0), 0)
    const pending = list.filter(b => b.status !== 'paid' && b.status !== 'draft').reduce((s, b) => s + (b.grandTotal || 0), 0)
    return { paid, pending, count: list.length }
  }, [bills, isAdmin, userRole, type])

  const FILTERS = [
    { val: 'all',       label: 'All' },
    { val: 'unpaid',    label: 'Pending' },
    { val: 'paid',      label: 'Paid' },
    { val: 'draft',     label: 'Draft' },
    ...(isAdmin && !type ? [
      { val: 'transport', label: '🚛 Transport' },
      { val: 'garage',    label: '🔧 Garage' }
    ] : []),
  ]

  return (
    <div className="page-wrapper animate-fadeIn" style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontWeight: 900, fontSize: window.innerWidth < 640 ? '1.25rem' : '1.5rem', color: '#0F0D2E', margin: 0 }}>
            {moduleType === 'transport' ? 'Transport Bills' : 'Garage Bills'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>{totals.count} managed</p>
        </div>
        <button 
          className={window.innerWidth < 640 ? "btn btn-primary btn-sm" : "btn btn-primary btn-lg"} 
          onClick={() => navigate(`/${moduleType}/bills/new`)} 
          style={{ borderRadius: 12, height: window.innerWidth < 640 ? 40 : 'auto', padding: window.innerWidth < 640 ? '0 12px' : '14px 28px' }}
        >
          <Plus size={window.innerWidth < 640 ? 18 : 20} /> <span className="hide-mobile">Add New</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div style={{ background: 'white', borderRadius: 28, padding: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', marginBottom: 24 }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input type="text" placeholder="Search bills, companies, chalan..." value={search} onChange={e => setSearch(e.target.value)}
            className="form-input" style={{ paddingLeft: 44, height: 48, borderRadius: 16, border: '1px solid #F3F4F6' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {FILTERS.map(f => (
            <button key={f.val} onClick={() => setFilter(f.val)}
              style={{
                padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                background: filter === f.val ? '#0F0D2E' : '#F3F4F6',
                color: filter === f.val ? 'white' : '#6B7280',
                fontWeight: 700, fontSize: '0.8rem', transition: '0.2s'
              }}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* Selected Party Header */}
      {selectedParty && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button onClick={() => setSelectedParty(null)} style={{ border: 'none', background: '#F3F4F6', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', color: '#4B5563', display: 'flex', alignItems: 'center', gap: 6 }}>
            <X size={14} /> Back to Parties
          </button>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F0D2E' }}>
            {selectedParty}
          </div>
        </div>
      )}

      {/* List */}
      {!loaded ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 20 }} />)}
        </div>
      ) : groupedByParty.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 28 }}>
          <FileText size={48} color="#E5E7EB" style={{ marginBottom: 16 }} />
          <h3 style={{ margin: 0, color: '#111827' }}>No bills found</h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>{search ? 'Try a different search term' : 'Start by creating a new invoice'}</p>
        </div>
      ) : selectedParty ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayedBillsForParty.map(bill => (
            <BillCard key={bill._id} bill={bill} onClick={b => navigate(`/bills/${b._id}`)} onDelete={deleteBill} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {groupedByParty.map(party => (
            <PartyCard key={party.name} party={party} onClick={setSelectedParty} />
          ))}
        </div>
      )}
    </div>
  )
}
