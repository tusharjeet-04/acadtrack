import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, ShieldCheck, Lock, ArrowRight, ArrowLeft, GraduationCap, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPasswordRequest, resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep]             = useState(1); // 1=email, 2=otp+newpass, 3=success
  const [email, setEmail]           = useState('');
  const [otp, setOtp]               = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [infoMsg, setInfoMsg]       = useState('');

  // Step 1: send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await forgotPasswordRequest(email);
      setInfoMsg(data.message || 'OTP sent! Check your inbox.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP + set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (newPassword !== confirmPass) {
      return setError('Passwords do not match.');
    }
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setStep(3);
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = {
    1: 'Forgot Password',
    2: 'Reset Password',
    3: 'Password Reset!',
  };
  const stepSubtitles = {
    1: 'Enter your registered email and we\'ll send a 6-digit OTP.',
    2: 'Enter the OTP from your inbox and choose a new password.',
    3: 'Your password has been updated successfully.',
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary-600/15 border border-primary-500/20 rounded-2xl mb-3 shadow-lg shadow-primary-500/5">
            <GraduationCap className="h-10 w-10 text-primary-500" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-primary-400 bg-clip-text text-transparent">
            AcadTrack
          </h2>
          <p className="text-slate-400 text-sm mt-1">Student Academic Journey Tracker</p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 bg-darkCard/50 backdrop-blur-xl border border-darkBorder/80">
          <h3 className="text-xl font-bold text-slate-100 mb-1">{stepTitles[step]}</h3>
          <p className="text-slate-400 text-xs mb-6">{stepSubtitles[step]}</p>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Info message */}
          {infoMsg && step === 2 && (
            <div className="mb-4 p-3 rounded-lg bg-amber-950/20 border border-amber-900/30 text-amber-300 text-[11px] leading-relaxed">
              {infoMsg}
            </div>
          )}

          {/* ── Step 1: Email Input ── */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Registered Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    autoFocus
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input pl-10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full glass-btn-primary flex items-center justify-center space-x-2 mt-2 disabled:opacity-50"
              >
                {loading ? <span>Sending OTP...</span> : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP + New Password ── */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  6-Digit OTP
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <input
                    id="reset-otp"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full glass-input pl-10 text-center text-lg tracking-widest font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    id="new-password"
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full glass-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full glass-input pl-10"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); setOtp(''); setNewPassword(''); setConfirmPass(''); }}
                  disabled={loading}
                  className="flex-1 glass-btn-secondary py-2 flex items-center justify-center space-x-1 text-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] glass-btn-primary py-2 flex items-center justify-center space-x-1 text-xs disabled:opacity-50"
                >
                  <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && (
            <div className="text-center space-y-5">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-emerald-950/30 border border-emerald-900/40 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
              <p className="text-sm text-slate-300">
                Your password has been reset. You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full glass-btn-primary flex items-center justify-center space-x-2"
              >
                <span>Go to Login</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Footer */}
          {step !== 3 && (
            <div className="border-t border-darkBorder/40 mt-6 pt-4 text-center">
              <p className="text-xs text-slate-400">
                Remember your password?{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
