import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';
import { apiFetch } from '../lib/api';
import Logo from '../components/ui/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setBusy(true);

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (data?.token) localStorage.setItem('token', data.token);
      if (data?.user)  localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Invalid email or password. Please check credentials and try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDemoSignIn = async () => {
    setEmail('demo@globalfreelance.network');
    setPassword('demo1234');
    setError('');
    setBusy(true);

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'demo@dailyradar.com', password: 'demo1234' }),
      }).catch(() => {
        // Safe offline demo user session fallback
        return {
          token: 'demo-jwt-token-gfn-2026',
          user: {
            _id: 'demo-user-id',
            name: 'Imad Freelancer',
            email: 'demo@globalfreelance.network',
            plan: 'pro',
            interests: ['Web Development', 'AI Automation', 'Video Editing'],
          },
        };
      });

      if (data?.token) localStorage.setItem('token', data.token);
      if (data?.user)  localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError('Demo sign-in failed. Please try manual login.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans text-ink">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-elevated border border-line overflow-hidden grid lg:grid-cols-12 min-h-[640px]">
        {/* ── Left Column: 3D Visual & Brand Showcase (5 cols) ──────────────── */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 to-emerald-800 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

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
                  // Fallback to elegant CSS representation if image is missing
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              <div
                style={{ display: 'none' }}
                className="w-36 h-36 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-700 items-center justify-center text-white shadow-glow"
              >
                <Sparkles className="w-16 h-16 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                Accelerate Your Global Freelance Career
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                Aggregated jobs from Upwork, LinkedIn, and Remotive paired with 20 elite AI productivity tricks.
              </p>
            </div>

            <div className="space-y-2 text-xs text-emerald-200/90 pt-2 border-t border-white/10 hidden sm:block">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Real-time deduplicated job aggregation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant WhatsApp trick access requests</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 text-[11px] text-emerald-300/80 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bank-grade encrypted authentication</span>
          </div>
        </div>

        {/* ── Right Column: Clean White Form (7 cols) ───────────────────────── */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center max-w-xl mx-auto w-full">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                  Welcome Back
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight mt-0.5">
                  Sign in to your account
                </h1>
              </div>

              {/* Quick Demo Button */}
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-400 hover:bg-emerald-100 transition-colors"
                title="Sign in with preconfigured demo account"
              >
                Use Demo
              </button>
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

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="input pl-10 h-11 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label !mb-0">Password</label>
                  <span className="text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
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

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 border-line focus:ring-brand-500 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 text-xs font-medium text-ink-soft cursor-pointer">
                  Remember me on this browser
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full h-11 text-sm font-bold shadow-sm"
              >
                {busy ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Signing you in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            {/* Registration Link */}
            <div className="text-center pt-2 border-t border-line text-xs text-ink-muted">
              Don’t have an account yet?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
