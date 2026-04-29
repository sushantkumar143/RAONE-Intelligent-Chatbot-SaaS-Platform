import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MessageSquare, Globe, Search, Database, Brain, Bot, Sparkles,
} from 'lucide-react';

const pipelineNodes = [
  {
    icon: MessageSquare,
    title: 'User Query',
    label: 'Input',
    color: 'from-blue-500 to-blue-600',
    glow: 'rgba(59,130,246,0.4)',
    desc: 'Natural language question',
  },
  {
    icon: Globe,
    title: 'API Gateway',
    label: 'Routing',
    color: 'from-cyan-500 to-teal-500',
    glow: 'rgba(6,182,212,0.4)',
    desc: 'Auth & rate limiting',
  },
  {
    icon: Search,
    title: 'RAG Engine',
    label: 'Embedding',
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.4)',
    desc: 'Semantic search & retrieval',
  },
  {
    icon: Database,
    title: 'Vector DB',
    label: 'Retrieval',
    color: 'from-emerald-500 to-green-600',
    glow: 'rgba(16,185,129,0.4)',
    desc: 'Similarity matching',
  },
  {
    icon: Brain,
    title: 'LLM',
    label: 'Reasoning',
    color: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,0.4)',
    desc: 'Context-aware generation',
  },
  {
    icon: Bot,
    title: 'Agent',
    label: 'Execution',
    color: 'from-rose-500 to-pink-600',
    glow: 'rgba(244,63,94,0.4)',
    desc: 'Tool calling & actions',
  },
  {
    icon: Sparkles,
    title: 'Response',
    label: 'Response Generation',
    color: 'from-primary-500 to-accent-500',
    glow: 'rgba(59,130,246,0.4)',
    desc: 'Intelligent answer delivered',
  },
];

/* ── Single Pipeline Node ──────────────────────────── */
function PipelineNode({ node, index, isInView }) {
  const delay = index * 0.25;
  const Icon = node.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 30, scale: 0.8 }
      }
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center relative group"
    >
      {/* Glow ring */}
      <motion.div
        className="absolute w-20 h-20 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={
          isInView
            ? {
                opacity: [0, 0.6, 0.3],
                scale: [0.8, 1.2, 1],
              }
            : {}
        }
        transition={{ duration: 1.2, delay: delay + 0.3 }}
        style={{
          boxShadow: `0 0 40px ${node.glow}, 0 0 80px ${node.glow}`,
          top: '0',
        }}
      />

      {/* Node card */}
      <motion.div
        className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${node.color} flex items-center justify-center shadow-lg cursor-default`}
        whileHover={{ scale: 1.12, rotate: 3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <Icon className="w-8 h-8 text-white" />

        {/* Pulse ring animation */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2"
          style={{ borderColor: node.glow }}
          initial={{ opacity: 0, scale: 1 }}
          animate={
            isInView
              ? {
                  opacity: [0.8, 0],
                  scale: [1, 1.5],
                }
              : {}
          }
          transition={{
            duration: 2,
            delay: delay + 0.5,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      </motion.div>

      {/* Label chip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: delay + 0.3 }}
        className="mt-3 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px] font-semibold uppercase tracking-wider text-gray-400"
      >
        {node.label}
      </motion.div>

      {/* Title */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: delay + 0.4 }}
        className="mt-2 text-sm font-semibold text-white"
      >
        {node.title}
      </motion.p>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: delay + 0.5 }}
        className="mt-1 text-[11px] text-gray-500 text-center max-w-[120px]"
      >
        {node.desc}
      </motion.p>
    </motion.div>
  );
}

/* ── Animated Connector ────────────────────────────── */
function Connector({ index, isInView, isVertical }) {
  const delay = index * 0.25 + 0.15;

  if (isVertical) {
    return (
      <div className="flex flex-col items-center py-2">
        <motion.div
          className="w-px h-10 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay }}
        >
          {/* Line */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-primary-500/50 to-accent-500/50"
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.5, delay }}
            style={{ transformOrigin: 'top' }}
          />
          {/* Data packet */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
            initial={{ top: '-10%', opacity: 0 }}
            animate={
              isInView
                ? { top: ['0%', '100%'], opacity: [0, 1, 1, 0] }
                : {}
            }
            transition={{
              duration: 1,
              delay: delay + 0.5,
              repeat: Infinity,
              repeatDelay: 2.5,
            }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-1">
      <motion.div
        className="relative h-px w-10 lg:w-14 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay }}
      >
        {/* Line */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-500/50 to-accent-500/50"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.5, delay }}
          style={{ transformOrigin: 'left' }}
        />
        {/* Arrow head */}
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0"
          style={{
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
            borderLeft: '6px solid rgba(59,130,246,0.6)',
          }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: delay + 0.3 }}
        />
        {/* Data packet */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
          initial={{ left: '-10%', opacity: 0 }}
          animate={
            isInView
              ? { left: ['0%', '100%'], opacity: [0, 1, 1, 0] }
              : {}
          }
          transition={{
            duration: 0.8,
            delay: delay + 0.6,
            repeat: Infinity,
            repeatDelay: 2.5,
          }}
        />
      </motion.div>
    </div>
  );
}

/* ── Main Pipeline Section ─────────────────────────── */
export default function AIPipeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="pipeline" className="py-28 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-500/[0.04] rounded-full blur-[150px]" />
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
            AI Pipeline
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            How Your Query{' '}
            <span className="gradient-text">Comes to Life</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Watch your question travel through our intelligent pipeline — from
            input to insight in milliseconds.
          </p>
        </motion.div>

        {/* Pipeline — Desktop (horizontal) */}
        <div className="hidden lg:flex items-start justify-center">
          {pipelineNodes.map((node, i) => (
            <div key={node.title} className="flex items-start">
              <PipelineNode node={node} index={i} isInView={isInView} />
              {i < pipelineNodes.length - 1 && (
                <div className="mt-10">
                  <Connector index={i} isInView={isInView} isVertical={false} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pipeline — Tablet (2-row) */}
        <div className="hidden md:grid lg:hidden grid-cols-4 gap-8 justify-items-center">
          {pipelineNodes.map((node, i) => (
            <PipelineNode key={node.title} node={node} index={i} isInView={isInView} />
          ))}
        </div>

        {/* Pipeline — Mobile (vertical) */}
        <div className="md:hidden flex flex-col items-center">
          {pipelineNodes.map((node, i) => (
            <div key={node.title} className="flex flex-col items-center">
              <PipelineNode node={node} index={i} isInView={isInView} />
              {i < pipelineNodes.length - 1 && (
                <Connector index={i} isInView={isInView} isVertical={true} />
              )}
            </div>
          ))}
        </div>

        {/* Bottom status bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 2 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-emerald-400"
            />
            Average response time: 0.8s
          </div>
        </motion.div>
      </div>
    </section>
  );
}
