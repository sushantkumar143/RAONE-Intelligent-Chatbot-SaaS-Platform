import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, ShieldAlert, ShieldCheck, Loader2, Eye, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminDashboardAPI } from '../adminApi';
import toast from 'react-hot-toast';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);
  const [planChanging, setPlanChanging] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { loadCompanies(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(companies); return; }
    const q = search.toLowerCase();
    setFiltered(companies.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.owner?.email.toLowerCase().includes(q) ||
      c.owner?.full_name.toLowerCase().includes(q)
    ));
  }, [search, companies]);

  const loadCompanies = async () => {
    try {
      const res = await adminDashboardAPI.getCompanies();
      setCompanies(res.data);
      setFiltered(res.data);
    } catch (err) {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlacklist = async (companyId) => {
    setToggling(companyId);
    try {
      const res = await adminDashboardAPI.toggleBlacklist(companyId);
      toast.success(res.data.message);
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, is_blacklisted: res.data.is_blacklisted } : c));
    } catch (err) {
      toast.error('Failed to toggle blacklist');
    } finally {
      setToggling(null);
    }
  };

  const changePlan = async (companyId, plan) => {
    setPlanChanging(companyId);
    try {
      const res = await adminDashboardAPI.changePlan(companyId, plan);
      toast.success(res.data.message);
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, subscription_plan: plan } : c));
    } catch (err) {
      toast.error('Failed to change plan');
    } finally {
      setPlanChanging(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white"
          >
            Company Management
          </motion.h1>
          <p className="text-gray-400 mt-1">{companies.length} companies registered</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name or owner..."
            className="input-field w-full pl-12"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Members</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">No companies found</td>
                </tr>
              ) : (
                filtered.map((company, i) => (
                  <motion.tr
                    key={company.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b border-white/5 hover:bg-white/[0.02] transition ${company.is_blacklisted ? 'opacity-60' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${company.is_blacklisted ? 'bg-red-500/20' : 'bg-gradient-to-br from-cyan-500 to-teal-600'}`}>
                          <Building2 className={`w-4 h-4 ${company.is_blacklisted ? 'text-red-400' : 'text-white'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{company.name}</p>
                          <p className="text-xs text-gray-500">{company.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-300">{company.owner?.full_name || '—'}</p>
                      <p className="text-xs text-gray-500">{company.owner?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={company.subscription_plan}
                        onChange={(e) => changePlan(company.id, e.target.value)}
                        disabled={planChanging === company.id}
                        className="bg-dark-800 border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 focus:border-red-500/50 focus:outline-none cursor-pointer"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="ultra_pro">Ultra Pro</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{company.member_count}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        company.is_blacklisted ? 'bg-red-500/15 text-red-400' : 'bg-green-500/15 text-green-400'
                      }`}>
                        {company.is_blacklisted ? 'Blacklisted' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/companies/${company.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => toggleBlacklist(company.id)}
                          disabled={toggling === company.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            company.is_blacklisted
                              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                              : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                          }`}
                        >
                          {toggling === company.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : company.is_blacklisted ? (
                            <><ShieldCheck className="w-3.5 h-3.5" /> Unblock</>
                          ) : (
                            <><ShieldAlert className="w-3.5 h-3.5" /> Blacklist</>
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
