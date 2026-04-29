import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap, ExternalLink, Globe2, Mail, ArrowRight,
} from 'lucide-react';


const linkGroups = [
  {
    title: 'Product',
    links: ['Features', 'Pricing', 'API Docs', 'Integrations', 'Changelog'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
  },
];

const socialIcons = [ExternalLink, Globe2, Mail];

export default function FooterSection() {
  return (
    <footer className="relative border-t border-white/[0.05] overflow-hidden">
      {/* CTA Band */}
      <div className="relative py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/[0.06] via-accent-500/[0.04] to-purple-500/[0.06]" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Ready to Build Your{' '}
            <span className="gradient-text">AI Chatbot</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-gray-400 text-lg mb-8"
          >
            Start free. No credit card required. Deploy in minutes.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 hover:shadow-glow-md hover:scale-[1.03] transition-all duration-300"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer content */}
      <div className="bg-dark-950/80 py-16 px-6">
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
                Build, train, and deploy intelligent AI chatbots powered by RAG
                and agentic AI.
              </p>
              <div className="flex gap-3 mt-5">
                {socialIcons.map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.08] hover:border-primary-500/30 transition-all duration-300"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link groups */}
            {linkGroups.map((group) => (
              <div key={group.title}>
                <h4 className="text-white font-semibold text-sm mb-4">
                  {group.title}
                </h4>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">
              &copy; 2026 RAONE. All rights reserved.
            </p>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              Built with <span className="text-red-400">❤</span> and AI
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
