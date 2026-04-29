import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Bot, ArrowRight } from 'lucide-react';

const demoMessages = [
  { role: 'user', text: 'How do I integrate the chatbot into my website?' },
  {
    role: 'bot',
    text: 'Great question! You can integrate RAONE in 3 ways:\n\n1. **Embed Widget** — Add a single <script> tag to your site\n2. **API** — Use our REST API with your API key\n3. **Dashboard** — Chat directly in your RAONE dashboard\n\nWould you like me to show you the embed code?',
  },
  { role: 'user', text: 'Yes, show me the embed code!' },
  {
    role: 'bot',
    text: '<script src="https://cdn.raone.ai/widget.js"\n  data-api-key="rk_your_key"\n  data-theme="dark">\n</script>\n\nJust paste this before </body> and you\'re live! 🚀',
  },
];

export default function DemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="demo" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-900/20 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="text-primary-400 text-sm font-semibold uppercase tracking-widest">
            Live Demo
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            See It in <span className="gradient-text">Action</span>
          </h2>
          <p className="text-gray-400 text-lg">
            A preview of what your AI chatbot can do
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex items-center gap-2 ml-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">RAONE Assistant</p>
                  <p className="text-green-400 text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    Online
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="p-6 space-y-4 max-h-[420px] overflow-auto">
              {demoMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15, x: msg.role === 'user' ? 15 : -15 }}
                  animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.3, duration: 0.5 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-500/15 text-white border border-primary-500/20'
                        : 'bg-white/[0.04] text-gray-200 border border-white/[0.06]'
                    }`}
                  >
                    <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-3">
                <input
                  placeholder="Try asking something..."
                  className="input-field flex-1 !py-2.5 text-sm"
                  readOnly
                />
                <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-glow-sm transition-all">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
