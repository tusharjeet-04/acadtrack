import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, GraduationCap, Building2, Eye, EyeOff, BadgeCheck } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
];

const Signup = () => {
  const { signupRequest, verifyOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    role: 'student', department: 'Computer Science',
    semester: '1', studentId: '', facultyId: '',
  });
  const [showPass,     setShowPass]     = useState(false);
  const [otp,         setOtp]           = useState('');
  const [step,        setStep]          = useState(1);
  const [loading,     setLoading]       = useState(false);
  const [error,       setError]         = useState('');
  const [infoMessage, setInfoMessage]   = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setError(''); setInfoMessage(''); setLoading(true);
    try {
      if (formData.role === 'student' && !formData.studentId) throw new Error('Student ID is required');
      if (formData.role === 'faculty' && !formData.facultyId) throw new Error('Faculty ID is required');
      const result = await signupRequest(formData);
      if (result.otpSent) {
        setInfoMessage(`OTP sent to ${formData.email}. Check your inbox.`);
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
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
      <div className="hidden lg:flex lg:w-[38%] xl:w-[42%] flex-col justify-between p-12 relative overflow-hidden bg-darkCard border-r border-darkBorder/60">
        <div className="absolute inset-0 opacity-30"
          style={{backgroundImage:"linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)", backgroundSize:"48px 48px"}} />
        <div className="absolute top-1/4 -left-24 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-400" />
            </div>
            <span className="text-xl font-bold text-gradient-primary">AcadTrack</span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Join your institution's<br />digital campus.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Register as a student or faculty member and get instant access to grades, attendance, schedules and more.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {['OTP-verified email registration', 'Role-based secure access', 'Real-time academic tracking'].map(f => (
            <div key={f} className="flex items-center gap-3">
              <BadgeCheck className="h-4 w-4 text-primary-400 flex-shrink-0" />
              <span className="text-sm text-slate-400">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-6 relative z-10">
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
            {step === 1 ? 'Create account' : 'Verify your email'}
          </h3>
          <p className="text-sm text-slate-500 mb-7">
            {step === 1 ? 'Fill in your academic profile details.' : 'Enter the 6-digit OTP sent to your inbox.'}
          </p>

          {error && <div className="alert-error mb-5 text-xs"><span>{error}</span></div>}
          {infoMessage && step === 2 && <div className="alert-info mb-5 text-xs"><span>{infoMessage}</span></div>}

          {/* ── Step 1 ── */}
          {step === 1 && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                    <input type="text" name="name" required autoFocus
                      placeholder="John Doe"
                      value={formData.name} onChange={handleChange}
                      className="glass-input pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                    <input type="email" name="email" required
                      placeholder="you@example.com"
                      value={formData.email} onChange={handleChange}
                      className="glass-input pl-10" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                    <input type={showPass ? 'text' : 'password'} name="password" required
                      placeholder="Min 6 chars"
                      value={formData.password} onChange={handleChange}
                      className="glass-input pl-10 pr-10" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="glass-input">
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Department</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                    <select name="department" value={formData.department} onChange={handleChange} className="glass-input pl-10">
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                {formData.role === 'student' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Semester</label>
                    <select name="semester" value={formData.semester} onChange={handleChange} className="glass-input">
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {formData.role === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Student ID</label>
                  <input type="text" name="studentId" required
                    placeholder="e.g. S-2024-401"
                    value={formData.studentId} onChange={handleChange}
                    className="glass-input" />
                </div>
              )}
              {formData.role === 'faculty' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Faculty ID</label>
                  <input type="text" name="facultyId" required
                    placeholder="e.g. F-2026-901"
                    value={formData.facultyId} onChange={handleChange}
                    className="glass-input" />
                </div>
              )}

              <button type="submit" disabled={loading} className="glass-btn-primary w-full mt-2">
                {loading ? 'Creating Account…' : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
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
                  <input type="text" required maxLength={6} autoFocus
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="glass-input pl-10 text-center text-xl tracking-[0.4em] font-bold" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setError(''); setOtp(''); }}
                  disabled={loading} className="glass-btn-secondary flex-1">
                  <ArrowLeft className="h-4 w-4" />Back
                </button>
                <button type="submit" disabled={loading} className="glass-btn-primary flex-[2]">
                  {loading ? 'Verifying…' : 'Verify & Register'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-xs text-slate-600 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
