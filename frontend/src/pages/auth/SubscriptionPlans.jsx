import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Loader2, CreditCard, ShieldCheck, Zap, Star, LayoutDashboard, ChevronRight } from 'lucide-react'
import { getAvailablePlans, subscribeToPlan, createRazorpayOrder, verifyRazorpayPayment } from '../../api/planApi'
import { useAuth } from '../../context/AuthContext'
import { useVehicles } from '../../context/VehicleContext'
import logo from '../../assets/trans-logo.png'

export default function SubscriptionPlans() {
  const { user, login, logout } = useAuth()
  const { vehicles } = useVehicles()
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(null) // planId
  const [activeTab, setActiveTab] = useState('Monthly')

  useEffect(() => {
    const fetchPlans = async () => {
      if (!user?.role) return
      setLoading(true)
      const res = await getAvailablePlans({ target: user.role })
      if (res.success) {
        setPlans(res.plans)
      }
      setLoading(false)
    }
    fetchPlans()
  }, [user?.role])

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan) => {
    setSubmitting(plan._id);

    try {
      // 1. Create Order in Backend
      const orderRes = await createRazorpayOrder({ planId: plan._id });
      if (!orderRes.success) {
        alert(orderRes.message || "Failed to create order");
        setSubmitting(null);
        return;
      }

      // 2. Load Razorpay Script
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load. Are you online?");
        setSubmitting(null);
        return;
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_HERE",
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "TRANS Hub",
        description: `Subscription: ${orderRes.planName}`,
        image: logo,
        order_id: orderRes.orderId,
        handler: async (response) => {
          setSubmitting(plan._id); // keep loading
          
          // 4. Verify Payment in Backend
          const verifyRes = await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            planId: plan._id
          });

          if (verifyRes.success) {
            await login(verifyRes.user, verifyRes.accessToken);
            navigate('/dashboard', { replace: true });
          } else {
            alert(verifyRes.message || "Payment verification failed");
            setSubmitting(null);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#7C3AED",
        },
        modal: {
          ondismiss: () => setSubmitting(null)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error("Subscription Flow Error:", e);
      alert("Something went wrong with the payment process");
      setSubmitting(null);
    }
  };

  const filteredPlans = plans.filter(p => p.interval === activeTab)

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <Loader2 size={32} className="spin" color="var(--primary)" />
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>Fetching best plans for you...</p>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 940, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div className="text-center mb-6 sm:mb-10">
        <div style={{ 
          width: 50, height: 50, borderRadius: 16, background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
        }}>
          <img src={logo} alt="Logo" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginBottom: 8, letterSpacing: '-0.03em' }}>
          Step {user?.role === 'transport' ? '6' : '5'}: Choose a Plan
        </h2>
        <p className="text-sm sm:text-base" style={{ color: '#64748B', fontWeight: 500, maxWidth: 480, margin: '0 auto' }}>
          {user?.role === 'transport' ? (
            <>You have <strong style={{color: '#7C3AED'}}>{vehicles.length} vehicles</strong>. Pick a plan to get started.</>
          ) : (
            <>Pick a professional subscription to power your garage workflow.</>
          )}
        </p>

        <div style={{ 
          display: 'inline-flex', background: '#F1F5F9', padding: 4, borderRadius: 12, marginTop: 24,
          border: '1px solid #E2E8F0'
        }}>
          <button onClick={() => setActiveTab('Monthly')} style={{ padding: '8px 20px', borderRadius: 9, border: 'none', fontSize: '0.8125rem', fontWeight: 700, background: activeTab === 'Monthly' ? 'white' : 'transparent', color: activeTab === 'Monthly' ? '#1E293B' : '#64748B', boxShadow: activeTab === 'Monthly' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Monthly</button>
          <button onClick={() => setActiveTab('Yearly')} style={{ padding: '8px 20px', borderRadius: 9, border: 'none', fontSize: '0.8125rem', fontWeight: 700, background: activeTab === 'Yearly' ? 'white' : 'transparent', color: activeTab === 'Yearly' ? '#1E293B' : '#64748B', boxShadow: activeTab === 'Yearly' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Yearly <span style={{ color: '#16A34A', fontSize: '0.65rem', marginLeft: 4 }}>Save 20%</span></button>
        </div>
        
        <div style={{ marginTop: 16 }}>
          <button 
            type="button"
            onClick={() => logout()}
            style={{ 
              background: 'none', border: 'none', color: '#7C3AED', fontSize: '0.8rem', 
              fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' 
            }}
          >
            Logout & Start Over
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {filteredPlans.map((plan, idx) => {
          const isPro = plan.name.toLowerCase().includes('pro');
          const isAllowed = plan.allowedVehicles === 0 || vehicles.length <= plan.allowedVehicles;

          return (
            <div key={plan._id} 
              className={`relative overflow-hidden transition-all duration-200 ${submitting === plan._id ? 'scale-[0.98]' : ''} px-5 pt-4 pb-2 sm:px-8 sm:py-7 flex flex-col items-center text-center`}
              style={{ 
                background: 'white', borderRadius: 20, border: isPro ? '2px solid #7C3AED' : '1.5px solid #CBD5E1',
                boxShadow: isPro ? '0 15px 30px rgba(124, 58, 237, 0.06)' : '0 8px 20px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                 <div style={{ width: 26, height: 26, borderRadius: 6, background: isPro ? '#F5F3FF' : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isPro ? '#7C3AED' : '#64748B' }}>
                   {isPro ? <Zap size={14} fill="#7C3AED" /> : <Star size={14} />}
                 </div>
                 <h3 style={{ fontSize: '0.9375rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>{plan.name}</h3>
              </div>
              <div style={{ marginBottom: 10 }}>
                 <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                    <span className="text-lg sm:text-xl" style={{ fontWeight: 900, color: '#0F172A' }}>₹{plan.price}</span>
                   <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>/{plan.interval === 'Monthly' ? 'mo' : 'yr'}</span>
                 </div>
                 {plan.allowedVehicles > 0 && (
                    <div style={{ fontSize: '0.6rem', color: isAllowed ? '#16A34A' : '#EF4444', fontWeight: 700, marginTop: 2 }}>
                       Up to {plan.allowedVehicles} Vehicles Allowed
                    </div>
                 )}
              </div>
              <button 
                onClick={() => handleSubscribe(plan)} 
                disabled={!!submitting || !isAllowed} 
                className="h-[38px] sm:h-[42px] w-full rounded-[10px] flex items-center justify-center gap-2 transition-all duration-200"
                style={{ 
                  border: 'none', 
                  background: '#8B5CF6', color: 'white', 
                  fontSize: '0.75rem', fontWeight: 800, cursor: (submitting || !isAllowed) ? 'not-allowed' : 'pointer', 
                  opacity: !isAllowed ? 0.6 : 1, 
                }}
              >
                {submitting === plan._id ? <Loader2 size={18} className="spin" /> : (!isAllowed ? (user?.role === 'transport' ? 'Fleet too large' : 'Limit reached') : 'Subscribe Now')}
              </button>
            </div>
          )
        })}
      </div>
      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
