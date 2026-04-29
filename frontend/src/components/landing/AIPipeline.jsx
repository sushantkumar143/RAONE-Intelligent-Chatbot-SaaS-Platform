import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import {
  MessageSquare, Brain, Bot, Sparkles, Database, Globe, Wrench, ChevronRight
} from 'lucide-react';

const chainSteps = [
  { id: 'query', icon: MessageSquare, label: 'User Query', info: '"Analyze data"', type: 'input', color: 'from-blue-500 to-cyan-500' },
  { id: 'agent', icon: Bot, label: 'Agent Plan', info: 'Reasoning...', type: 'agent', color: 'from-violet-500 to-purple-600' },
  { id: 'tool1', icon: Database, label: 'Vector Tool', info: 'Query Docs', type: 'tool', color: 'from-emerald-500 to-teal-500' },
  { id: 'tool2', icon: Globe, label: 'Web Tool', info: 'Fetch API', type: 'tool', color: 'from-amber-500 to-orange-500' },
  { id: 'synth', icon: Brain, label: 'Synthesize', info: 'Combine data', type: 'agent', color: 'from-rose-500 to-pink-600' },
  { id: 'response', icon: Sparkles, label: 'Response', info: 'Final answer', type: 'output', color: 'from-primary-500 to-accent-500' },
];

function ChainNode({ step, index, activeIndex }) {
  const isActive = index <= activeIndex;
  const isCurrent = index === activeIndex;
  const isTool = step.type === 'tool';

  return (
    <div className="relative flex flex-col items-center">
      {/* Node */}
      <motion.div
        layout
        className={`relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${
          isActive ? `bg-gradient-to-br ${step.color} shadow-lg shadow-${step.color.split('-')[1]}-500/30` : 'bg-white/[0.03] border border-white/[0.08]'
        }`}
        animate={{
          scale: isCurrent ? 1.15 : isActive ? 1 : 0.9,
          y: isTool && isActive ? -10 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <step.icon className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-500 ${isActive ? 'text-white' : 'text-gray-500'}`} />
        
        {/* Tool Badge */}
        {isTool && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0 }}
            className="absolute -top-3 -right-3 bg-dark-950 p-1.5 rounded-lg border border-white/[0.1]"
          >
            <Wrench className={`w-3 h-3 text-${step.color.split('-')[1]}-400`} />
          </motion.div>
        )}

        {/* Pulse effect when current */}
        {isCurrent && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-white"
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Info Tag */}
      <motion.div
        className="mt-4 text-center"
        animate={{ opacity: isActive ? 1 : 0.3, y: isActive ? 0 : 5 }}
      >
        <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-white' : 'text-gray-500'}`}>
          {step.label}
        </div>
        <div className={`text-[11px] px-2 py-0.5 rounded-full border ${
          isActive ? 'bg-white/10 border-white/20 text-gray-300' : 'bg-transparent border-white/[0.05] text-gray-600'
        }`}>
          {step.info}
        </div>
      </motion.div>
    </div>
  );
}

function ChainConnector({ index, activeIndex }) {
  const isFilled = index < activeIndex;

  return (
    <div className="flex-1 flex items-center justify-center min-w-[20px] sm:min-w-[40px] px-2">
      <div className="relative w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-accent-500"
          initial={{ width: '0%' }}
          animate={{ width: isFilled ? '100%' : '0%' }}
          transition={{ duration: 0.4, ease: "linear" }}
        />
      </div>
      <motion.div 
        animate={{ color: isFilled ? '#06b6d4' : 'rgba(255,255,255,0.1)' }}
        className="absolute"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </motion.div>
    </div>
  );
}

function VerticalConnector({ index, activeIndex }) {
  const isFilled = index < activeIndex;

  return (
    <div className="flex justify-center h-8 my-2">
      <div className="relative w-1 h-full bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary-500 to-accent-500"
          initial={{ height: '0%' }}
          animate={{ height: isFilled ? '100%' : '0%' }}
          transition={{ duration: 0.4, ease: "linear" }}
        />
      </div>
    </div>
  );
}

export default function AIPipeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (isInView) {
      let current = 0;
      const interval = setInterval(() => {
        if (current <= chainSteps.length) {
          setActiveIndex(current);
          current++;
        } else {
          clearInterval(interval);
          // Loop animation after a delay
          setTimeout(() => {
            setActiveIndex(-1);
            setTimeout(() => setActiveIndex(0), 500);
          }, 4000);
        }
      }, 800); // 800ms per step
      return () => clearInterval(interval);
    }
  }, [isInView, activeIndex === chainSteps.length]);

  return (
    <section id="pipeline" className="py-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-500/[0.04] rounded-full blur-[150px]" />
      </div>

      <div className="max-w-6xl mx-auto relative" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 text-sm font-semibold uppercase tracking-widest">
            Agentic Chain
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            How Your Query <span className="gradient-text">Comes to Life</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Watch the AI agent autonomously chain tools together to synthesize the perfect response.
          </p>
        </motion.div>

        {/* Pipeline Container */}
        <div className="glass-card p-6 sm:p-10 border border-white/[0.08]">
          
          {/* Desktop/Tablet Horizontal Chain */}
          <div className="hidden md:flex items-start justify-between w-full">
            {chainSteps.map((step, i) => (
              <div key={step.id} className="flex items-start flex-1 last:flex-none">
                <ChainNode step={step} index={i} activeIndex={activeIndex} />
                {i < chainSteps.length - 1 && (
                  <div className="flex-1 mt-8">
                    <ChainConnector index={i} activeIndex={activeIndex} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Vertical Chain */}
          <div className="md:hidden flex flex-col items-center">
            {chainSteps.map((step, i) => (
              <div key={step.id} className="w-full flex flex-col items-center">
                <ChainNode step={step} index={i} activeIndex={activeIndex} />
                {i < chainSteps.length - 1 && (
                  <VerticalConnector index={i} activeIndex={activeIndex} />
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Status indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="mt-12 flex justify-center"
        >
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm border border-white/[0.05]">
            <div className={`w-2 h-2 rounded-full ${activeIndex >= chainSteps.length ? 'bg-green-500' : 'bg-primary-500 animate-pulse'}`} />
            <span className="text-gray-300">
              {activeIndex < 0 ? 'Waiting...' : 
               activeIndex >= chainSteps.length ? 'Task Complete (0.8s)' : 
               `Executing: ${chainSteps[activeIndex]?.label}`}
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
