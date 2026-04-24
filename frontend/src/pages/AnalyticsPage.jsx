import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Database,
  Cpu,
  Key,
  RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totals: { requests: 0, tokens: 0, avgLatency: 0, activeKeys: 0 },
    apiUsage: [],
    tokenUsage: [],
    modelPerformance: [],
    endpointDistribution: []
  });

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getStats();
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load real-time analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-dark-600 p-3 rounded-lg shadow-xl">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value?.toLocaleString() || 0}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && data.apiUsage.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const { totals, apiUsage, tokenUsage, modelPerformance, endpointDistribution } = data;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Real-Time Analytics</h1>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Live data connected
          </p>
        </div>
      </div>

      {/* Real-Time KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total API Requests', value: totals.requests.toLocaleString(), icon: Database, color: 'from-blue-500 to-indigo-600' },
          { label: 'Tokens Processed', value: totals.tokens.toLocaleString(), icon: Cpu, color: 'from-violet-500 to-purple-600' },
          { label: 'Avg Latency', value: `${totals.avgLatency}s`, icon: Clock, color: 'from-emerald-500 to-teal-600' },
          { label: 'Active Keys', value: totals.activeKeys.toLocaleString(), icon: Key, color: 'from-amber-500 to-orange-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="w-16 h-16" />
            </div>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <motion.p 
              key={stat.value} // Animate on value change
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-3xl font-bold text-white mb-1"
            >
              {stat.value}
            </motion.p>
            <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* API Usage (Live) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">API Traffic (Last 7 Days)</h3>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20">
              Requests / Day
            </span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={apiUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickMargin={10} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  name="Requests"
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Token Usage (Live) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Token Consumption (Last 7 Days)</h3>
            <span className="px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-semibold rounded-full border border-violet-500/20">
              Input vs Output
            </span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tokenUsage} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickMargin={10} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Input Tokens" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="secondary" 
                  name="Output Tokens" 
                  stroke="#ec4899" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Latency Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Model Performance (Latency in Seconds)</h3>
          <div className="h-[250px] w-full">
            {modelPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelPerformance} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={100} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#374151', opacity: 0.4}} />
                  <Bar dataKey="latency" name="Avg Latency (s)" radius={[0, 4, 4, 0]}>
                    {modelPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No model usage data available yet.
              </div>
            )}
          </div>
        </motion.div>

        {/* API Usage Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Endpoint Distribution</h3>
          <div className="h-[250px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={endpointDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {endpointDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
              <span className="text-2xl font-bold text-white">{endpointDistribution.length}</span>
              <span className="text-xs text-gray-400">Endpoints</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {endpointDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs text-gray-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {item.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
