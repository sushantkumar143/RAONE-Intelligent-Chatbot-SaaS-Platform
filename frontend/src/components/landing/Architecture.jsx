import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Key, Server, BrainCircuit, Activity, Box, ArrowRight, ShieldCheck, Network, Globe } from 'lucide-react';

const archFeatures = [
  {
    icon: Key,
    title: 'Custom API Integration',
    desc: 'Generate your own API keys and seamlessly embed the chatbot widget or integrate via REST API directly into your site.',
    color: 'from-blue-500 to-cyan-500',
    glow: 'rgba(6,182,212,0.3)',
  },
  {
    icon: BrainCircuit,
    title: 'Multi-LLM Redundancy',
    desc: 'Smart request routing across Groq, OpenAI, and Hugging Face, with local Ollama models always active as a fail-safe backup.',
    color: 'from-purple-500 to-violet-500',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    icon: Box,
    title: 'Containerized Scalability',
    desc: 'Deployed on a distributed, multi-container architecture ensuring elastic horizontal scaling and complete fault tolerance.',
    color: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.3)',
  },
  {
    icon: Activity,
    title: '24/7 High Availability',
    desc: 'Self-healing infrastructure and active-active load balancing guarantee your AI agents run around the clock without failure.',
    color: 'from-rose-500 to-orange-500',
    glow: 'rgba(244,63,94,0.3)',
  },
];

const llmNodes = [
  { name: 'Groq', status: 'Primary', color: 'bg-emerald-500' },
  { name: 'OpenAI', status: 'Active', color: 'bg-blue-500' },
  { name: 'Hugging Face', status: 'Active', color: 'bg-amber-500' },
  { name: 'Ollama', status: 'Backup (24/7)', color: 'bg-rose-500' },
];

export default function Architecture() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-28 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-900/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">
            Infrastructure
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mt-3 mb-6">
            Built for <span className="gradient-text">Scale & Speed</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Enterprise-grade architecture designed for maximum uptime, flexibility, and performance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Visual Diagram */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="glass-card p-8 border border-white/[0.08] relative overflow-hidden group">
              {/* Animated background grid */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2 relative z-10">
                <Server className="w-5 h-5 text-primary-400" />
                Multi-LLM Routing Engine
              </h3>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* API Gateway Box */}
                <div className="w-full md:w-1/3 glass p-4 rounded-xl border border-primary-500/30 bg-primary-500/5 text-center relative z-10 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                  <div className="w-10 h-10 mx-auto bg-primary-500/20 rounded-lg flex items-center justify-center mb-3">
                    <Key className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="text-sm font-bold text-white">API Gateway</div>
                  <div className="text-[10px] text-gray-400 mt-1">Load Balanced</div>
                </div>

                {/* Animated Connectors */}
                <div className="hidden md:flex flex-col gap-4 relative w-16">
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-full h-[120px] border-l-2 border-t-2 border-b-2 border-white/10 rounded-l-xl" />
                   </div>
                   <motion.div 
                     animate={{ opacity: [0.2, 1, 0.2] }} 
                     transition={{ duration: 2, repeat: Infinity }}
                     className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-0.5 bg-primary-400 shadow-[0_0_10px_#3b82f6]"
                   />
                </div>

                {/* LLM Nodes */}
                <div className="w-full md:w-1/2 flex flex-col gap-3 relative z-10">
                  {llmNodes.map((llm, idx) => (
                    <motion.div
                      key={llm.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 + (idx * 0.1) }}
                      className="glass px-4 py-3 rounded-lg border border-white/5 flex items-center justify-between hover:border-white/20 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-200">{llm.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{llm.status}</span>
                        <div className={`w-2 h-2 rounded-full ${llm.color} ${llm.name === 'Ollama' ? 'animate-pulse shadow-[0_0_8px_#f43f5e]' : ''}`} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Status Bar */}
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Fault Tolerance Active
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Box className="w-4 h-4 text-blue-400" />
                  Multi-Container
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {archFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + (i * 0.15) }}
                className="relative group"
              >
                {/* Hover Glow */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500"
                  style={{ background: `linear-gradient(to bottom right, ${feature.glow}, transparent)` }}
                />
                
                <div className="h-full glass p-6 rounded-2xl border border-white/[0.05] hover:border-white/[0.15] transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* Top-down Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-24 pt-16 border-t border-white/[0.05] relative flex flex-col items-center"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
          
          <h3 className="text-xl font-bold text-white mb-12 flex items-center gap-2">
            <Network className="w-5 h-5 text-emerald-400" />
            System Topology Flow
          </h3>

          {/* Client Layer */}
          <div className="glass px-6 py-3 rounded-xl border border-white/10 text-sm font-semibold text-white z-10 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            Client Application / API
          </div>

          {/* Line down */}
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-primary-500/50" />

          {/* Load Balancer */}
          <div className="glass-card px-8 py-3 rounded-xl border border-primary-500/30 text-primary-400 text-sm font-bold z-10 shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Load Balancer
          </div>

          {/* Line down */}
          <div className="w-px h-8 bg-primary-500/50" />

          {/* Branching horizontal line */}
          <div className="w-[280px] sm:w-[400px] h-px bg-primary-500/50" />
          
          {/* 3 lines down */}
          <div className="flex justify-between w-[280px] sm:w-[400px]">
            <div className="w-px h-8 bg-primary-500/50" />
            <div className="w-px h-8 bg-primary-500/50" />
            <div className="w-px h-8 bg-primary-500/50" />
          </div>

          {/* Containers */}
          <div className="flex justify-between w-[320px] sm:w-[460px] z-10">
            {[1, 2, 3].map(num => (
              <div key={num} className="glass px-4 py-3 rounded-xl border border-white/10 flex flex-col items-center gap-1 bg-dark-900">
                <Box className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-gray-300">Node {num}</span>
              </div>
            ))}
          </div>

          {/* Lines down to LLM Router */}
          <div className="flex justify-between w-[280px] sm:w-[400px]">
            <div className="w-px h-8 bg-emerald-500/30" />
            <div className="w-px h-8 bg-emerald-500/30" />
            <div className="w-px h-8 bg-emerald-500/30" />
          </div>
          <div className="w-[280px] sm:w-[400px] h-px bg-emerald-500/30" />
          <div className="w-px h-8 bg-emerald-500/30" />

          {/* LLM Router */}
          <div className="glass-card px-6 py-3 rounded-xl border border-purple-500/30 text-purple-400 text-sm font-bold z-10 shadow-[0_0_15px_rgba(168,85,247,0.15)] flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            Multi-LLM Router
          </div>

          <div className="w-px h-8 bg-purple-500/30" />
          <div className="w-px h-4" /> {/* spacing */}
          
          {/* Bottom Models */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 max-w-3xl z-10">
            {[
              { n: 'Groq', c: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/5' },
              { n: 'OpenAI', c: 'border-blue-500/30 text-blue-300 bg-blue-500/5' },
              { n: 'Hugging Face', c: 'border-amber-500/30 text-amber-300 bg-amber-500/5' },
              { n: 'Ollama (Backup)', c: 'border-rose-500/40 text-rose-300 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.1)] animate-pulse' },
            ].map(model => (
              <div key={model.n} className={`glass px-5 py-2.5 rounded-lg border ${model.c} text-xs font-semibold`}>
                {model.n}
              </div>
            ))}
          </div>

        </motion.div>
      </div>
    </section>
  );
}
