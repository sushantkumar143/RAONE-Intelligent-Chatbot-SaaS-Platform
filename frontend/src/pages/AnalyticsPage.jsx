import { motion } from 'framer-motion';
import { BarChart3, MessageSquare, Clock, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const mockData = {
    chatVolume: [12, 19, 15, 25, 22, 30, 28, 35, 42, 38, 45, 50],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    popularQueries: [
      { query: 'How do I reset my password?', count: 142 },
      { query: 'What are your pricing plans?', count: 98 },
      { query: 'How to integrate the API?', count: 76 },
      { query: 'Refund policy', count: 54 },
      { query: 'Technical support hours', count: 41 },
    ],
    avgResponseTime: 1.2,
    totalChats: 1847,
    satisfactionRate: 94,
  };

  const maxVolume = Math.max(...mockData.chatVolume);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Monitor your chatbot's performance</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Total Chats', value: mockData.totalChats.toLocaleString(), icon: MessageSquare, color: 'from-primary-500 to-blue-600' },
          { label: 'Avg Response Time', value: `${mockData.avgResponseTime}s`, icon: Clock, color: 'from-accent-500 to-teal-600' },
          { label: 'Satisfaction Rate', value: `${mockData.satisfactionRate}%`, icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chat Volume Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 lg:col-span-3"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Chat Volume</h3>
          <div className="flex items-end gap-2 h-48">
            {mockData.chatVolume.map((vol, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-primary-500 to-accent-500 rounded-t-lg transition-all duration-500 hover:opacity-80"
                  style={{ height: `${(vol / maxVolume) * 100}%`, minHeight: '4px' }}
                />
                <span className="text-xs text-gray-500">{mockData.months[i].slice(0, 1)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Popular Queries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Top Queries</h3>
          <div className="space-y-3">
            {mockData.popularQueries.map((q, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className="text-sm text-gray-300 truncate flex-1 mr-4">{q.query}</p>
                <span className="text-xs text-primary-400 font-mono bg-primary-500/10 px-2 py-1 rounded">
                  {q.count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
