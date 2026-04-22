import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, Eye, EyeOff, Zap } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    company_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { signup, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    const success = await signup(formData);
    if (success) {
      toast.success('Account created! Welcome to RAONE');
      navigate('/dashboard');
    } else {
      toast.error(error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-primary-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 -left-32 w-96 h-96 bg-accent-500/15 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">RAONE</span>
        </Link>

        {/* Card */}
        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Create Your Account</h1>
          <p className="text-gray-400 text-center mb-8">Start building your AI chatbot today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="signup-name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="signup-company"
                  name="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Your Company"
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  className="input-field pl-12 pr-12"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-gray-400 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
