import React, { useState, useEffect } from 'react';
import { X, LogIn, Lock, Mail, User, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Eye, EyeOff } from 'lucide-react';
import { sendOtp, verifyOtp, loginUser } from '../services/api';

export default function SignInModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('signup'); // 'signup' or 'signin'
  const [step, setStep] = useState('form'); // 'form' or 'otp' or 'success'

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DONOR');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Timer for resend cooldown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Please set a password with at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp(email, fullName);
      setSuccessMessage(res.message || 'Verification code sent to your email.');
      setStep('otp');
      setResendCooldown(60); // 60s cooldown for resending
    } catch (err) {
      setError(err.message || 'Failed to send verification email.');
    } finally {
      setLoading(false);
    }
  };

  const executeVerifyOtp = async (otpCode) => {
    const code = (otpCode !== undefined ? otpCode : otp).trim();
    setError('');

    if (!code || code.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp({
        email,
        otp: code,
        fullName,
        role,
        password
      });

      setStep('success');
      if (onLoginSuccess && res.user) {
        onLoginSuccess(res.user);
      }

      // Automatically finish and enter the web
      setTimeout(() => {
        onClose();
        setStep('form');
        setOtp('');
      }, 800);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    executeVerifyOtp(otp);
  };

  const handleDirectSignIn = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser(email, password);
      setStep('success');
      if (onLoginSuccess && res.user) {
        onLoginSuccess(res.user);
      }
      setTimeout(() => {
        onClose();
        setStep('form');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Banner */}
        <div className="bg-[#0B1120] p-4 sm:p-6 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center shadow-md shadow-red-900/50">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight">BloodPulse</span>
                <span className="bg-[#DC2626] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
                  OPS AUTH
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Email Verified Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        {step !== 'success' && (
          <div className="grid grid-cols-2 p-1.5 sm:p-2 bg-slate-100/80 border-b border-slate-200 text-xs font-bold flex-shrink-0">
            <button
              onClick={() => {
                setTab('signup');
                setStep('form');
                setError('');
              }}
              className={`py-2 rounded-xl transition ${
                tab === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign Up (Email OTP)
            </button>
            <button
              onClick={() => {
                setTab('signin');
                setStep('form');
                setError('');
              }}
              className={`py-2 rounded-xl transition ${
                tab === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {tab === 'signup' ? 'Email Verified & Account Created!' : 'Signed In Successfully!'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Welcome to the BloodPulse Emergency Response Network.
              </p>
            </div>
          )}

          {/* SIGN UP - STEP 1: Form */}
          {tab === 'signup' && step === 'form' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  I Want to Register As
                </label>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { id: 'DONOR', label: 'Blood Donor' },
                    { id: 'HOSPITAL', label: 'Hospital/Bank' },
                    { id: 'RECIPIENT', label: 'Patient/Attender' }
                  ].map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`py-2 text-[11px] font-bold rounded-xl border transition ${
                        role === r.id
                          ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Address (OTP will be sent here) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Set Account Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-xs font-medium text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  You will use this password to sign in later.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-rose-600/30 uppercase tracking-wide transition flex items-center justify-center gap-2 active:scale-98"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending OTP Email...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Verification Code</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                🔒 We will send a 6-digit OTP from <strong>BloodPulse EMERGENCY OPS</strong> to your primary inbox.
              </p>
            </form>
          )}

          {/* SIGN UP - STEP 2: OTP Verification */}
          {tab === 'signup' && step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Enter 6-Digit OTP</h4>
                <p className="text-xs text-slate-500">
                  Verification code sent to <strong className="text-slate-800">{email}</strong>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength="6"
                  required
                  autoFocus
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(val);
                    setError('');
                    if (val.length === 6 && !loading) {
                      executeVerifyOtp(val);
                    }
                  }}
                  className="w-full bg-slate-50 border-2 border-rose-300 focus:border-rose-600 rounded-2xl py-3 text-center text-2xl font-mono font-extrabold tracking-[10px] text-slate-900 focus:ring-4 focus:ring-rose-100 transition"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Didn't receive email?</span>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleSendOtp}
                  className="font-bold text-rose-600 hover:text-rose-700 disabled:text-slate-400 transition"
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-rose-600/30 uppercase tracking-wide transition flex items-center justify-center gap-2 active:scale-98"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Email & Activate</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  ← Edit Email / Password
                </button>
              </div>
            </form>
          )}

          {/* SIGN IN TAB */}
          {tab === 'signin' && step === 'form' && (
            <form onSubmit={handleDirectSignIn} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-xs font-medium text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-rose-600/30 uppercase tracking-wide transition flex items-center justify-center gap-2 active:scale-98"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  <span>Sign In</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  New to BloodPulse?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setTab('signup');
                      setStep('form');
                      setError('');
                    }}
                    className="font-bold text-rose-600 hover:underline"
                  >
                    Verify Email & Sign Up
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
