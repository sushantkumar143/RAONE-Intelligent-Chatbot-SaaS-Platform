import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Building2, Save, CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ProfilePage() {
  const { user, company, updateProfile, isLoading, updateCompany } = useAuthStore();
  const [isCancelling, setIsCancelling] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    const success = await updateProfile({ full_name: formData.full_name });
    if (success) {
      toast.success('Profile updated successfully');
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your premium subscription? You will lose access to Hybrid Search immediately.')) {
      return;
    }
    
    setIsCancelling(true);
    try {
      const res = await api.post('/payments/downgrade-free');
      if (res.data.status === 'success') {
        updateCompany({ ...company, subscription_plan: 'free', subscription_expires_at: null });
        toast.success('Subscription cancelled successfully');
      }
    } catch (error) {
      toast.error('Failed to cancel subscription');
      console.error(error);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white"
        >
          My Profile
        </motion.h1>
        <p className="text-gray-400 mt-1">Manage your personal information</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user?.full_name}</h2>
              <p className="text-gray-400">{user?.email}</p>
              <div className="inline-block mt-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
                Member since {new Date(user?.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>

              {/* Email (Read Only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="input-field pl-12 opacity-50 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              {/* Company (Read Only) */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-gray-300">Workspace</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={company?.name || ''}
                    className="input-field pl-12 opacity-50 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>

        {/* Subscription Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Subscription Details</h2>
              <p className="text-sm text-gray-400">Manage your current plan</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dark-900 border border-white/5 rounded-xl p-5">
                <div className="text-sm text-gray-400 mb-1">Current Plan</div>
                <div className="text-lg font-bold text-white capitalize">
                  {company?.subscription_plan === 'pro' ? 'RAONE Pro' : 
                   company?.subscription_plan === 'ultra_pro' ? 'RAONE Ultra Pro' : 'Free Tier'}
                </div>
              </div>
              
              <div className="bg-dark-900 border border-white/5 rounded-xl p-5">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  Expiry Date
                </div>
                <div className="text-lg font-bold text-white">
                  {company?.subscription_expires_at 
                    ? new Date(company.subscription_expires_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Lifetime (Free)'}
                </div>
              </div>
            </div>

            {company?.subscription_plan !== 'free' && (
              <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3 text-amber-400/80 max-w-md">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Canceling your subscription will immediately revert your workspace to the Free Tier.</p>
                </div>
                <button
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {isCancelling ? 'Canceling...' : 'Cancel Subscription'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
