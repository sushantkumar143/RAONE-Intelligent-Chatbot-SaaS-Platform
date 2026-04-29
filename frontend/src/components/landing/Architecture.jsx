import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const archNodes = [
  { id: 'frontend', label: 'Frontend', tech: 'React', x: 0, y: 50, color: '#3b82f6' },
  { id: 'api', label: 'API', tech: 'FastAPI', x: 16.6, y: 50, color: '#06b6d4' },
  { id: 'rag', label: 'RAG Engine', tech: 'LangChain', x: 33.3, y: 30, color: '#8b5cf6' },
  { id: 'vectordb', label: 'Vector DB', tech: 'Pinecone', x: 50, y: 70, color: '#10b981' },
  { id: 'llm', label: 'LLM', tech: 'GPT-4', x: 66.6, y: 30, color: '#f59e0b' },
  { id: 'agent', label: 'Agent', tech: 'Agentic AI', x: 83.3, y: 50, color: '#f43f5e' },
];

const archEdges = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 2, to: 4 },
  { from: 4, to: 5 },
];

function ArchNode({ node, index, isInView }) {
  const delay = 0.3 + index * 0.2;

  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Glow */}
      <motion.div
        className="absolute w-14 h-14 rounded-xl"
        animate={
          isInView
            ? {
                boxShadow: [
                  `0 0 20px ${node.color}33`,
                  `0 0 40px ${node.color}55`,
                  `0 0 20px ${node.color}33`,
                ],
              }
            : {}
        }
        transition={{ duration: 3, delay: delay + 0.5, repeat: Infinity }}
      />

      {/* Node */}
      <motion.div
        className="relative w-14 h-14 rounded-xl flex items-center justify-center border text-white text-xs font-bold cursor-default"
        style={{
          background: `linear-gradient(135deg, ${node.color}33, ${node.color}11)`,
          borderColor: `${node.color}44`,
        }}
        whileHover={{ scale: 1.15, borderColor: node.color }}
      >
        {node.label.slice(0, 3)}
      </motion.div>

      {/* Labels */}
      <motion.p
        className="mt-2 text-xs font-semibold text-white whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: delay + 0.3 }}
      >
        {node.label}
      </motion.p>
      <motion.p
        className="text-[10px] text-gray-500 whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: delay + 0.4 }}
      >
        {node.tech}
      </motion.p>
    </motion.div>
  );
}

export default function Architecture() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-900/20 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">
            Architecture
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Built for{' '}
            <span className="gradient-text">Scale & Speed</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A robust, modular architecture designed for enterprise-grade AI applications.
          </p>
        </motion.div>

        {/* Architecture diagram */}
        <div className="relative w-full h-[300px] sm:h-[350px]">
          {/* SVG Edges */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            {archEdges.map((edge, i) => {
              const from = archNodes[edge.from];
              const to = archNodes[edge.to];
              const delay = 0.5 + i * 0.15;

              return (
                <motion.line
                  key={i}
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke="rgba(59,130,246,0.2)"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {archNodes.map((node, i) => (
            <ArchNode key={node.id} node={node} index={i} isInView={isInView} />
          ))}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 2 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          {archNodes.map((node) => (
            <div
              key={node.id}
              className="flex items-center gap-2 text-xs text-gray-500"
            >
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: node.color }}
              />
              <span>{node.tech}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
