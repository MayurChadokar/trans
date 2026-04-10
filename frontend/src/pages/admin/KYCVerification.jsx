import React, { useMemo, useState } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, ShieldCheck, Building2, User, Phone, 
  MapPin, Calendar, FileText, CheckCircle2, XCircle, 
  Eye, Download, AlertCircle, Clock
} from 'lucide-react'
import dayjs from 'dayjs'

export default function KYCVerification() {
  const { businesses, updateBusiness, mode } = useAdmin()
  const navigate = useNavigate()
  const isTransport = mode === 'transport'
  
  const [selectedBiz, setSelectedBiz] = useState(null)
  const [filter, setFilter] = useState('All')

  const filteredList = useMemo(() => {
    return businesses.filter(biz => {
      if (filter === 'All') return true
      return (biz.kycStatus || 'Pending') === filter
    })
  }, [businesses, filter])

  const handleVerify = (id, status) => {
    updateBusiness(id, { kycStatus: status })
    if (selectedBiz?.id === id) {
      setSelectedBiz(prev => ({ ...prev, kycStatus: status }))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified': return { bg: '#F0FDF4', text: '#16A34A', border: '#DCFCE7' }
      case 'Rejected': return { bg: '#FEF2F2', text: '#DC2626', border: '#FEE2E2' }
      case 'Pending': return { bg: '#FFF7ED', text: '#EA580C', border: '#FFEDD5' }
      default: return { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' }
    }
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={() => navigate('/admin/dashboard')}
            style={{ 
              width: 40, height: 40, borderRadius: 12, border: 'none', 
              background: 'white', color: '#111', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              KYC Verification
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
               Review and verify {isTransport ? 'Transporter' : 'Garage'} business documents
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', background: '#F1F5F9', padding: 4, borderRadius: 12 }}>
          {['All', 'Pending', 'Verified', 'Rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 700,
                background: filter === f ? 'white' : 'transparent',
                color: filter === f ? '#7C3AED' : '#64748B',
                boxShadow: filter === f ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                transition: '0.2s'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedBiz ? '1fr 400px' : '1fr', gap: 24, transition: 'all 0.4s' }}>
        {/* List Section */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Business</th>
                <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Documents</th>
                <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '18px 24px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: 60, textAlign: 'center', color: '#94A3B8' }}>
                    <ShieldCheck size={48} strokeWidth={1} style={{ opacity: 0.2, marginBottom: 16 }} />
                    <p style={{ fontWeight: 600 }}>No KYC requests found</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((biz) => {
                  const status = biz.kycStatus || 'Pending'
                  const colors = getStatusColor(status)
                  return (
                    <tr 
                      key={biz.id} 
                      onClick={() => setSelectedBiz(biz)}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: '0.2s', cursor: 'pointer', background: selectedBiz?.id === biz.id ? '#F8FAFC' : 'transparent' }}
                      className="hover:bg-slate-50"
                    >
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                            <Building2 size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{biz.name || biz.businessName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{biz.ownerName} • {biz.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                          <FileText size={14} /> 3 Documents Uploaded
                        </div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800,
                          background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`
                        }}>
                          {status}
                        </span>
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                        <button style={{ background: 'none', border: 'none', color: '#7C3AED', cursor: 'pointer', padding: 8 }}>
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Details Section */}
        {selectedBiz && (
          <div className="animate-slideInRight" style={{ background: 'white', borderRadius: 24, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.05)', height: 'fit-content', position: 'sticky', top: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>Verification Details</h3>
              <button 
                onClick={() => setSelectedBiz(null)}
                style={{ background: '#F1F5F9', border: 'none', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <XCircle size={16} color="#64748B" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Profile Card */}
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 16, border: '1px solid #F1F5F9' }}>
                <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>{selectedBiz.name || selectedBiz.businessName}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: 12 }}>ID: {selectedBiz.id}</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#475569' }}>
                    <User size={14} /> <span>{selectedBiz.ownerName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#475569' }}>
                    <Phone size={14} /> <span>{selectedBiz.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#475569' }}>
                    <MapPin size={14} /> <span>{selectedBiz.city}, {selectedBiz.location || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12 }}>Submitted Documents</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { name: 'Aadhar Card (Front & Back)', size: '1.2 MB' },
                    { name: 'Trade License / PAN', size: '0.8 MB' },
                    { name: 'Business Proof (GSTR/Light Bill)', size: '2.1 MB' }
                  ].map((doc, i) => (
                    <div key={i} style={{ padding: 12, borderRadius: 12, border: '1px solid #F1F5F9', background: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                        <FileText size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B' }}>{doc.name}</div>
                        <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{doc.size} • PDF Upload</div>
                      </div>
                      <button style={{ padding: 6, borderRadius: 6, border: 'none', background: '#F8FAFC', color: '#64748B', cursor: 'pointer' }}>
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button 
                  onClick={() => handleVerify(selectedBiz.id, 'Verified')}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#16A34A', color: 'white', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }}
                >
                  <CheckCircle2 size={18} /> Approve
                </button>
                <button 
                   onClick={() => handleVerify(selectedBiz.id, 'Rejected')}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#DC2626', color: 'white', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)' }}
                >
                  <XCircle size={18} /> Reject
                </button>
              </div>

              {(selectedBiz.kycStatus === 'Verified' || selectedBiz.kycStatus === 'Rejected') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', borderRadius: 12, background: selectedBiz.kycStatus === 'Verified' ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${selectedBiz.kycStatus === 'Verified' ? '#DCFCE7' : '#FEE2E2'}`, color: selectedBiz.kycStatus === 'Verified' ? '#16A34A' : '#DC2626', fontSize: '0.8rem', fontWeight: 700 }}>
                  <AlertCircle size={14} />
                  <span>This profile has been marked as {selectedBiz.kycStatus}.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  )
}
