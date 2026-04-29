import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Upload, Brain, Bot, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Upload Your Data',
    desc: 'Upload PDFs, documents, scrape websites, or add FAQs. Your data stays encrypted and isolated in a secure pipeline — ready for AI processing.',
    gradient: 'from-[#388bfd] to-[#6366f1]',
  },
  {
    icon: Brain,
    number: '02',
    title: 'AI Processes via RAG',
    desc: 'Our Retrieval-Augmented Generation pipeline automatically chunks, embeds, and indexes your data into vector space for lightning-fast retrieval.',
    gradient: 'from-[#6366f1] to-[#8b5cf6]',
  },
  {
    icon: Bot,
    number: '03',
    title: 'Agent Executes Tasks',
    desc: 'Agentic AI reasons through your data, selects the right tools, and takes intelligent, multi-step actions to solve complex queries autonomously.',
    gradient: 'from-[#8b5cf6] to-[#a855f7]',
  },
  {
    icon: Sparkles,
    number: '04',
    title: 'Smart Response Delivered',
    desc: 'Accurate, context-aware answers are delivered in real-time through any channel — chat widget, API, or embedded integration.',
    gradient: 'from-[#a855f7] to-[#c084fc]',
  },
];

/* ── Individual Sticky Card ────────────────────────── */
function StepCard({ step, index, total }) {
  const Icon = step.icon;
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-80px' });

  return (
    <div
      ref={cardRef}
      className="sticky px-4 sm:px-6"
      style={{
        /* Cards stick below the header. Each card offsets slightly
           so the large numbers visually peek out from behind. */
        top: `${200 + index * 12}px`,
        zIndex: 10 + index,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl mx-auto rounded-2xl border border-dark-700/50 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(13,17,23,0.98) 0%, rgba(22,27,34,0.95) 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(240,246,252,0.04)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-stretch">

          {/* Left: Large number */}
          <div className="flex-shrink-0 flex items-center justify-center sm:justify-start px-8 sm:px-10 py-6 sm:py-10">
            <span
              className={`text-7xl sm:text-8xl lg:text-9xl font-black leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-b ${step.gradient}`}
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {step.number}
            </span>
          </div>

          {/* Right: Content */}
          <div className="flex-1 px-8 sm:px-6 pb-8 sm:py-10 border-t sm:border-t-0 sm:border-l border-dark-700/30">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {step.title}
              </h3>
            </div>
            <p className="text-dark-400 text-sm sm:text-base leading-relaxed max-w-xl">
              {step.desc}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── HowItWorks Section ────────────────────────────── */
export default function HowItWorks() {
  const headerRef = useRef(null);
  const isInView = useInView(headerRef, { once: true, margin: '-60px' });

  return (
    <section id="how-it-works" className="relative pb-16">
      {/* Subtle bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-900/20 to-transparent pointer-events-none" />

      {/* ── Sticky Section Header ─────────────────────── */}
      <div
        ref={headerRef}
        className="sticky top-[72px] z-30 backdrop-blur-xl border-b border-dark-700/30"
        style={{ background: 'rgba(13,17,23,0.92)' }}
      >
        <div className="max-w-5xl mx-auto px-6 py-8 sm:py-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-primary-400 text-xs font-semibold uppercase tracking-widest"
          >
            How It Works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-3"
          >
            Four Steps to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#388bfd] to-[#8b5cf6]">
              Intelligence
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-dark-400 text-sm sm:text-base max-w-lg mx-auto"
          >
            From raw data to intelligent conversations — our pipeline handles everything.
          </motion.p>
        </div>
      </div>

      {/* ── Stacking Cards ───────────────────────────── */}
      <div className="relative pt-8 space-y-6 pb-[30vh]">
        {steps.map((step, i) => (
          <StepCard key={step.number} step={step} index={i} total={steps.length} />
        ))}
      </div>
    </section>
  );
}
