import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Bot, Sparkles, Users, MessageSquare, Star,
} from 'lucide-react';

/* ── Floating Particles ────────────────────────────── */
function Particles({ count = 20 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        duration: 5 + Math.random() * 8,
        delay: Math.random() * 5,
        opacity: 0.15 + Math.random() * 0.3,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary-400"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 10, -10, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ── AI Typing Animation ───────────────────────────── */
const typingLines = [
  '> Analyzing your data...',
  '> Embedding with vector model...',
  '> Retrieving relevant context...',
  '> Reasoning with LLM...',
  '> ✓ Response generated in 0.8s',
];

function TypingAnimation() {
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [displayedLines, setDisplayedLines] = useState([]);

  useEffect(() => {
    if (currentLine >= typingLines.length) {
      const timeout = setTimeout(() => {
        setCurrentLine(0);
        setCurrentChar(0);
        setDisplayedLines([]);
      }, 3000);
      return () => clearTimeout(timeout);
    }

    const line = typingLines[currentLine];
    if (currentChar < line.length) {
      const timeout = setTimeout(() => setCurrentChar((c) => c + 1), 30);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setDisplayedLines((prev) => [...prev, line]);
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [currentLine, currentChar]);

  const activeLine =
    currentLine < typingLines.length
      ? typingLines[currentLine].slice(0, currentChar)
      : '';

  return (
    <div className="glass-card max-w-md mx-auto mt-12 p-5 font-mono text-xs sm:text-sm text-left">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/[0.06]">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        <span className="text-gray-500 text-[10px] ml-2">RAONE Pipeline</span>
      </div>
      <div className="space-y-1.5 min-h-[120px]">
        {displayedLines.map((line, i) => (
          <div
            key={i}
            className={`${
              line.includes('✓') ? 'text-green-400' : 'text-gray-400'
            }`}
          >
            {line}
          </div>
        ))}
        {currentLine < typingLines.length && (
          <div className="text-primary-400">
            {activeLine}
            <span className="inline-block w-[2px] h-3.5 bg-primary-400 ml-0.5 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Hero Section ──────────────────────────────────── */
export default function HeroSection() {
  const containerRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left - rect.width / 2) / rect.width,
      y: (e.clientY - rect.top - rect.height / 2) / rect.height,
    });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
    >
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-dark-950" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.18) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(139,92,246,0.1) 0%, transparent 50%)',
              'radial-gradient(ellipse at 60% 30%, rgba(59,130,246,0.18) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(6,182,212,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(139,92,246,0.1) 0%, transparent 50%)',
              'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.18) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(139,92,246,0.1) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />

        {/* Parallax orbs */}
        <motion.div
          className="absolute top-[20%] left-[15%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[140px]"
          style={{
            x: mouse.x * -30,
            y: mouse.y * -30,
          }}
        />
        <motion.div
          className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] bg-accent-500/8 rounded-full blur-[120px]"
          style={{
            x: mouse.x * 20,
            y: mouse.y * 20,
          }}
        />
        <motion.div
          className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-purple-500/6 rounded-full blur-[100px]"
          style={{
            x: mouse.x * 40,
            y: mouse.y * 40,
          }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Particles */}
      <Particles count={25} />

      {/* Content */}
      <motion.div
        className="relative max-w-5xl mx-auto px-6 text-center z-10"
        style={{
          x: mouse.x * -8,
          y: mouse.y * -8,
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
          Powered by RAG + Agentic AI
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.05] mb-7 tracking-tight"
        >
          <span className="text-white">Build Your Own</span>
          <br />
          <span className="gradient-text">AI Chatbot</span>
          <br />
          <span className="text-white">in Minutes</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Train AI on your data, deploy anywhere, and delight customers with
          intelligent conversations. Enterprise-grade SaaS platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/signup"
            className="group relative px-8 py-4 text-lg font-semibold text-white rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl bg-gradient-to-r from-primary-500 to-accent-500" />
            <span className="relative flex items-center gap-2">
              Get Started Free{' '}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <a
            href="#demo"
            className="group px-8 py-4 text-lg font-semibold text-white rounded-2xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-sm hover:bg-white/[0.08] hover:border-primary-500/30 transition-all duration-300 flex items-center gap-2"
          >
            <Bot className="w-5 h-5 text-primary-400" /> See Demo
          </a>
        </motion.div>

        {/* Typing Animation Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
        >
          <TypingAnimation />
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-gray-500 text-sm"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-500/60" />
            <span>1,200+ Businesses</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent-500/60" />
            <span>5M+ Conversations</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
              />
            ))}
            <span className="ml-1">4.9/5</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/15 flex items-start justify-center p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-primary-400 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
