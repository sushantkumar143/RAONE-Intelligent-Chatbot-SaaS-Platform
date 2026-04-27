import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Building2, Users, Key, Database, MessageSquare,
  ShieldAlert, ShieldCheck, Loader2, UserCheck, UserX
} from 'lucide-react';
import { adminDashboardAPI } from '../adminApi';
import toast from 'react-hot-toast';

export default function AdminCompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminDashboardAPI.getCompanyDetail(id),
      adminDashboardAPI.getCompanyAnalytics(id),
    ])
      .then(([detailRes, analyticsRes]) => {
        setCompany(detailRes.data);
        setAnalytics(analyticsRes.data);
      })
      .catch(() => toast.error('Failed to load company details'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleBlacklist = async () => {
    try {
      const res = await adminDashboardAPI.toggleBlacklist(id);
      toast.success(res.data.message);
      setCompany(prev => ({ ...prev, is_blacklisted: res.data.is_blacklisted }));
    } catch (err) {
      toast.error('Failed to toggle blacklist');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
      </div>
    );
  }

  if (!company) return <p className="text-gray-500 text-center py-12">Company not found</p>;

  const statItems = [
    { label: 'Conversations', value: company.total_conversations, icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Messages', value: company.total_messages, icon: MessageSquare, color: 'text-cyan-400' },
    { label: 'Members', value: company.members?.length || 0, icon: Users, color: 'text-purple-400' },
    { label: 'API Keys', value: company.api_keys?.length || 0, icon: Key, color: 'text-amber-400' },
    { label: 'Knowledge', value: company.knowledge_sources?.length || 0, icon: Database, color: 'text-green-400' },
    { label: 'Tokens Used', value: analytics?.total_tokens || 0, icon: MessageSquare, color: 'text-pink-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/companies')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Companies
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              company.is_blacklisted ? 'bg-red-500/20' : 'bg-gradient-to-br from-cyan-500 to-teal-600'
            }`}>
              <Building2 className={`w-7 h-7 ${company.is_blacklisted ? 'text-red-400' : 'text-white'}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{company.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">{company.slug}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  company.subscription_plan === 'ultra_pro' ? 'bg-amber-500/15 text-amber-400' :
                  company.subscription_plan === 'pro' ? 'bg-blue-500/15 text-blue-400' :
                  'bg-gray-500/15 text-gray-400'
                }`}>
                  {company.subscription_plan === 'ultra_pro' ? 'Ultra Pro' :
                   company.subscription_plan === 'pro' ? 'Pro' : 'Free'}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  company.is_blacklisted ? 'bg-red-500/15 text-red-400' : 'bg-green-500/15 text-green-400'
                }`}>
                  {company.is_blacklisted ? 'Blacklisted' : 'Active'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={toggleBlacklist}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              company.is_blacklisted
                ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
            }`}
          >
            {company.is_blacklisted ? <><ShieldCheck className="w-4 h-4" /> Unblock Company</> : <><ShieldAlert className="w-4 h-4" /> Blacklist Company</>}
          </button>
        </div>

        {/* Owner */}
        {company.owner && (
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
              {company.owner.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-white">{company.owner.full_name}</p>
              <p className="text-xs text-gray-500">{company.owner.email} · Owner</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statItems.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 text-center"
          >
            <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
            <p className="text-xl font-bold text-white">{s.value.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Members */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" /> Members ({company.members?.length || 0})
        </h2>
        <div className="space-y-2">
          {company.members?.map(m => (
            <div key={m.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                  {m.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white">{m.full_name}</p>
                  <p className="text-xs text-gray-500">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400 capitalize">{m.role}</span>
                <span className={`w-2 h-2 rounded-full ${m.is_active ? 'bg-green-400' : 'bg-red-400'}`}></span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* API Keys */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-400" /> API Keys ({company.api_keys?.length || 0})
        </h2>
        {company.api_keys?.length > 0 ? (
          <div className="space-y-2">
            {company.api_keys.map(k => (
              <div key={k.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/[0.02]">
                <div>
                  <p className="text-sm text-white font-medium">{k.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{k.key_prefix}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  k.is_active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                }`}>
                  {k.is_active ? 'Active' : 'Revoked'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No API keys</p>
        )}
      </motion.div>

      {/* Knowledge Sources */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-green-400" /> Knowledge Sources ({company.knowledge_sources?.length || 0})
        </h2>
        {company.knowledge_sources?.length > 0 ? (
          <div className="space-y-2">
            {company.knowledge_sources.map(ks => (
              <div key={ks.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/[0.02]">
                <div>
                  <p className="text-sm text-white font-medium">{ks.name}</p>
                  <p className="text-xs text-gray-500">{ks.source_type} · {ks.status}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {ks.created_at ? new Date(ks.created_at).toLocaleDateString() : '—'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No knowledge sources</p>
        )}
      </motion.div>
    </div>
  );
}
