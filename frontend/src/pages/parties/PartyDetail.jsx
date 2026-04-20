import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Phone, MapPin, Globe, CreditCard, 
  Receipt, TrendingUp, History, User, Mail, 
  ExternalLink, Calendar, Truck, CheckCircle2, Clock
} from 'lucide-react'
import { useParties } from '../../context/PartyContext'
import { useBills } from '../../context/BillContext'
import dayjs from 'dayjs'

const STATUS_MAP = {
  paid:    { label: 'Paid',    color: '#16A34A', bg: '#DCFCE7' },
  unpaid:  { label: 'Unpaid',  color: '#DC2626', bg: '#FEE2E2' },
  partial: { label: 'Partial', color: '#D97706', bg: '#FEF3C7' },
  topay:   { label: 'To Pay',  color: '#D97706', bg: '#FEF3C7' },
  tbb:     { label: 'TBB',     color: '#2563EB', bg: '#DBEAFE' },
  draft:   { label: 'Draft',   color: '#6B7280', bg: '#F3F4F6' },
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F0D2E', marginTop: 1 }}>{value}</div>
      </div>
    </div>
  )
}

function BillItem({ bill, onClick }) {
  const status = STATUS_MAP[bill.status] || STATUS_MAP.unpaid
  const itemCount = bill.items?.length || 0
  
  return (
    <div 
      onClick={() => onClick(bill._id || bill.id)}
      style={{ background: 'white', borderRadius: 18, padding: '14px 16px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: '0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#7C3AED'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#F1F5F9'}
    >
      <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F8FAFC', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Receipt size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F0D2E' }}>{bill.billNumber || 'DRAFT'}</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 6, background: status.bg, color: status.color }}>
            {status.label}
          </span>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 500 }}>
          {dayjs(bill.billDate || bill.createdAt).format('DD MMM, YYYY')} • {itemCount} Items
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F0D2E' }}>₹{(bill.grandTotal || 0).toLocaleString()}</div>
        <div style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 600 }}>Invoice Detail</div>
      </div>
    </div>
  )
}

export default function PartyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getParty, loaded: partiesLoaded } = useParties()
  const { bills, loaded: billsLoaded } = useBills()

  const party = useMemo(() => getParty(id), [id, getParty, partiesLoaded])
  
  const partyBills = useMemo(() => {
    return bills.filter(b => 
      (b.partyId === id || b.party?._id === id || b.party?.id === id) ||
      (b.billedToName && party && b.billedToName.toLowerCase().trim() === party.name.toLowerCase().trim())
    ).sort((a,b) => new Date(b.billDate || b.createdAt) - new Date(a.billDate || a.createdAt))
  }, [id, bills, party])

  const stats = useMemo(() => {
    const total = partyBills.reduce((s, b) => s + (b.grandTotal || 0), 0)
    const paid = partyBills.filter(b => b.status === 'paid').reduce((s, b) => s + (b.grandTotal || 0), 0)
    const pending = partyBills.filter(b => b.status !== 'paid' && b.status !== 'draft').reduce((s, b) => s + (b.grandTotal || 0), 0)
    return { total, paid, pending, count: partyBills.length }
  }, [partyBills])

  if (!partiesLoaded || !billsLoaded) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="skeleton" style={{ width: '100%', maxWidth: 500, height: 400, borderRadius: 28 }} />
      </div>
    )
  }

  if (!party) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3 style={{ color: '#0F0D2E', fontWeight: 800 }}>Party not found</h3>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>Go Back</button>
      </div>
    )
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ paddingBottom: 40 }}>
      {/* Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: 12, border: 'none', background: 'white', color: '#0F0D2E', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F0D2E', margin: 0 }}>Party Ledgers</h2>
      </div>

      {/* Main Profile Card */}
      <div style={{ background: 'white', borderRadius: 28, padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{ width: 70, height: 70, borderRadius: 22, background: 'linear-gradient(135deg, #7C3AED, #9333EA)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 900, boxShadow: '0 8px 20px rgba(124, 58, 237, 0.25)' }}>
            {party.name[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F0D2E', margin: '0 0 4px 0' }}>{party.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <Phone size={14} /> {party.phone || 'No phone'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <MapPin size={14} /> {party.city || 'No city'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          <StatCard icon={TrendingUp} label="Total Billed" value={`₹${stats.total.toLocaleString()}`} color="#7C3AED" bg="#F5F3FF" />
          <StatCard icon={CheckCircle2} label="Amount Paid" value={`₹${stats.paid.toLocaleString()}`} color="#16A34A" bg="#DCFCE7" />
          <StatCard icon={Clock} label="Pending" value={`₹${stats.pending.toLocaleString()}`} color="#DC2626" bg="#FEE2E2" />
        </div>
      </div>

      {/* Details Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'white', borderRadius: 24, padding: '20px', border: '1px solid #F1F5F9' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <User size={16} /> Contact Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: '0.8rem' }}><span style={{ color: '#94A3B8', fontWeight: 600 }}>Phone: </span> <span style={{ color: '#1E293B', fontWeight: 700 }}>{party.phone || '—'}</span></div>
            <div style={{ fontSize: '0.8rem' }}><span style={{ color: '#94A3B8', fontWeight: 600 }}>Email: </span> <span style={{ color: '#1E293B', fontWeight: 700 }}>{party.email || '—'}</span></div>
            <div style={{ fontSize: '0.8rem' }}><span style={{ color: '#94A3B8', fontWeight: 600 }}>GSTIN: </span> <span style={{ color: '#1E293B', fontWeight: 700 }}>{party.gstin || 'No GST'}</span></div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: 24, padding: '20px', border: '1px solid #F1F5F9' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <MapPin size={16} /> Address Info
          </h3>
          <div style={{ fontSize: '0.8rem', color: '#1E293B', fontWeight: 700, lineHeight: 1.5 }}>
            {party.address || party.city || 'No address details provided.'}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <History size={18} color="#0F0D2E" />
        <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0F0D2E', margin: 0 }}>Transaction History</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {partyBills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 24, border: '1px dashed #E2E8F0' }}>
            <Receipt size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
            <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>No invoices found for this party.</div>
          </div>
        ) : (
          partyBills.map(bill => (
            <BillItem key={bill._id} bill={bill} onClick={(id) => navigate(`/bills/${id}`)} />
          ))
        )}
      </div>
    </div>
  )
}
