import React, { useMemo } from 'react'
import { ArrowLeft, Download, FileText, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react'

export default function PartyLedger({ partyName, invoices, payments, onBack }) {
  const ledgerData = useMemo(() => {
    // Collect all entries
    const entries = [
      ...invoices.filter(i => i.partyName === partyName).map(i => ({
        date: i.date,
        description: `Invoice ${i.id}`,
        debit: i.totalAmount,
        credit: 0,
        type: 'invoice'
      })),
      ...payments.filter(p => p.partyName === partyName).map(p => ({
        date: p.date,
        description: `Payment ${p.paymentMode}`,
        debit: 0,
        credit: p.amount,
        type: 'payment'
      }))
    ]

    // Sort by date then type (invoice before payment if same date)
    entries.sort((a, b) => {
      const dateCmp = new Date(a.date) - new Date(b.date)
      if (dateCmp !== 0) return dateCmp
      return a.type === 'invoice' ? -1 : 1
    })

    // Calculate running balance
    let currentBalance = 0
    return entries.map(entry => {
      currentBalance += (entry.debit - entry.credit)
      return { ...entry, balance: currentBalance }
    })
  }, [partyName, invoices, payments])

  const totals = useMemo(() => {
    return ledgerData.reduce((acc, curr) => ({
      debit: acc.debit + curr.debit,
      credit: acc.credit + curr.credit,
      balance: curr.balance // Last entry balance
    }), { debit: 0, credit: 0, balance: 0 })
  }, [ledgerData])

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn-icon" onClick={onBack} style={{ background: 'var(--bg-alt)' }}><ArrowLeft size={20} /></button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Party Ledger</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{partyName}</p>
          </div>
        </div>
        <button className="btn btn-ghost"><Download size={18} /> Export PDF</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Total Billed', value: totals.debit, icon: TrendingDown, color: '#EF4444', bg: '#FEE2E2' },
          { label: 'Total Received', value: totals.credit, icon: TrendingUp, color: '#10B981', bg: '#D1FAE5' },
          { label: 'Current Balance', value: totals.balance, icon: IndianRupee, color: 'var(--primary)', bg: 'var(--primary-lighter)' },
        ].map((s, idx) => (
          <div key={idx} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>{s.label}</p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>₹{s.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              {['Date', 'Description', 'Debit (Out)', 'Credit (In)', 'Balance'].map(h => (
                <th key={h} style={{ padding: '13px 24px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ledgerData.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: 600 }}>{row.date}</td>
                <td style={{ padding: '16px 24px', fontSize: '0.875rem' }}>{row.description}</td>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: row.debit > 0 ? '#EF4444' : 'var(--text-muted)' }}>
                  {row.debit > 0 ? `₹${row.debit.toLocaleString()}` : '-'}
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: row.credit > 0 ? '#10B981' : 'var(--text-muted)' }}>
                  {row.credit > 0 ? `₹${row.credit.toLocaleString()}` : '-'}
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 900 }}>₹{row.balance.toLocaleString()}</td>
              </tr>
            ))}
            {ledgerData.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '60px 24px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No transactions found for this party.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
