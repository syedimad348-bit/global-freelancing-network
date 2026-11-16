import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { registerRequest } from '../lib/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await registerRequest(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try a different email or check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F4] text-ink font-sans antialiased relative overflow-hidden">
      {/* decorative blobs */}
      <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-emerald-100/60 blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-100/50 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full bg-emerald-50/70 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-amber-50/60 blur-[80px] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-md p-4 sm:p-6">
        <div className="relative rounded-3xl overflow-hidden bg-white border border-emerald-100 shadow-xl">
          <div className="p-8 sm:p-10 lg:p-12">

            {/* logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-amber-500 flex items-center justify-center shadow-lg">
                <span className="w-5 h-5 text-white">🔥</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-ink leading-tight">Global Freelancing</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">Network</p>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-1">Create account</h2>
            <p className="text-sm text-ink-muted mb-7">Join the international freelancing network.</p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs font-medium text-rose-800"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle block mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g. Imad Ali"
                    className="w-full h-12 rounded-xl pl-11 pr-4 bg-white border border-line text-sm text-ink placeholder:text-ink-subtle transition-all duration-150 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="name@example.com"
                    className="w-full h-12 rounded-xl pl-11 pr-4 bg-white border border-line text-sm text-ink placeholder:text-ink-subtle transition-all duration-150 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle block mb-1.5">Password (min 6 characters)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    placeholder="Create a strong password"
                    className="w-full h-12 rounded-xl pl-11 pr-11 bg-white border border-line text-sm text-ink placeholder:text-ink-subtle transition-all duration-150 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-600 p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold uppercase tracking-[0.15em] shadow-lg hover:brightness-105 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-sm text-ink-soft">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-emerald-600 hover:underline transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}