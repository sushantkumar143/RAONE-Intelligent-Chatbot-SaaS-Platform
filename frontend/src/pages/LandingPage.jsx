import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap, Brain, Key, Database, Shield, Globe, ArrowRight,
  Upload, Bot, Rocket, Check, MessageSquare, Code2,
  ExternalLink, Globe2, Link2, Mail, ChevronRight, Sparkles,
  Star, Users, BarChart3,
} from 'lucide-react';

/* ─── Reusable Fade-In Section ─── */
function Section({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ════════════════════════════════════════════════════════
   NAVBAR
   ════════════════════════════════════════════════════════ */
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/60 backdrop-blur-2xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">RAONE</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-gray-400 hover:text-white transition">Features</a>
          <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition">How It Works</a>
          <a href="#demo" className="text-sm text-gray-400 hover:text-white transition">Demo</a>
          <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
          <Link to="/signup" className="btn-primary text-sm !px-5 !py-2.5 flex items-center gap-1.5">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ════════════════════════════════════════════════════════
   HERO
   ════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Animated mesh background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/15 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-primary-400/30 rounded-full animate-float"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${4 + i}s`,
          }}
        />
      ))}

      <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          Powered by RAG + Agentic AI
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
        >
          <span className="text-white">Build Your Own</span>
          <br />
          <span className="gradient-text">AI Chatbot</span>
          <span className="text-white"> in Minutes</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Train AI on your data, deploy anywhere, and delight customers with intelligent
          conversations. Multi-tenant SaaS platform for businesses of all sizes.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/signup" className="btn-primary text-lg !px-8 !py-4 flex items-center gap-2 shadow-glow-md hover:shadow-glow-lg transition-all">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#demo" className="btn-secondary text-lg !px-8 !py-4 flex items-center gap-2">
            <Bot className="w-5 h-5" /> See Demo
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-16 flex items-center justify-center gap-8 text-gray-500 text-sm"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" /> <span>1,200+ Businesses</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> <span>5M+ Conversations</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
            <span className="ml-1">4.9/5</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
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

/* ════════════════════════════════════════════════════════
   FEATURES
   ════════════════════════════════════════════════════════ */
const features = [
  {
    icon: Brain,
    title: 'RAG-Based AI',
    desc: 'Retrieval-Augmented Generation ensures accurate, context-aware responses grounded in your data.',
    color: 'from-primary-500 to-blue-600',
  },
  {
    icon: Key,
    title: 'API Integration',
    desc: 'Generate API keys and integrate your chatbot into any application with a single endpoint.',
    color: 'from-accent-500 to-teal-600',
  },
  {
    icon: Database,
    title: 'Knowledge Base',
    desc: 'Upload PDFs, scrape websites, or add text. Your bot learns from your data automatically.',
    color: 'from-purple-500 to-violet-600',
  },
  {
    icon: Shield,
    title: 'Multi-Tenant Security',
    desc: 'Complete data isolation per company with separate namespaces and encrypted API keys.',
    color: 'from-amber-500 to-orange-600',
  },
];

