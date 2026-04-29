import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, Eye, EyeOff, Zap } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';
import PasswordStrengthMeter, { isPasswordStrong } from '../components/auth/PasswordStrengthMeter';

export default function SignupPage() {
  const [accountType, setAccountType] = useState('personal');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    company_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { signup, googleLogin, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    clearError();
    const success = await googleLogin(credentialResponse.credential);
    if (success) {
      toast.success('Account created! Welcome to RAONE');
      navigate('/dashboard');
    } else {
      toast.error(error || 'Google Sign-Up failed');
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!isPasswordStrong(formData.password)) {
      toast.error('Please meet all password requirements');
      return;
    }
    const payload = {
      ...formData,
      account_type: accountType,
      company_name: accountType === 'personal' ? `${formData.full_name}'s Space` : formData.company_name
    };
    const success = await signup(payload);
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
            {/* Account Type Toggle */}
            <div className="flex bg-dark-800 p-1 rounded-xl mb-6 border border-white/5">
              <button
                type="button"
                onClick={() => setAccountType('personal')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                  accountType === 'personal'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Personal
              </button>
              <button
                type="button"
                onClick={() => setAccountType('business')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                  accountType === 'business'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Business
              </button>
            </div>

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
            {accountType === 'business' && (
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
                    required={accountType === 'business'}
                  />
                </div>
              </div>
            )}

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
                  placeholder="Create a strong password"
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
              <PasswordStrengthMeter password={formData.password} />
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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-900 text-gray-400">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  toast.error('Google Sign-In Failed');
                }}
                theme="filled_black"
                shape="rectangular"
                text="signup_with"
                size="large"
              />
            </div>
          </div>

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
