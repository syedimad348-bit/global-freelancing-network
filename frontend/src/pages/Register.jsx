import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { registerRequest } from '../lib/api';
import Logo from '../components/ui/Logo';

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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans text-ink">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-elevated border border-line overflow-hidden grid lg:grid-cols-12 min-h-[640px]">
        {/* ── Left Column: 3D Visual & Brand Showcase (5 cols) ──────────────── */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1E1035] via-[#2A1647] to-[#160B29] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo Header */}
          <div className="relative z-10">
            <Logo size="md" inverted />
          </div>

          {/* Center Graphic & Highlights */}
          <div className="relative z-10 py-6 space-y-6 text-center lg:text-left">
            <div className="relative mx-auto lg:mx-0 w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
              <img
                src="/images/hero-character.png"
                alt="Global Freelancing illustration"
                className="max-h-full max-w-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                Join the International Freelancing Network
              </h2>
              <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
                Connect directly with overseas clients, access automated job aggregation, and request proprietary AI tricks.
              </p>
            </div>

            <div className="space-y-2 text-xs text-purple-200/90 pt-2 border-t border-white/10 hidden sm:block">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero platform commissions on direct connects</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant access to 20 verified AI productivity tools</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 text-[11px] text-purple-300/80 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Compliant with international data privacy standards</span>
          </div>
        </div>

        {/* ── Right Column: Clean White Form (7 cols) ───────────────────────── */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center max-w-xl mx-auto w-full">
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                Get Started
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight mt-0.5">
                Create your account
              </h1>
              <p className="text-xs text-ink-muted mt-1">
                Enter your details to create your personalized career command center.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-medium text-rose-700"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g. Imad Ali"
                    className="input pl-10 h-11 text-sm"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="name@example.com"
                    className="input pl-10 h-11 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label">Password (min 6 characters)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    placeholder="Create a strong password"
                    className="input pl-10 pr-10 h-11 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-11 text-sm font-bold shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-2 border-t border-line text-xs text-ink-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
