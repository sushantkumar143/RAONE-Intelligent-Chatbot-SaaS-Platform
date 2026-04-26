import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Database, Key, BarChart3, TrendingUp, Zap } from 'lucide-react';
import { companyAPI } from '../services/api';
import useAuthStore from '../stores/authStore';

const statCards = [
  { label: 'Total Conversations', key: 'total_conversations', icon: MessageSquare, color: 'from-primary-500 to-blue-600' },
  { label: 'Total Messages', key: 'total_messages', icon: BarChart3, color: 'from-accent-500 to-teal-600' },
  { label: 'Knowledge Sources', key: 'total_knowledge_sources', icon: Database, color: 'from-purple-500 to-violet-600' },
  { label: 'Active API Keys', key: 'active_api_keys', icon: Key, color: 'from-amber-500 to-orange-600', extraKey: 'deactivated_api_keys', extraLabel: 'Deactivated' },
];

function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === undefined || value === null) return;
    let startTime;
    let animationFrame;
    const duration = 2000; // 2 seconds

    const updateCounter = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      // easeOutExpo (starts fast, ends slow)
      const easeProgress = progress >= duration ? 1 : 1 - Math.pow(2, -10 * progress / duration);
      
      if (progress < duration) {
        setCount(Math.floor(value * easeProgress));
        animationFrame = requestAnimationFrame(updateCounter);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return <span>{count}</span>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { company } = useAuthStore();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await companyAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white"
        >
          Welcome back 👋
        </motion.h1>
        <p className="text-gray-400 mt-1">
          Here's what's happening with <span className="text-primary-400 font-medium">{company?.name}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {loading ? '—' : <AnimatedCounter value={stats?.[card.key] ?? 0} />}
                </p>
                <p className="text-sm text-gray-400 mt-1">{card.label}</p>
              </div>
              {card.extraKey && !loading && stats && (
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-400">
                    <AnimatedCounter value={stats[card.extraKey] ?? 0} />
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-red-400/80 mt-1 font-bold">{card.extraLabel}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="/dashboard/chat" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/8 border border-white/5 hover:border-primary-500/30 transition-all">
            <MessageSquare className="w-5 h-5 text-primary-400" />
            <div>
              <p className="text-sm font-medium text-white">Start Chatting</p>
              <p className="text-xs text-gray-500">Test your AI chatbot</p>
            </div>
          </a>
          <a href="/dashboard/knowledge" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/8 border border-white/5 hover:border-accent-500/30 transition-all">
            <Database className="w-5 h-5 text-accent-400" />
            <div>
              <p className="text-sm font-medium text-white">Upload Data</p>
              <p className="text-xs text-gray-500">Train your chatbot</p>
            </div>
          </a>
          <a href="/dashboard/api-keys" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/8 border border-white/5 hover:border-purple-500/30 transition-all">
            <Key className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-sm font-medium text-white">Get API Key</p>
              <p className="text-xs text-gray-500">Integrate anywhere</p>
            </div>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
