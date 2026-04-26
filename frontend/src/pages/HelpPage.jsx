import { motion } from 'framer-motion';
import { Book, PlayCircle, MessageCircle, ExternalLink, Mail } from 'lucide-react';

export default function HelpPage() {
  const resources = [
    {
      title: 'Documentation',
      description: 'Comprehensive guides on RAG, API integrations, and prompt engineering.',
      icon: Book,
      link: '#',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video lessons on building custom AI agents.',
      icon: PlayCircle,
      link: '#',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other developers, share tips, and get help.',
      icon: MessageCircle,
      link: '#',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white"
        >
          Help & Support
        </motion.h1>
        <p className="text-gray-400 mt-1">Get the most out of your RAONE workspace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {resources.map((resource, i) => (
          <motion.a
            href={resource.link}
            key={resource.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 block hover:-translate-y-1 transition-transform group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 ${resource.bg}`}>
              <resource.icon className={`w-6 h-6 ${resource.color}`} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              {resource.title}
              <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
            </h3>
            <p className="text-sm text-gray-400">{resource.description}</p>
          </motion.a>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border border-white/10 mb-4 z-10">
          <Mail className="w-8 h-8 text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 z-10">Need Direct Support?</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-6 z-10">
          Our engineering team is ready to help you with complex queries, custom model deployments, or billing issues.
        </p>
        <a 
          href="mailto:support@raone.com" 
          className="btn-primary z-10"
        >
          Contact Support Team
        </a>
      </motion.div>
    </div>
  );
}
