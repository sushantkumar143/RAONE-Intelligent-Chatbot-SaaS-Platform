import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Lock, Eye, ServerCrash, Fingerprint } from 'lucide-react';

const privacyFeatures = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    desc: 'All data encrypted at rest and in transit using AES-256 and TLS 1.3.',
    color: 'from-blue-500 to-primary-500',
  },
  {
    icon: ServerCrash,
    title: 'Secure Vector Storage',
    desc: 'Isolated vector namespaces per tenant. No cross-contamination ever.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Eye,
    title: 'No Data Leakage',
    desc: 'Your data never leaves your namespace. Zero shared model training.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Fingerprint,
    title: 'Privacy-First AI',
    desc: 'GDPR compliant. SOC2 ready. Your data, your control, always.',
    color: 'from-amber-500 to-orange-500',
  },
];

/* ── Animated Shield ───────────────────────────────── */
function AnimatedShield({ isInView }) {
  return (
    <div className="relative flex items-center justify-center mb-14">
      {/* Outer pulse rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border border-primary-500/20"
          style={{
            width: 120 + ring * 50,
            height: 120 + ring * 50,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={
            isInView
              ? {
                  opacity: [0.4, 0],
                  scale: [0.8, 1.2],
                }
              : {}
          }
          transition={{
            duration: 3,
            delay: ring * 0.5,
            repeat: Infinity,
          }}
        />
      ))}

      {/* Shield icon container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 flex items-center justify-center"
      >
        <Shield className="w-10 h-10 text-primary-400" />

        {/* Floating lock particles */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-400/40 rounded-full"
            animate={
              isInView
                ? {
                    x: [0, Math.cos((i * Math.PI) / 3) * 50],
                    y: [0, Math.sin((i * Math.PI) / 3) * 50],
                    opacity: [0.8, 0],
                  }
                : {}
            }
            transition={{
              duration: 2,
              delay: 1 + i * 0.3,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

/* ── Encrypted Data Flow ───────────────────────────── */
function DataFlow({ isInView }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 1, delay: 0.5 }}
      className="flex items-center justify-center gap-2 mb-10"
    >
      {/* Data packets flowing */}
      <div className="relative w-full max-w-md h-8 overflow-hidden">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1"
            animate={
              isInView
                ? { left: ['-10%', '110%'] }
                : {}
            }
            transition={{
              duration: 3,
              delay: i * 0.6,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <div className="w-6 h-3 rounded-sm bg-primary-500/30 border border-primary-500/20 flex items-center justify-center">
              <Lock className="w-2 h-2 text-primary-400" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function DataPrivacy() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="security" className="py-28 px-6 relative overflow-hidden">
      {/* BG glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/[0.03] rounded-full blur-[200px]" />
      </div>

      <div className="max-w-6xl mx-auto relative" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">
            Security & Privacy
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Your Data is{' '}
            <span className="gradient-text">Fort Knox Secure</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Enterprise-grade security baked into every layer.
          </p>
        </motion.div>

        {/* Shield animation */}
        <AnimatedShield isInView={isInView} />

        {/* Data flow animation */}
        <DataFlow isInView={isInView} />

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {privacyFeatures.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.8 + i * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary-500/30 hover:bg-white/[0.06] transition-all duration-500"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: '0 0 40px rgba(59,130,246,0.08)' }}
                />

                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <h3 className="text-base font-semibold text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
