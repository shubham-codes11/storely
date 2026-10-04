import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Check, AlertCircle, Eye, EyeOff, Lock, Mail, User, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const { login, register } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  if (!isOpen) return null;

  // Validation criteria helpers for live visual feedback
  const isNameLengthValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isPassLengthValid = password.length >= 8 && password.length <= 16;
  const hasPassUppercase = /[A-Z]/.test(password);
  const hasPassSpecial = /[^A-Za-z0-9]/.test(password);
  const isPassValid = isPassLengthValid && hasPassUppercase && hasPassSpecial;
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setValidationErrors({});

    // Client-side pre-validation
    const errors = {};
    if (!isNameLengthValid) errors.name = 'Full Name must be 20 to 60 characters.';
    if (!isEmailValid) errors.email = 'Please provide a valid email address.';
    if (!isAddressValid) errors.address = 'Address cannot exceed 400 characters.';
    if (!isPassValid) errors.password = 'Password must meet all complexity rules.';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, address });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
      if (err.errors) setValidationErrors(err.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
      >
        {/* Header Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 relative">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-4 text-center font-bold text-sm transition-all ${
              mode === 'login'
                ? 'text-teal-700 bg-white border-b-2 border-teal-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-4 text-center font-bold text-sm transition-all ${
              mode === 'register'
                ? 'text-teal-700 bg-white border-b-2 border-teal-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Normal User Account
          </button>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </div>

              {/* Quick helper note */}
              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                Single sign-in for <span className="font-semibold text-slate-700">Administrators</span>,{' '}
                <span className="font-semibold text-slate-700">Store Owners</span>, and{' '}
                <span className="font-semibold text-slate-700">Normal Users</span>.
              </div>
            </form>
          ) : (
            /* Register Form (Normal User) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Name (20 to 60 chars) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <span
                    className={`text-[11px] font-semibold ${
                      isNameLengthValid ? 'text-teal-600' : 'text-slate-400'
                    }`}
                  >
                    {name.length}/60 (min 20)
                  </span>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jonathan Robert Reynolds Jr"
                    className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                      validationErrors.name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500'
                    }`}
                  />
                </div>
                {validationErrors.name && (
                  <p className="text-[11px] text-rose-500 mt-1">{validationErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                      validationErrors.email ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500'
                    }`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-[11px] text-rose-500 mt-1">{validationErrors.email}</p>
                )}
              </div>

              {/* Address (Max 400 chars) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Address
                  </label>
                  <span
                    className={`text-[11px] font-semibold ${
                      address.length > 400 ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  >
                    {address.length}/400 max
                  </span>
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    required
                    rows="2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Example Street, City, State, ZIP"
                    className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                      validationErrors.address ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500'
                    }`}
                  />
                </div>
                {validationErrors.address && (
                  <p className="text-[11px] text-rose-500 mt-1">{validationErrors.address}</p>
                )}
              </div>

              {/* Password (8-16 chars, 1 uppercase, 1 special char) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. Secure@2026"
                    className={`w-full pl-10 pr-10 py-2 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                      validationErrors.password ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password validation indicators */}
                <div className="grid grid-cols-3 gap-1.5 mt-2 text-[10px] font-semibold">
                  <span
                    className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isPassLengthValid ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isPassLengthValid ? '✓' : '•'} 8-16 Chars
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      hasPassUppercase ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {hasPassUppercase ? '✓' : '•'} 1 Uppercase
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      hasPassSpecial ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {hasPassSpecial ? '✓' : '•'} 1 Special Char
                  </span>
                </div>
                {validationErrors.password && (
                  <p className="text-[11px] text-rose-500 mt-1">{validationErrors.password}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
