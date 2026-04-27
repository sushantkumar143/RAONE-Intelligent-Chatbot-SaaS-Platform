import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Zap, Shield, User, KeyRound } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../stores/authStore';
import { adminAuthAPI } from '../admin/adminApi';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [loginMode, setLoginMode] = useState('user'); // 'user' or 'admin'
  
  // User fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Admin fields
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);

  const { login, googleLogin, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    clearError();
    const success = await googleLogin(credentialResponse.credential);
    if (success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(error || 'Google Login failed');
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await login(email, password);
    if (success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(error || 'Login failed');
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);
    try {
      const res = await adminAuthAPI.login({
        username: adminUsername,
        password: adminPassword,
        secret_key: secretKey,
      });
      localStorage.setItem('raone_admin_token', res.data.access_token);
      localStorage.setItem('raone_admin_user', JSON.stringify({ username: res.data.username, role: 'admin' }));
      toast.success('Admin authenticated!');
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid admin credentials';
      setAdminError(msg);
      toast.error(msg);
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[128px] transition-colors duration-500 ${loginMode === 'admin' ? 'bg-red-500/20' : 'bg-primary-500/20'}`} />
        <div className={`absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[128px] transition-colors duration-500 ${loginMode === 'admin' ? 'bg-orange-500/15' : 'bg-accent-500/15'}`} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
            loginMode === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-primary-500 to-accent-500'
          }`}>
            {loginMode === 'admin' ? <Shield className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-white" />}
          </div>
          <span className="text-2xl font-bold gradient-text">RAONE</span>
        </Link>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Mode Selector */}
          <div className="flex items-center bg-dark-800 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setLoginMode('user'); setAdminError(null); clearError(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                loginMode === 'user' ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" /> User
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('admin'); setAdminError(null); clearError(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                loginMode === 'admin' ? 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" /> Admin
            </button>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2 text-center">
            {loginMode === 'admin' ? 'Admin Access' : 'Welcome Back'}
          </h1>
          <p className="text-gray-400 text-center mb-8">
            {loginMode === 'admin' ? 'Enter admin credentials & secret code' : 'Sign in to your RAONE account'}
          </p>

          {loginMode === 'user' ? (
            /* ─── User Login Form ─── */
            <>
              <form onSubmit={handleUserSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="input-field pl-12"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">Password</label>
                    <Link to="/forgot-password" className="text-sm font-medium text-primary-400 hover:text-primary-300 transition">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="input-field pl-12 pr-12"
                      required
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

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  id="login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Sign In'
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
                    text="signin_with"
                    size="large"
                  />
                </div>
              </div>

              <p className="text-gray-400 text-sm text-center mt-6">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium transition">
                  Create one
                </Link>
              </p>
            </>
          ) : (
            /* ─── Admin Login Form ─── */
            <form onSubmit={handleAdminSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Admin username"
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
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Admin password"
                    className="input-field pl-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                  >
                    {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Secret Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Secret Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter admin secret code"
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>

              {adminError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2"
                >
                  {adminError}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={adminLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-red-500 to-red-700 text-white hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.5)] disabled:opacity-50"
              >
                {adminLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Access Admin Panel
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
