import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Zap, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setIsLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      toast.success('OTP sent to your email');
      setTimeLeft(90); // 90 seconds
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('OTP must be 6 digits');
    if (timeLeft <= 0) return toast.error('OTP has expired. Please request a new one.');
    setIsLoading(true);
    try {
      await authAPI.verifyOTP({ email, otp_code: otp });
      toast.success('OTP verified');
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    setIsLoading(true);
    try {
      await authAPI.resetPassword({ email, otp_code: otp, new_password: password });
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/15 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">RAONE</span>
        </Link>

        <div className="glass-card p-8 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h1 className="text-2xl font-bold text-white mb-2 text-center">Forgot Password</h1>
                <p className="text-gray-400 text-center mb-8">Enter your email to receive an OTP</p>
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="input-field pl-12"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Send OTP <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex justify-center mb-4">
                  <ShieldCheck className="w-12 h-12 text-primary-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 text-center">Verify OTP</h1>
                <p className="text-gray-400 text-center mb-8">Enter the 6-digit code sent to {email}</p>
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="text-center text-sm">
                    {timeLeft > 0 ? (
                      <span className="text-gray-400">Code expires in <span className="text-primary-400 font-bold">{timeLeft}s</span></span>
                    ) : (
                      <span className="text-red-400">Code expired. <button type="button" onClick={handleSendOTP} className="underline hover:text-red-300">Resend OTP</button></span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || timeLeft <= 0}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Verify Code <CheckCircle2 className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h1 className="text-2xl font-bold text-white mb-2 text-center">Reset Password</h1>
                <p className="text-gray-400 text-center mb-8">Enter your new secure password</p>
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="input-field pl-12"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="input-field pl-12"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          
          {step === 1 && (
            <p className="text-gray-400 text-sm text-center mt-6">
              Remembered your password?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
