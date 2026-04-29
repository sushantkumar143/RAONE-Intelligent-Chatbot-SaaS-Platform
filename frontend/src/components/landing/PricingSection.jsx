import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for testing and small projects',
    features: [
      '1 Chatbot',
      '100 messages/mo',
      '5 MB knowledge base',
      'Community support',
      'Dashboard access',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    desc: 'For growing businesses with real traffic',
    features: [
      '5 Chatbots',
      '10,000 messages/mo',
      '500 MB knowledge base',
      'API access',
      'Widget embed',
      'Priority support',
      'Analytics dashboard',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large-scale deployments',
    features: [
      'Unlimited Chatbots',
      'Unlimited messages',
      'Unlimited storage',
      'Custom LLM models',
      'SSO & RBAC',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const CheckIcon = () => (
  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="pricing" className="py-28 px-6 bg-[#0B0F19] relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-[#00B8FF] text-xs font-bold uppercase tracking-[0.2em]">
            PRICING
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Simple, <span className="bg-gradient-to-r from-[#00A3FF] to-[#7B61FF] text-transparent bg-clip-text">Transparent</span> Pricing
          </h2>
          <p className="text-gray-400 text-lg">
            Start free, scale as you grow
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: i * 0.15,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`relative rounded-2xl flex flex-col h-full bg-[#161C2D] border ${
                plan.popular
                  ? 'border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)]'
                  : 'border-white/[0.06]'
              }`}
            >
              <div className="p-8 flex flex-col h-full">
                {plan.popular && (
                  <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 px-4 py-[5px] rounded-full bg-gradient-to-r from-[#2094FF] to-[#00E5FF] text-white text-[11px] font-bold shadow-lg whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <div className="mt-4 mb-2 flex items-baseline">
                  <span className="text-[40px] font-bold text-white leading-none tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-400 text-sm ml-1 font-medium">{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-400 text-xs mb-8">{plan.desc}</p>

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-3 text-[13px] text-gray-300 font-medium"
                    >
                      <CheckIcon />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className={`w-full text-center py-3.5 rounded-xl text-sm font-bold transition-all duration-300 block ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#2094FF] to-[#00D1FF] text-white hover:shadow-[0_0_20px_rgba(0,209,255,0.4)] hover:scale-[1.02]'
                      : 'bg-[#252D3C] text-gray-200 border border-[#333D50] hover:bg-[#2D3648]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
