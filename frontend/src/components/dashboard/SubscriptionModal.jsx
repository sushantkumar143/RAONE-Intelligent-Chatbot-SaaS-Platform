import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Sparkles } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';

const plans = [
  {
    id: 'free',
    name: 'Free Tier',
    price: '₹0',
    description: 'Perfect for getting started',
    features: [
      'Standard RAG Pipeline',
      'Basic Embeddings',
      'Limited Token Usage',
      'Standard Support'
    ],
    recommended: false,
  },
  {
    id: 'pro',
    name: 'RAONE Pro',
    price: '₹199',
    period: '/month',
    description: 'For professionals requiring higher accuracy',
    features: [
      'Hybrid Search (FAISS + BM25)',
      'High-Precision Reranking',
      'Incremental Chat Support',
      'Priority Support'
    ],
    recommended: true,
  },
  {
    id: 'ultra_pro',
    name: 'RAONE Ultra Pro',
    price: '₹499',
    period: '/month',
    description: 'Maximum capabilities and unlimited scaling',
    features: [
      'Unlimited Searching',
      'Premium Embeddings',
      'Highest Accuracy RAG',
      '24/7 Dedicated Support'
    ],
    recommended: false,
  }
];

export default function SubscriptionModal({ isOpen, onClose }) {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const { company, updateCompany } = useAuthStore();
  const currentPlan = company?.subscription_plan || 'free';

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = async (planId) => {
    if (planId === currentPlan) return;
    
    setLoadingPlan(planId);
    try {
      // Handle downgrade to free
      if (planId === 'free') {
        const res = await api.post('/payments/downgrade-free');
        if (res.data.status === 'success') {
          updateCompany({ ...company, subscription_plan: 'free' });
          alert('Successfully updated plan!');
          onClose();
        }
        return;
      }
      
      // 1. Create order for paid plans
      const { data: order } = await api.post('/payments/create-order', { plan_type: planId });
      
      // 2. Open Razorpay Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ShyrQxWOxYneqB', 
        amount: order.amount,
        currency: order.currency,
        name: 'RAONE SaaS Platform',
        description: `Upgrade to ${planId.replace('_', ' ').toUpperCase()}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_type: planId
            });
            
            if (verifyRes.data.status === 'success') {
              // Update local state
              updateCompany({ ...company, subscription_plan: planId, subscription_expires_at: verifyRes.data.expires_at });
              alert('Successfully upgraded plan!');
              onClose();
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        theme: {
          color: '#6366f1' // primary-500
        }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        alert(response.error.description);
      });
      rzp1.open();
      
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initiate payment. Please try again later.');
    } finally {
      setLoadingPlan(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-dark-900 border border-white/10 rounded-2xl p-6 md:p-8 overflow-hidden shadow-2xl"
        >
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-primary-500/20 blur-[100px] rounded-full pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-10 relative z-10">
            <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-primary-400" />
              Upgrade to Premium
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Unlock the full potential of RAONE with advanced Hybrid Search, higher accuracy, and unlimited scaling for your AI agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 border transition-all duration-300 ${
                  plan.recommended
                    ? 'border-primary-500 bg-primary-500/5 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]'
                    : 'border-white/10 bg-dark-800/50 hover:border-white/20'
                }`}
              >
                {plan.recommended && currentPlan !== plan.id && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-xs font-bold text-white shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                {currentPlan === plan.id && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 rounded-full text-xs font-bold text-white shadow-lg border border-green-400">
                    CURRENT PLAN
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-400">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-gray-400 min-h-[40px]">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={currentPlan === plan.id || loadingPlan !== null}
                  className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${
                    currentPlan === plan.id
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50 cursor-not-allowed'
                      : plan.recommended
                      ? 'bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white shadow-lg disabled:opacity-50'
                      : 'bg-white/10 hover:bg-white/20 text-white disabled:opacity-50'
                  }`}
                >
                  {currentPlan === plan.id 
                    ? 'Current Plan' 
                    : loadingPlan === plan.id ? 'Processing...' : (plan.id === 'free' ? 'Downgrade' : 'Select Plan')}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
