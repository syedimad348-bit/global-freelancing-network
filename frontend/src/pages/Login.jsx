import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';
import { apiFetch, DEMO_CREDENTIALS } from '../lib/api';

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
      if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Invalid email or password. Please check credentials and try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDemoSignIn = async () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError('');
    setBusy(true);

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password }),
      }).catch(() => ({
        token: 'demo-jwt-token-gfn-2026',
        user: {
          _id: 'demo-user-id',
          name: 'Imad Freelancer',
          email: DEMO_CREDENTIALS.email,
          plan: 'pro',
        },
      }));

      if (data?.token) localStorage.setItem('token', data.token);
      if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));
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

        {/* ── Left Column: Premium Gradients & Brand (5 cols) ──────────────── */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 to-emerald-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">

          {/* Subtle animated blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/15 blur-4xl pointer-events-none animate-float" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-float" />

          {/* Center Graphic & Highlights */}
          <div className="relative z-10 py-8 lg:py-12 text-center lg:text-left">
            <div className="relative mx-auto lg:mx-0 w-52 h-52 flex items-center justify-center mb-6">
              <img
                src="/images/hero-character.png"
                alt="Global Freelancing illustration"
                className="max-h-full max-w-full object-contain drop-shadow-3xl hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              <div
                style={{ display: 'none' }}
                className="w-36 h-36 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-700 items-center justify-center text-white shadow-2xl"
              >
                <Sparkles className="w-16 h-16 animate-pulse" />
              </div>
            </div>

            <div className="space-y-3 text-left lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                Accelerate Your Global Freelance Career
              </h2>
              <p className="text-base sm:text-lg text-emerald-100 leading-relaxed mb-6">
                Aggregated jobs from Upwork, LinkedIn, and Remotive paired with 20 elite AI productivity tricks.
              </p>

              {/* Feature highlights */}
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

              {/* Security badge */}
              <div className="relative z-10 text-[11px] text-emerald-300/80 flex items-center gap-1.5 mt-4">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bank-grade encrypted authentication</span>
              </div>
            </div>
          </div>

          {/* Footer note with sparkle */}
          <div className="relative z-10 text-[10px] text-emerald-400/70 flex items-center gap-1.5 mt-2">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>Trusted by 12K+ freelancers worldwide</span>
          </div>
        </div>

        {/* ── Right Column: Clean Glassmorphism Form (7 cols) ──────────────── */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center max-w-xl mx-auto w-full">
          <div className="space-y-8">

            {/* Brand header on form */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Welcome Back</span>
                <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight mt-0.5">
                  Sign in to your account
                </h1>
              </div>

              {/* Quick demo call-to-action */}
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50/20 text-emerald-400 hover:bg-emerald-100/30 transition-colors"
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
                className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 text-sm font-medium text-rose-400"
              >
                {error}
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">

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
                    className="input pl-10 pr-10 h-12 text-sm bg-surface-subtle border-line focus:outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="input pl-10 pr-10 h-12 text-sm bg-surface-subtle border-line focus:outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors p-1.5"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-3">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-emerald-50 border-emerald-200 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="remember-me" className="text-sm font-medium text-ink-soft cursor-pointer">
                  Remember me on this browser
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full h-12 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-colors"
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
            <div className="pt-4 border-t border-line text-xs text-ink-muted flex items-center justify-between">
              <span>Don't have an account yet?</span>
              <div className="flex items-center gap-2">
                <Link
                  to="/register"
                  className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors underline offset-2"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}