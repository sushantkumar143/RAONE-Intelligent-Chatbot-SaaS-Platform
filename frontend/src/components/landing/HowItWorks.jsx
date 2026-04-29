import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Upload, Brain, Bot, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Upload Your Data',
    desc: 'Upload PDFs, documents, scrape websites, or add FAQs. Your data stays encrypted and isolated.',
    color: 'from-blue-500 to-primary-500',
    glow: 'rgba(59,130,246,0.3)',
  },
  {
    icon: Brain,
    number: '02',
    title: 'AI Processes via RAG',
    desc: 'Our pipeline chunks, embeds, and indexes your data into vector space automatically.',
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    icon: Bot,
    number: '03',
    title: 'Agent Executes Tasks',
    desc: 'Agentic AI reasons through your data, uses tools, and takes intelligent actions.',
    color: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,0.3)',
  },
  {
    icon: Sparkles,
    number: '04',
    title: 'Smart Response Delivered',
    desc: 'Accurate, context-aware answers delivered in real-time through any channel.',
    color: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.3)',
  },
];

function StepCard({ step, index, isInView }) {
  const delay = index * 0.2;
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      {/* Connection line (not on last) */}
      {index < steps.length - 1 && (
        <motion.div
          className="hidden lg:block absolute top-10 left-[calc(100%+0px)] w-full h-px z-0"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: delay + 0.3 }}
          style={{ transformOrigin: 'left' }}
        >
          <div className="h-full bg-gradient-to-r from-white/10 to-transparent" />
        </motion.div>
      )}

      <div className="relative p-7 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 group">
        {/* Step number */}
        <motion.div
          className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-dark-950 border border-white/[0.1] flex items-center justify-center text-xs font-bold text-gray-500"
          animate={
            isInView
              ? {
                  borderColor: [
                    'rgba(255,255,255,0.1)',
                    step.glow,
                    'rgba(255,255,255,0.1)',
                  ],
                }
              : {}
          }
          transition={{ duration: 3, delay: delay + 0.5, repeat: Infinity }}
        >
          {step.number}
        </motion.div>

        {/* Icon with rotating border */}
        <div className="relative w-16 h-16 mb-5">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
          {/* Rotating glow border */}
          <motion.div
            className="absolute inset-[-3px] rounded-2xl"
            style={{
              background: `conic-gradient(from 0deg, transparent, ${step.glow}, transparent, transparent)`,
              opacity: 0.5,
            }}
            animate={isInView ? { rotate: 360 } : {}}
            transition={{
              duration: 4,
              delay: delay + 0.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="how-it-works" className="py-28 px-6 relative overflow-hidden">
      {/* Subtle bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-900/30 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-accent-400 text-sm font-semibold uppercase tracking-widest">
            How It Works
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Four Steps to{' '}
            <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From raw data to intelligent conversations — our pipeline handles everything.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <StepCard
              key={step.title}
              step={step}
              index={i}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
