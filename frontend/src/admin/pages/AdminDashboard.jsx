import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, MessageSquare, Key, Database, BarChart3, ShieldAlert, TrendingUp } from 'lucide-react';
import { adminDashboardAPI } from '../adminApi';

function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (value === undefined || value === null) return;
    let startTime;
    let frame;
    const duration = 2000;
    const update = (ts) => {
      if (!startTime) startTime = ts;
      const p = ts - startTime;
      const ease = p >= duration ? 1 : 1 - Math.pow(2, -10 * p / duration);
      if (p < duration) { setCount(Math.floor(value * ease)); frame = requestAnimationFrame(update); }
      else setCount(value);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <span>{count.toLocaleString()}</span>;
}

const statCards = [
  { key: 'total_users', label: 'Total Users', icon: Users, color: 'from-blue-500 to-blue-700' },
  { key: 'total_companies', label: 'Total Companies', icon: Building2, color: 'from-cyan-500 to-teal-600' },
  { key: 'total_conversations', label: 'Conversations', icon: MessageSquare, color: 'from-purple-500 to-violet-600' },
  { key: 'total_messages', label: 'Total Messages', icon: BarChart3, color: 'from-amber-500 to-orange-600' },
  { key: 'total_api_keys', label: 'Active API Keys', icon: Key, color: 'from-green-500 to-emerald-600' },
  { key: 'total_knowledge_sources', label: 'Knowledge Sources', icon: Database, color: 'from-pink-500 to-rose-600' },
  { key: 'blacklisted_companies', label: 'Blacklisted', icon: ShieldAlert, color: 'from-red-500 to-red-700' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDashboardAPI.getStats()
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white"
        >
          Platform Overview
        </motion.h1>
        <p className="text-gray-400 mt-1">Real-time metrics across the entire RAONE platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {loading ? '—' : <AnimatedCounter value={stats?.[card.key] ?? 0} />}
            </p>
            <p className="text-sm text-gray-400 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Plan Distribution */}
      {stats?.plan_distribution && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Subscription Distribution</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { plan: 'free', label: 'Free Tier', color: 'text-gray-400 border-gray-500/20 bg-gray-500/5', count: stats.plan_distribution.free },
              { plan: 'pro', label: 'Pro', color: 'text-blue-400 border-blue-500/20 bg-blue-500/5', count: stats.plan_distribution.pro },
              { plan: 'ultra_pro', label: 'Ultra Pro', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5', count: stats.plan_distribution.ultra_pro },
            ].map(p => (
              <div key={p.plan} className={`rounded-xl border p-5 text-center ${p.color}`}>
                <p className="text-3xl font-bold"><AnimatedCounter value={p.count} /></p>
                <p className="text-sm mt-1 font-medium">{p.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
