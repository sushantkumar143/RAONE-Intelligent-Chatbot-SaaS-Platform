import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import GlassCard from './GlassCard';

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

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="pricing" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-900/30 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-accent-400 text-sm font-semibold uppercase tracking-widest">
            Pricing
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Simple,{' '}
            <span className="gradient-text">Transparent</span> Pricing
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
            >
              <GlassCard
                className={`h-full ${
                  plan.popular
                    ? 'border-primary-500/30 shadow-[0_0_40px_rgba(59,130,246,0.1)]'
                    : ''
                }`}
                glowColor={
                  plan.popular
                    ? 'rgba(59,130,246,0.15)'
                    : 'rgba(255,255,255,0.05)'
                }
              >
                <div className="p-8 flex flex-col h-full">
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-bold shadow-glow-sm">
                      Most Popular
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-4 mb-2">
                    <span className="text-4xl font-extrabold text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-6">{plan.desc}</p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-2.5 text-sm text-gray-300"
                      >
                        <Check className="w-4 h-4 text-primary-400 flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/signup"
                    className={`w-full text-center py-3.5 rounded-xl font-semibold transition-all duration-300 block ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-glow-md hover:scale-[1.02]'
                        : 'bg-white/[0.06] text-white border border-white/[0.1] hover:bg-white/[0.1] hover:border-primary-500/30'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
