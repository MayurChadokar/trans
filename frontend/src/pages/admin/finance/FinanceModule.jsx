import React, { useState } from 'react'
import { Banknote, LayoutDashboard, Receipt, Loader2 } from 'lucide-react'
import { useFinanceStore } from '../../../hooks/useFinanceStore'
import FinanceDashboard from './FinanceDashboard'
import Receivables from './Receivables'
import PartyLedger from './PartyLedger'
import ReceivePaymentModal from './ReceivePaymentModal'

export default function FinanceModule() {
  const { invoices, payments, addPayment, stats, loading } = useFinanceStore()
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard, receivables, ledger
  const [selectedParty, setSelectedParty] = useState(null)
  const [payingInvoice, setPayingInvoice] = useState(null)

  const handleReceivePayment = (invoice) => {
    setPayingInvoice(invoice)
  }

  const handleSavePayment = (paymentData) => {
    addPayment(paymentData)
    setPayingInvoice(null)
  }

  const handleViewLedger = (partyName) => {
    setSelectedParty(partyName)
    setActiveTab('ledger')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    )
  }

  const accentColor = '#7C3AED'

  return (
    <div className="animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Banknote size={18} color={accentColor} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Financial Management · Platform Receivables
            </span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, margin: 0 }}>Finance & Receivables</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Monitor outstanding payments and manage party-wise financial records.
          </p>
        </div>
      </div>

      {/* ── Sub Navigation ── */}
      {activeTab !== 'ledger' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, background: 'var(--bg-alt)', padding: 6, borderRadius: 14, alignSelf: 'flex-start', width: 'fit-content' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'receivables', label: 'Receivables', icon: Receipt },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, transition: '0.2s',
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Content Area ── */}
      <main>
        {activeTab === 'dashboard' && (
          <FinanceDashboard stats={stats} invoices={invoices} payments={payments} />
        )}
        {activeTab === 'receivables' && (
          <Receivables 
            invoices={invoices} 
            onReceivePayment={handleReceivePayment} 
            onViewLedger={handleViewLedger}
          />
        )}
        {activeTab === 'ledger' && (
          <PartyLedger 
            partyName={selectedParty} 
            invoices={invoices} 
            payments={payments} 
            onBack={() => setActiveTab('receivables')}
          />
        )}
      </main>

      {/* ── Modals ── */}
      {payingInvoice && (
        <ReceivePaymentModal 
          invoice={payingInvoice} 
          onSave={handleSavePayment} 
          onClose={() => setPayingInvoice(null)} 
        />
      )}
    </div>
  )
}
