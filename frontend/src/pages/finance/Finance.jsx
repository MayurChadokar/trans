import { useState, useMemo } from 'react'
import { Plus, Search, Filter, TrendingUp, TrendingDown, Wallet, CreditCard, ArrowRightLeft, Calendar } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import { useParties } from '../../context/PartyContext'
import { useBills } from '../../context/BillContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'

const TxCard = ({ tx, partyName }) => {
  const isIncome = tx.type === 'income'
  // Improved display name logic
  const displayName = partyName || tx.category || 'General'
  const subInfo = tx.notes || tx.description || (tx.bill ? `Bill Ref: ${tx.bill.slice(-6).toUpperCase()}` : '')

  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: '14px 16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 14,
      border: '1px solid rgba(0,0,0,0.03)', marginBottom: 10
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isIncome ? '#DCFCE7' : '#FEE2E2', flexShrink: 0
      }}>
        {isIncome ? <TrendingUp size={20} color="#16A34A" /> : <TrendingDown size={20} color="#DC2626" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0F0D2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {displayName}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
          {subInfo}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: '#9CA3AF', marginTop: 3 }}>
          <span style={{ fontWeight: 600 }}>{dayjs(tx.date).format('DD MMM')}</span>
          <span>•</span>
          <span style={{ textTransform: 'capitalize' }}>{tx.paymentMode || 'cash'}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isIncome ? '#16A34A' : '#DC2626' }}>
          {isIncome ? '+' : '-'} ₹{parseFloat(tx.amount || 0).toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  )
}

export default function Finance() {
  const { transactions, stats: apiStats, loaded } = useFinance()
  const { parties } = useParties()
  const { bills } = useBills()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const userRole = user?.role || 'transport'
  const modulePrefix = userRole === 'transport' ? '/transport' : '/garage'

  const liveStats = useMemo(() => {
    if (apiStats) return apiStats
    
    // Fallback if not loaded yet
    return { totalIncome: 0, totalExpense: 0, cashBalance: 0, receivables: 0 }
  }, [apiStats])

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions
    return transactions.filter(t => t.type === filter)
  }, [transactions, filter])

  return (
    <div className="page-wrapper animate-fadeIn">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F0D2E', marginBottom: 2 }}>{userRole === 'transport' ? 'Transport Finance' : 'Garage Finance'}</h2>
        <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Track your cash flow and receivables</p>
      </div>

      {/* Main Stats Card */}
      {/* ... (rest of the card code remains the same) ... */}

      {/* Main Stats Card */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: 24, padding: '24px',
        color: 'white', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.25)', marginBottom: 24,
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative circle */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.9, marginBottom: 6 }}>
          <Wallet size={16} /> <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>CASH BALANCE</span>
        </div>
        <div style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: 24 }}>₹{liveStats.cashBalance.toLocaleString('en-IN')}</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 16px', borderRadius: 16 }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: 4, fontWeight: 600 }}>TOTAL INCOME</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>₹{liveStats.totalIncome.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 16px', borderRadius: 16 }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: 4, fontWeight: 600 }}>TOTAL SPENT</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>₹{liveStats.totalExpense.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="card" style={{ padding: '20px 14px', marginBottom: 24 }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 16 }}>Cash Flow Trend</h3>
        <div style={{ width: '100%', height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transactions.slice(-7).map(t => ({ name: dayjs(t.date).format('D MMM'), amt: t.amount, type: t.type }))}>
              <defs>
                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="amt" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { icon: TrendingUp, label: 'Income', bg: '#DCFCE7', color: '#16A34A', to: '/finance/add?type=income' },
          { icon: TrendingDown, label: 'Expense', bg: '#FEE2E2', color: '#DC2626', to: '/finance/add?type=expense' },
          { icon: CreditCard, label: 'Payments', bg: '#DBEAFE', color: '#2563EB', to: '/finance/add?type=income' },
          { icon: Wallet, label: 'Parties', bg: '#F3F4F6', color: '#4B5563', to: `${modulePrefix}/parties` },
        ].map(item => (
          <button key={item.label} onClick={() => navigate(item.to)} style={{
            background: 'white', border: 'none', borderRadius: 16, padding: '12px 6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <item.icon size={20} color={item.color} />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4B5563' }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Transactions List */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F0D2E' }}>Movements</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'income', 'expense'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '4px 12px', borderRadius: 99, border: 'none', fontSize: '0.7rem', fontWeight: 700,
              background: filter === f ? '#7C3AED' : 'rgba(0,0,0,0.05)',
              color: filter === f ? 'white' : '#6B7280', cursor: 'pointer', transition: 'all 0.15s'
            }}>
              {f === 'all' ? 'All' : f === 'income' ? 'Cash In' : 'Cash Out'}
            </button>
          ))}
        </div>
      </div>

      {!loaded ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 16 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 20, padding: '40px 20px', textAlign: 'center', border: '1px dashed #E5E7EB' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <ArrowRightLeft size={24} color="#9CA3AF" />
          </div>
          <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>No movements yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map(tx => {
            // Support both populated and unpopulated party field
            const txPartyId = (typeof tx.party === 'object') ? tx.party?._id : tx.party
            const party = parties.find(p => p._id === txPartyId || p.id === txPartyId)
            const partyName = (typeof tx.party === 'object') ? tx.party?.name : (party?.name || tx.category)
            
            return <TxCard key={tx._id || tx.id} tx={tx} partyName={partyName} />
          })}
        </div>
      )}
    </div>
  )
}
