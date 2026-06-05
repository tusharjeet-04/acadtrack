import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, GraduationCap, Building2 } from 'lucide-react';

const Signup = () => {
  const { signupRequest, verifyOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: 'Computer Science',
    semester: '1',
    studentId: '',
    facultyId: '',
  });

  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP Verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      if (formData.role === 'student' && !formData.studentId) throw new Error('Student ID is required');
      if (formData.role === 'faculty' && !formData.facultyId) throw new Error('Faculty ID is required');

      const result = await signupRequest(formData);
      if (result.otpSent) {
        setInfoMessage(`A 6-digit OTP has been sent to ${formData.email}. Please check your inbox.`);
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
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const registeredUser = await verifyOTP(otp);
      // Redirect according to role
      if (registeredUser.role === 'admin') {
        navigate('/admin');
      } else if (registeredUser.role === 'faculty') {
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

      <div className="w-full max-w-lg z-10 py-6">
        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-primary-600/15 border border-primary-500/20 rounded-2xl mb-3 shadow-lg shadow-primary-500/5">
            <GraduationCap className="h-10 w-10 text-primary-500" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-primary-400 bg-clip-text text-transparent">
            AcadTrack
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium">Create Student Academic Account</p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 bg-darkCard/50 backdrop-blur-xl border border-darkBorder/80">
          <h3 className="text-xl font-bold text-slate-100 mb-2">
            {step === 1 ? 'Start Your Journey' : 'Email Verification'}
          </h3>
          <p className="text-slate-400 text-xs mb-6">
            {step === 1 
              ? 'Fill in your academic profile details below.' 
              : 'Enter the 6-digit One-Time Password sent to your email.'}
          </p>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs font-medium animate-shake">
              {error}
            </div>
          )}
          {infoMessage && (
            <div className="mb-4 p-3 rounded-lg bg-amber-950/20 border border-amber-900/30 text-amber-300 text-[11px] leading-relaxed">
              {infoMessage}
            </div>
          )}

          {/* Form Step 1: Details */}
          {step === 1 && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full glass-input pl-10 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Gmail Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full glass-input pl-10 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full glass-input pl-10 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Academic Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full glass-input text-sm"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full glass-input pl-10 text-sm"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Business Administration">Business Administration</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Fields based on Role */}
                {formData.role === 'student' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Semester
                    </label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full glass-input text-sm"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {formData.role === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Registration Student ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    required
                    placeholder="e.g. S-2024-401"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full glass-input text-sm"
                  />
                </div>
              )}

              {formData.role === 'faculty' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Faculty ID
                  </label>
                  <input
                    type="text"
                    name="facultyId"
                    required
                    placeholder="e.g. F-2026-901"
                    value={formData.facultyId}
                    onChange={handleChange}
                    className="w-full glass-input text-sm"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full glass-btn-primary flex items-center justify-center space-x-2 mt-4 disabled:opacity-50 text-sm font-semibold"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
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
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
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
                  <span>Verify & Create Account</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="border-t border-darkBorder/40 mt-6 pt-4 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
