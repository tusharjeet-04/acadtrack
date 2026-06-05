import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, GraduationCap } from 'lucide-react';

const Login = () => {
  const { loginRequest, verifyOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  // Authentication states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Credentials, 2 = OTP Verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const result = await loginRequest(email, password);
      if (result.otpSent) {
        setInfoMessage(`A 6-digit OTP has been sent to ${email}. Please check your inbox.`);
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
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const loggedInUser = await verifyOTP(otp);
      // Redirect according to role
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedInUser.role === 'faculty') {
        navigate('/faculty');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.message || 'Incorrect OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

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
          <h3 className="text-xl font-bold text-slate-100 mb-2">
            {step === 1 ? 'Welcome Back' : 'Security Verification'}
          </h3>
          <p className="text-slate-400 text-xs mb-6">
            {step === 1 
              ? 'Enter your academic credentials to initiate login.' 
              : 'Enter the 6-digit One-Time Password sent to your inbox.'}
          </p>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}
          {infoMessage && (
            <div className="mb-4 p-3 rounded-lg bg-amber-950/20 border border-amber-900/30 text-amber-300 text-[11px] leading-relaxed">
              {infoMessage}
            </div>
          )}

          {/* Form Step 1: Credentials */}
          {step === 1 && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Gmail Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input pl-10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full glass-btn-primary flex items-center justify-center space-x-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form Step 2: OTP Entry */}
          {step === 2 && (
            <form onSubmit={handleOTPSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Verification OTP Code
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only digits
                    className="w-full glass-input pl-10 text-center text-lg tracking-widest font-bold"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
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
                  <span>Verify & Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="border-t border-darkBorder/40 mt-6 pt-4 text-center">
            <p className="text-xs text-slate-400">
              New to AcadTrack?{' '}
              <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
