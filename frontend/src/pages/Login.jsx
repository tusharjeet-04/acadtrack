import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, GraduationCap, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { loginRequest, verifyOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [otp,         setOtp]         = useState('');
  const [step,        setStep]        = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError(''); setInfoMessage(''); setLoading(true);
    try {
      const result = await loginRequest(email, password);
      if (result.otpSent) {
        setInfoMessage(`OTP sent to ${email}. Check your inbox.`);
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Enter a valid 6-digit OTP.'); return; }
    setError(''); setLoading(true);
    try {
      const u = await verifyOTP(otp);
      if (u.role === 'admin')        navigate('/admin');
      else if (u.role === 'faculty') navigate('/faculty');
      else                           navigate('/student');
    } catch (err) {
      setError(err.message || 'Incorrect OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] flex-col justify-between p-12 relative overflow-hidden bg-darkCard border-r border-darkBorder/60">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-30"
          style={{backgroundImage:"linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)", backgroundSize:"48px 48px"}} />
        {/* Glow blobs */}
        <div className="absolute top-1/4 -left-24 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-indigo-600/8 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
              <GraduationCap className="h-5.5 w-5.5 text-primary-400" style={{width:'22px',height:'22px'}} />
            </div>
            <span className="text-xl font-bold text-gradient-primary">AcadTrack</span>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Your academic<br />journey, organised.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              A unified platform for students, faculty, and administrators — 
              grades, attendance, schedules, and more.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { label: 'Students',   value: '50+' },
            { label: 'Faculty',    value: '10+' },
            { label: 'Courses',    value: '22+'  },
          ].map(s => (
            <div key={s.label} className="bg-darkSurface/80 border border-darkBorder/60 rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-primary-400">{s.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Auth Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary-400" />
            </div>
            <span className="text-lg font-bold text-gradient-primary">AcadTrack</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary-500' : 'bg-darkBorder'}`} />
            <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary-500' : 'bg-darkBorder'}`} />
          </div>

          <h3 className="text-2xl font-bold text-white mb-1">
            {step === 1 ? 'Sign in' : 'Verify your identity'}
          </h3>
          <p className="text-sm text-slate-500 mb-7">
            {step === 1 ? 'Enter your credentials to continue.' : 'Enter the 6-digit OTP sent to your email.'}
          </p>

          {/* Error */}
          {error && (
            <div className="alert-error mb-5 text-xs">
              <span className="leading-relaxed">{error}</span>
            </div>
          )}
          {/* Info */}
          {infoMessage && step === 2 && (
            <div className="alert-info mb-5 text-xs">
              <span>{infoMessage}</span>
            </div>
          )}

          {/* ── Step 1 ── */}
          {step === 1 && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email" required autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input pl-10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-400">Password</label>
                  <Link to="/forgot-password" className="text-[11px] text-primary-400 hover:text-primary-300 transition-colors font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'} required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="glass-btn-primary w-full mt-2">
                {loading ? 'Signing in…' : <><span>Continue</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 text-center">One-Time Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                  <input
                    id="login-otp"
                    type="text" required maxLength={6} autoFocus
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="glass-input pl-10 text-center text-xl tracking-[0.4em] font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setError(''); setOtp(''); }}
                  disabled={loading} className="glass-btn-secondary flex-1">
                  <ArrowLeft className="h-4 w-4" /><span>Back</span>
                </button>
                <button type="submit" disabled={loading} className="glass-btn-primary flex-[2]">
                  {loading ? 'Verifying…' : 'Verify & Sign in'}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-slate-600 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
