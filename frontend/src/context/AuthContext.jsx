import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [tempEmail,   setTempEmail]   = useState('');
  const [tempPurpose, setTempPurpose] = useState(''); // 'login' | 'signup'

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('acadtrack_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  // ─── Step 1 Login: validate credentials → send OTP via Brevo ───────────────
  const loginRequest = async (email, password) => {
    const res  = await fetch(`${API_BASE}/auth/login-request`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    // Store email for step-2 OTP verification
    setTempEmail(email);
    setTempPurpose('login');

    return { otpSent: true, message: data.message };
  };

  // ─── Step 1 Signup: validate & store → send OTP via Brevo ──────────────────
  const signupRequest = async (userData) => {
    const res  = await fetch(`${API_BASE}/auth/signup-request`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    // Store email for step-2 OTP verification
    setTempEmail(userData.email);
    setTempPurpose('signup');

    return { otpSent: true, message: data.message };
  };

  // ─── Step 2: Verify OTP → get token → log in ───────────────────────────────
  const verifyOTP = async (otp) => {
    const res  = await fetch(`${API_BASE}/auth/verify-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: tempEmail, otp, purpose: tempPurpose }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'OTP verification failed');

    // Save user details with token
    localStorage.setItem('acadtrack_user', JSON.stringify(data));
    setUser(data);
    setTempEmail('');
    setTempPurpose('');
    return data;
  };

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('acadtrack_user');
    setUser(null);
  };

  // ─── Authenticated API helper ────────────────────────────────────────────────
  const authFetch = async (url, options = {}) => {
    const token = user?.token;
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${url}`, { ...options, headers });

    if (res.status === 401) {
      logout();
      throw new Error('Session expired. Please log in again.');
    }

    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        tempEmail,
        tempPurpose,
        loginRequest,
        signupRequest,
        verifyOTP,
        logout,
        authFetch,
        API_BASE,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