function Features() {
  return (
    <Section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary-400 text-sm font-semibold uppercase tracking-widest">Features</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Everything You Need to <span className="gradient-text">Ship Fast</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A complete platform to build, train, and deploy intelligent chatbots — no ML expertise required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-card p-7 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ════════════════════════════════════════════════════════
   HOW IT WORKS
   ════════════════════════════════════════════════════════ */
const steps = [
  { icon: Upload, title: 'Upload Data', desc: 'Upload PDFs, documents, or scrape websites. Add FAQs and policies manually.' },
  { icon: Bot, title: 'Train Bot', desc: 'Our RAG pipeline chunks, embeds, and indexes your data automatically.' },
  { icon: Rocket, title: 'Deploy Anywhere', desc: 'Use the dashboard chat, embed a widget, or integrate via API.' },
];

function HowItWorks() {
  return (
    <Section id="how-it-works" className="py-24 px-6 bg-dark-900/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent-400 text-sm font-semibold uppercase tracking-widest">How It Works</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Three Steps to <span className="gradient-text">Intelligence</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary-500/50 via-accent-500/50 to-purple-500/50" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="text-center relative"
            >
              <div className="relative mx-auto mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 flex items-center justify-center mx-auto">
                  <step.icon className="w-7 h-7 text-primary-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold shadow-glow-sm">
                  {i + 1}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ════════════════════════════════════════════════════════
   DEMO
   ════════════════════════════════════════════════════════ */
const demoMessages = [
  { role: 'user', text: 'How do I integrate the chatbot into my website?' },
  { role: 'bot', text: 'Great question! You can integrate RAONE in 3 ways:\n\n1. **Embed Widget** — Add a single `<script>` tag to your site\n2. **API** — Use our REST API with your API key\n3. **Dashboard** — Chat directly in your RAONE dashboard\n\nWould you like me to show you the embed code?' },
  { role: 'user', text: 'Yes, show me the embed code!' },
  { role: 'bot', text: '```html\n<script src="https://cdn.raone.ai/widget.js"\n  data-api-key="rk_your_key"\n  data-theme="dark">\n</script>\n```\n\nJust paste this before `</body>` and you\'re live! 🚀' },
];

function Demo() {
  return (
    <Section id="demo" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-primary-400 text-sm font-semibold uppercase tracking-widest">Live Demo</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            See It in <span className="gradient-text">Action</span>
          </h2>
          <p className="text-gray-400 text-lg">A preview of what your AI chatbot can do</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="glass-card overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">RAONE Assistant</p>
                <p className="text-green-400 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Online
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="p-6 space-y-4 max-h-[400px] overflow-auto">
              {demoMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.3, duration: 0.4 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-500/20 text-white border border-primary-500/20'
                      : 'bg-white/5 text-gray-200 border border-white/5'
                  }`}>
                    <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02]">
              <div className="flex gap-3">
                <input
                  placeholder="Try asking something..."
                  className="input-field flex-1 !py-2.5 text-sm"
                  readOnly
                />
                <button className="btn-primary !px-4 !py-2.5">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ════════════════════════════════════════════════════════
   PRICING
   ════════════════════════════════════════════════════════ */
const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for testing and small projects',
    features: ['1 Chatbot', '100 messages/mo', '5 MB knowledge base', 'Community support', 'Dashboard access'],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    desc: 'For growing businesses with real traffic',
    features: ['5 Chatbots', '10,000 messages/mo', '500 MB knowledge base', 'API access', 'Widget embed', 'Priority support', 'Analytics dashboard'],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large-scale deployments',
    features: ['Unlimited Chatbots', 'Unlimited messages', 'Unlimited storage', 'Custom LLM models', 'SSO & RBAC', 'Dedicated support', 'SLA guarantee', 'On-premise option'],
    cta: 'Contact Sales',
    popular: false,
  },
];

function Pricing() {
  return (
    <Section id="pricing" className="py-24 px-6 bg-dark-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent-400 text-sm font-semibold uppercase tracking-widest">Pricing</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h2>
          <p className="text-gray-400 text-lg">Start free, scale as you grow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`relative glass-card p-8 flex flex-col ${
                plan.popular ? 'border-primary-500/40 shadow-glow-sm' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-bold">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <div className="mt-4 mb-2">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-gray-400 text-sm">{plan.period}</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">{plan.desc}</p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-primary-400 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`w-full text-center py-3 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ════════════════════════════════════════════════════════
   FOOTER
   ════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark-950/80 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">RAONE</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Build, train, and deploy intelligent AI chatbots powered by RAG and agentic AI.
            </p>
            <div className="flex gap-3 mt-5">
              {[ExternalLink, Globe2, Link2, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'API Docs', 'Integrations', 'Changelog'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Contact'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'] },
          ].map((group) => (
            <div key={group.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-500 text-sm hover:text-gray-300 transition">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">&copy; 2026 RAONE. All rights reserved.</p>
          <p className="text-gray-600 text-sm flex items-center gap-1">
            Built with <span className="text-red-400">❤</span> and AI
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ════════════════════════════════════════════════════════
   LANDING PAGE (ASSEMBLED)
   ════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Demo />
      <Pricing />
      <Footer />
    </div>
  );
}
