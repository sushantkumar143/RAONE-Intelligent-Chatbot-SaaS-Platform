import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Brain, Key, Database, Shield, Code2, Globe, Cpu, BarChart3 } from 'lucide-react';
import GlassCard from './GlassCard';

const features = [
  {
    icon: Brain,
    title: 'RAG-Based AI',
    desc: 'Retrieval-Augmented Generation ensures accurate, context-aware responses grounded in your data.',
    color: 'from-primary-500 to-blue-600',
    glow: 'rgba(59,130,246,0.3)',
  },
  {
    icon: Key,
    title: 'API Integration',
    desc: 'Generate API keys and integrate your chatbot into any application with a single endpoint.',
    color: 'from-accent-500 to-teal-600',
    glow: 'rgba(6,182,212,0.3)',
  },
  {
    icon: Database,
    title: 'Knowledge Base',
    desc: 'Upload PDFs, scrape websites, or add text. Your bot learns from your data automatically.',
    color: 'from-purple-500 to-violet-600',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    icon: Shield,
    title: 'Multi-Tenant Security',
    desc: 'Complete data isolation per company with separate namespaces and encrypted API keys.',
    color: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.3)',
  },
  {
    icon: Cpu,
    title: 'Agentic AI',
    desc: 'Intelligent agents that can reason, plan, and execute multi-step tasks autonomously.',
    color: 'from-rose-500 to-pink-600',
    glow: 'rgba(244,63,94,0.3)',
  },
  {
    icon: Globe,
    title: 'Deploy Anywhere',
    desc: 'Embed widget, REST API, or dashboard. Your chatbot runs wherever your users are.',
    color: 'from-emerald-500 to-green-600',
    glow: 'rgba(16,185,129,0.3)',
  },
];

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/[0.03] rounded-full blur-[200px]" />
      </div>

      <div className="max-w-7xl mx-auto relative" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 text-sm font-semibold uppercase tracking-widest">
            Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Ship Fast</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A complete platform to build, train, and deploy intelligent chatbots
            — no ML expertise required.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: i * 0.1,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <GlassCard className="h-full" glowColor={f.glow}>
                <div className="p-7">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
