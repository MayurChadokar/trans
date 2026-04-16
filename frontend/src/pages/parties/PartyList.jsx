import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Users, Phone, MapPin,
  ChevronRight, Trash2, Edit2, X, FileText
} from 'lucide-react'
import { useParties } from '../../context/PartyContext'
import { useAuth } from '../../context/AuthContext'

// ── Avatar color palette ──────────────────────────────
const COLORS = [
  { bg: '#EDE9FE', text: '#5B21B6' },
  { bg: '#DBEAFE', text: '#1D4ED8' },
  { bg: '#DCFCE7', text: '#15803D' },
  { bg: '#FEF3C7', text: '#B45309' },
  { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#E0F2FE', text: '#0369A1' },
]
const avatarColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length] || COLORS[0]
const initials    = (name = '') => name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

// ── Single party card ────────────────────────────────
function PartyCard({ party, onEdit, onDelete, onClick }) {
  const [showActions, setShowActions] = useState(false)
  const col = avatarColor(party.name)

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 16,
        padding: '14px 16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'}
      onClick={() => onClick(party)}
    >
      {/* Avatar */}
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        background: col.bg, color: col.text,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: '0.9375rem', flexShrink: 0,
      }}>
        {initials(party.name)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F0D2E', marginBottom: 2 }}>
          {party.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {party.phone && (
            <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Phone size={11} /> {party.phone}
            </span>
          )}
          {party.city && (
            <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={11} /> {party.city}
            </span>
          )}
        </div>
        {party.gstin && (
          <div style={{ fontSize: '0.6875rem', color: '#9CA3AF', marginTop: 3 }}>
            GST: {party.gstin}
          </div>
        )}
      </div>

      {/* Balance chip */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontSize: '0.875rem', fontWeight: 700,
          color: party.balance > 0 ? '#DC2626' : party.balance < 0 ? '#16A34A' : '#6B7280'
        }}>
          {party.balance !== 0 ? `₹${Math.abs(party.balance)}` : '₹0'}
        </div>
        <div style={{ fontSize: '0.625rem', color: '#9CA3AF', marginTop: 2 }}>
          {party.balance > 0 ? 'to receive' : party.balance < 0 ? 'to pay' : 'settled'}
        </div>
      </div>

      {/* Actions trigger */}
      <button
        onClick={e => { e.stopPropagation(); setShowActions(s => !s) }}
        style={{
          width: 28, height: 28, borderRadius: 8, border: 'none',
          background: 'var(--bg)', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#6B7280',
        }}
      >
        <ChevronRight size={14} />
      </button>

      {/* Inline actions panel */}
      {showActions && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            background: 'white',
            display: 'flex', alignItems: 'center', gap: 0,
            borderLeft: '1px solid #F3F4F6',
            animation: 'slideInRight 0.18s ease both',
            borderRadius: '0 16px 16px 0',
          }}
        >
          <button
            onClick={() => onEdit(party)}
            style={{
              padding: '0 14px', height: '100%', border: 'none',
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: '0.8125rem', fontWeight: 600, color: '#7C3AED',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#EDE9FE'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Edit2 size={15} /> Edit
          </button>
          <button
            onClick={() => onDelete(party._id || party.id)}
            style={{
              padding: '0 14px', height: '100%', border: 'none',
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: '0.8125rem', fontWeight: 600, color: '#DC2626',
              borderRadius: '0 16px 16px 0',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Trash2 size={15} /> Delete
          </button>
          <button
            onClick={() => setShowActions(false)}
            style={{
              padding: '0 10px', height: '100%', border: 'none',
              background: 'transparent', cursor: 'pointer', color: '#9CA3AF',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// ── Delete confirm modal ─────────────────────────────
function DeleteModal({ name, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'white', borderRadius: 20, padding: '28px 24px',
          maxWidth: 340, width: '100%', textAlign: 'center',
          animation: 'fadeInUp 0.2s ease both',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: '#FEE2E2', margin: '0 auto 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Trash2 size={22} color="#DC2626" />
        </div>
        <h3 style={{ fontWeight: 800, marginBottom: 8, fontSize: '1.125rem' }}>Delete Party?</h3>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 24 }}>
          Delete <strong style={{ color: '#0F0D2E' }}>{name}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-full"
          >Cancel</button>
          <button
            onClick={onConfirm}
            className="btn btn-danger btn-full"
          >Delete</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────
export default function PartyList({ type }) {
  const { parties, deleteParty, loaded } = useParties()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDelete] = useState(null)

  const userRole = user?.role || 'transport'
  const moduleType = type || userRole
  const isAdmin = userRole === 'admin'

  const filtered = useMemo(() => {
    let list = parties
    // Filter by module if not admin
    if (!isAdmin) {
       list = list.filter(p => p.partyType === moduleType)
    } else if (type) {
       list = list.filter(p => p.partyType === type)
    }

    const q = search.toLowerCase().trim()
    if (!q) return list
    return list.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.phone?.includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.gstin?.toLowerCase().includes(q)
    )
  }, [parties, search, isAdmin, moduleType, type])

   const handleDelete = (id) => {
    const p = parties.find(x => (x._id || x.id) === id)
    setDelete(p)
  }
  const confirmDelete = () => {
    deleteParty(deleteTarget._id || deleteTarget.id)
    setDelete(null)
  }

  return (
    <div className="page-wrapper animate-fadeIn">

      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F0D2E', marginBottom: 2 }}>
            {moduleType === 'transport' ? 'Transport Parties' : 'Garage Customers'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            {filtered.length} {filtered.length === 1 ? 'record' : 'records'} found
          </p>
        </div>
        <button
          id="btn-add-party"
          className="btn btn-primary btn-sm"
          onClick={() => navigate(`/${moduleType}/parties/add`)}
        >
          <Plus size={16} /> Add Party
        </button>
      </div>

      {/* ── Search bar ── */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{
          position: 'absolute', left: 14, top: '50%',
          transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none'
        }} />
        <input
          id="party-search"
          type="text"
          placeholder="Search by name, phone, city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input"
          style={{ paddingLeft: 40, borderRadius: 14, background: 'white' }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Party list ── */}
      {!loaded ? (
        // Skeleton
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 76, borderRadius: 16 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        // Empty state
        <div style={{
          background: 'white', borderRadius: 20, padding: '48px 24px',
          textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, background: '#EDE9FE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Users size={28} color="#7C3AED" />
          </div>
          <h3 style={{ fontWeight: 700, marginBottom: 8, color: '#0F0D2E' }}>
            {search ? 'No results found' : 'No parties yet'}
          </h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 20 }}>
            {search
              ? `No party matches "${search}"`
              : 'Add your first client or customer to start billing'}
          </p>
          {!search && (
            <button
              id="btn-add-first-party"
              className="btn btn-primary"
              onClick={() => navigate(`/${moduleType}/parties/add`)}
            >
              <Plus size={16} /> Add Party
            </button>
          )}
        </div>
      ) : (
        // List
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(party => (
            <PartyCard
              key={party._id || party.id}
              party={party}
              onEdit={p => navigate(`/${moduleType}/parties/edit/${p._id || p.id}`)}
              onDelete={handleDelete}
              onClick={p => navigate(`/${moduleType}/parties/${p._id || p.id}`)}
            />
          ))}
        </div>
      )}

      {/* Summary strip */}
      {parties.length > 0 && !search && (
        <div style={{
          marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 10, 
        }}>
          {[
            { label: 'To Receive', value: parties.filter(p => p.balance > 0).reduce((s,p) => s + p.balance, 0), color: '#DC2626', bg: '#FEE2E2' },
            { label: 'To Pay',     value: Math.abs(parties.filter(p => p.balance < 0).reduce((s,p) => s + p.balance, 0)), color: '#16A34A', bg: '#DCFCE7' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'white', borderRadius: 14,
              padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <div style={{ width: 8, height: 36, borderRadius: 4, background: item.color }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: item.color, marginTop: 2 }}>
                  ₹{item.value.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile FAB spacer */}
      <div style={{ height: 8 }} />

      {/* Delete confirm modal */}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDelete(null)}
        />
      )}
    </div>
  )
}
