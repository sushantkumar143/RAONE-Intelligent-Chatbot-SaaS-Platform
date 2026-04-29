import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Play, Users, Star, ShieldCheck,
} from 'lucide-react';

/* ── Floating Particles ────────────────────────────── */
function Particles({ count = 30 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        duration: 4 + Math.random() * 8,
        delay: Math.random() * 4,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            background: `hsl(${220 + Math.random() * 40}, 80%, 70%)`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 6, -6, 0],
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

/* ────────────────────────────────────────────────────
   Hero Section
   ─ RAONE is sticky: moves UP + grows on scroll
   ─ Dark shadow falls from below navbar to hide it
   ─ Content section sits below in normal flow
   ────────────────────────────────────────────────── */
export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const [vh, setVh] = useState(800);

  useEffect(() => {
    setVh(window.innerHeight);
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 0 → 1 over the first viewport height
  const p = Math.min(scrollY / Math.max(vh, 1), 1);

  // RAONE: moves UP and grows bigger
  const titleScale = 1 + p * 1.2;            // 1x → 2.2x
  const titleTranslateY = -p * vh * 0.35;     // moves up by 35% of viewport
  const titleOpacity = Math.max(0, 1 - p * 1.4); // fades as shadow covers

  // Shadow veil: height grows from top (below navbar at 72px) downward
  const veilHeight = p * 100;                 // 0% → 100% of the sticky area

  // Scroll indicator
  const scrollOp = Math.max(0, 1 - p / 0.12);

  return (
    <>
      {/* ═══════════════════════════════════════════════
          LAYER 1 — Sticky RAONE title behind everything
          ═══════════════════════════════════════════════ */}
      <div className="sticky top-0 z-0 h-screen overflow-hidden">

        {/* ── Background ─────────────────────────────── */}
        <div className="absolute inset-0 bg-dark-950">
          {/* Flowing light orbs */}
          <motion.div
            className="absolute"
            style={{
              bottom: '-10%', left: '-15%', width: '80%', height: '70%',
              background: 'radial-gradient(ellipse at center, rgba(56,139,253,0.18) 0%, rgba(99,102,241,0.08) 40%, transparent 70%)',
              filter: 'blur(40px)', borderRadius: '50%',
            }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute"
            style={{
              bottom: '-5%', right: '-10%', width: '60%', height: '55%',
              background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, rgba(168,85,247,0.06) 50%, transparent 70%)',
              filter: 'blur(50px)', borderRadius: '50%',
            }}
            animate={{ x: [0, -20, 0], y: [0, -15, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute"
            style={{
              top: '30%', right: '5%', width: '40%', height: '40%',
              background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 60%)',
              filter: 'blur(60px)', borderRadius: '50%',
            }}
            animate={{ x: [0, -10, 0], y: [0, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Fiber-optic light streaks */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="s1" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#388bfd" stopOpacity="0" />
                <stop offset="30%" stopColor="#388bfd" stopOpacity="0.6" />
                <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="s2" x1="0%" y1="80%" x2="100%" y2="20%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                <stop offset="40%" stopColor="#388bfd" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#388bfd" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path d="M0,800 Q200,600 500,500 T1000,300 T1600,200" stroke="url(#s1)" strokeWidth="2" fill="none"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3, delay: 0.5, ease: 'easeOut' }} />
            <motion.path d="M0,700 Q300,500 600,450 T1200,250 T1600,150" stroke="url(#s2)" strokeWidth="1.5" fill="none"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3.5, delay: 0.8, ease: 'easeOut' }} />
            <motion.path d="M0,850 Q250,700 550,550 T1100,350 T1600,280" stroke="url(#s1)" strokeWidth="1" fill="none"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 4, delay: 1, ease: 'easeOut' }} />
          </svg>

          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }} />
          <Particles count={35} />
        </div>

        {/* ── RAONE Title — moves UP + grows on scroll ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ top: '72px' /* below navbar */ }}
        >
          <div
            className="text-center select-none"
            style={{
              transform: `scale(${titleScale}) translateY(${titleTranslateY}px)`,
              opacity: titleOpacity,
              willChange: 'transform, opacity',
            }}
          >
            <h1
              className="text-[clamp(4rem,13vw,10rem)] font-black tracking-tighter leading-none"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#c4b5fd] to-[#7c3aed]/50">
                RAONE
              </span>
            </h1>
            <p className="mt-3 text-[clamp(0.6rem,1.4vw,1rem)] tracking-[0.3em] uppercase text-dark-300 font-medium">
              Retrieval Augmented Orchestration Neural Engine
            </p>
          </div>
        </div>

        {/* ── Dark Shadow Veil — descends from below navbar ── */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: '72px',  /* starts right below the navbar */
            height: `${veilHeight}%`,
            background: 'linear-gradient(to bottom, rgba(13,17,23,1) 0%, rgba(13,17,23,0.97) 50%, rgba(13,17,23,0.85) 80%, rgba(13,17,23,0) 100%)',
            zIndex: 5,
            transition: 'height 0.05s linear',
          }}
        />

        {/* ── Scroll indicator ─────────────────────────── */}
        {scrollOp > 0.01 && (
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
            style={{ opacity: scrollOp }}
          >
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-dark-500 font-medium">Scroll</span>
              <div className="w-5 h-9 rounded-full border border-dark-600 flex items-start justify-center p-1.5">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1 h-1 bg-[#8b5cf6] rounded-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          LAYER 2 — Product content (scrolls over the title)
          ═══════════════════════════════════════════════ */}
      <div className="relative z-10 bg-dark-950">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">

          {/* Tagline */}
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight"
          >
            Build Intelligent AI Systems in Minutes
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-dark-400 mb-10"
          >
            Train on your data. Orchestrate workflows. Deploy anywhere.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link
              to="/signup"
              className="group relative px-8 py-3.5 text-base font-semibold text-white rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] to-[#6366f1]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6] to-[#818cf8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <a
              href="#demo"
              className="group px-8 py-3.5 text-base font-semibold text-dark-200 hover:text-white rounded-full border border-dark-600 hover:border-dark-500 bg-dark-900/30 backdrop-blur-sm hover:bg-dark-800/50 transition-all duration-300 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> View Demo
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-dark-700 bg-dark-900/50 flex items-center justify-center">
                <Users className="w-4 h-4 text-dark-300" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-lg leading-tight">10K+</p>
                <p className="text-dark-500 text-xs">Active Users</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-dark-700 bg-dark-900/50 flex items-center justify-center">
                <Star className="w-4 h-4 text-dark-300" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-lg leading-tight">4.8/5</p>
                <p className="text-dark-500 text-xs">User Rating</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-dark-700 bg-dark-900/50 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-dark-300" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-lg leading-tight">Enterprise</p>
                <p className="text-dark-500 text-xs">Grade Security</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
