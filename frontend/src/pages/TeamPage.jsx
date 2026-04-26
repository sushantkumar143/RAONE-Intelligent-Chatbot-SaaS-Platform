import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Mail, Shield, MoreVertical } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

export default function TeamPage() {
  const { user, company } = useAuthStore();
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    // Simulate sending invite
    toast.success(`Invite sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white"
        >
          Team Management
        </motion.h1>
        <p className="text-gray-400 mt-1">Manage members of the {company?.name} workspace</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-400" />
                Workspace Members
              </h2>
              <span className="px-2.5 py-1 rounded-md bg-white/5 text-xs font-medium text-gray-400 border border-white/10">
                1 / {company?.subscription_plan === 'free' ? '3' : 'Unlimited'} Seats
              </span>
            </div>
            
            <div className="divide-y divide-white/5">
              {/* Current User (Owner) */}
              <div className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      {user?.full_name}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        OWNER
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-primary-400" />
              Invite Member
            </h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="input-field pl-10 text-sm py-2"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400">Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select className="input-field pl-10 text-sm py-2 appearance-none">
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={company?.subscription_plan === 'free'}
                className="w-full py-2 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white rounded-lg text-sm font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
              >
                {company?.subscription_plan === 'free' ? 'Upgrade to Invite' : 'Send Invite'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
