import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, ShieldCheck, Lock, ArrowRight, ArrowLeft, GraduationCap, CheckCircle, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPasswordRequest, resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step,        setStep]        = useState(1);
  const [email,       setEmail]       = useState('');
  const [otp,         setOtp]         = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [infoMsg,     setInfoMsg]     = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6)        return setError('Password must be at least 6 characters.');
    if (newPassword !== confirmPass)   return setError('Passwords do not match.');
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

  const stepMeta = [
    { title: 'Forgot Password',  desc: 'Enter your registered email to receive a one-time code.' },
    { title: 'Reset Password',   desc: 'Enter the OTP from your inbox and set a new password.' },
    { title: 'Password Updated', desc: '' },
  ];

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[400px] relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-primary-600/15 border border-primary-500/25 flex items-center justify-center mb-4 shadow-glow-sm">
            <GraduationCap className="h-6 w-6 text-primary-400" />
          </div>
          <span className="text-xl font-bold text-gradient-primary">AcadTrack</span>
          <p className="text-[11px] text-slate-600 mt-0.5">Academic Management System</p>
        </div>

        {/* Card */}
        <div className="glass-panel-elevated p-7">
          {/* Step dots */}
          <div className="flex items-center gap-1.5 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s}
                className={`h-1 rounded-full transition-all duration-500 ${
                  s <= step ? 'bg-primary-500' : 'bg-darkBorder'
                } ${s === step ? 'flex-[3]' : 'flex-1'}`}
              />
            ))}
          </div>

          <h3 className="text-lg font-bold text-white mb-1">{stepMeta[step - 1].title}</h3>
          {step < 3 && <p className="text-xs text-slate-500 mb-6">{stepMeta[step - 1].desc}</p>}

          {/* Error */}
          {error && (
            <div className="alert-error mb-5 text-xs">
              <span>{error}</span>
            </div>
          )}
          {infoMsg && step === 2 && (
            <div className="alert-info mb-5 text-xs">
              <span>{infoMsg}</span>
            </div>
          )}

          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                  <input
                    id="fp-email"
                    type="email" required autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input pl-10"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="glass-btn-primary w-full">
                {loading ? 'Sending OTP…' : <><span>Send OTP</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP + New Password ── */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 text-center">OTP Code</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                  <input
                    id="fp-otp"
                    type="text" required maxLength={6} autoFocus
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="glass-input pl-10 text-center text-xl tracking-[0.4em] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                  <input id="fp-newpass" type={showPass ? 'text' : 'password'} required
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="glass-input pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                  <input id="fp-confirmpass" type={showConfirm ? 'text' : 'password'} required
                    placeholder="Repeat new password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="glass-input pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" disabled={loading} onClick={() => { setStep(1); setError(''); setOtp(''); setNewPassword(''); setConfirmPass(''); }}
                  className="glass-btn-secondary flex-1">
                  <ArrowLeft className="h-4 w-4" />Back
                </button>
                <button type="submit" disabled={loading} className="glass-btn-primary flex-[2]">
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && (
            <div className="text-center py-4 space-y-5">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-100 mb-1">Password changed!</p>
                <p className="text-xs text-slate-500">You can now sign in with your new password.</p>
              </div>
              <button onClick={() => navigate('/login')} className="glass-btn-primary w-full">
                <span>Go to Login</span><ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Footer link */}
          {step !== 3 && (
            <p className="text-center text-xs text-slate-600 mt-6">
              Remember your password?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
