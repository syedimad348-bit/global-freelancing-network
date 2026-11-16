import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Flame } from 'lucide-react';
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
        user: { _id: 'demo-user-id', name: 'Imad Freelancer', email: DEMO_CREDENTIALS.email, plan: 'pro' },
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

  const checkbox = (checked, onChange, id) => (
    <span className={`w-4 h-4 rounded-sm grid place-items-center border-2 transition-colors ${checked ? 'bg-amber-500 border-amber-500' : 'border-amber-300 bg-white'}`}>
      {checked && <span className="w-2 h-2 rounded-[2px] bg-white" />}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only opacity-0"
      />
    </span>
  );

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans antialiased">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6 items-center min-h-[560px]">

          {/* ── LEFT: FOREST PANEL WITH GOLD ACCENTS ───────────────────────── */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#052E22] to-[#064E3B] text-white flex flex-col justify-between p-8 md:p-12 min-h-[520px]">
            {/* decorative glows */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="relative">
              <h2 className="text-lg font-semibold text-white/80 tracking-[0.2em] uppercase">Global Freelancing Network</h2>
              <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold leading-tight text-white">
                hello, welcome<span className="text-amber-400">!</span>
              </h1>
            </div>

            <div className="relative flex flex-col items-center text-center my-auto py-8">
              <div className="w-20 h-20 rounded-full bg-amber-500/15 flex items-center justify-center shadow-lg">
                <Flame className="w-9 h-9 text-amber-400" />
              </div>
              <h3 className="mt-4 text-2xl font-bold tracking-tight text-white">Global Freelancing</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60 max-w-[260px]">
                Your global career, powered by AI. Real-time jobs from Upwork, LinkedIn and Remotive, plus 20 elite productivity tricks.
              </p>
            </div>

            <div className="relative flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="w-full h-11 rounded-full border border-white/25 text-white/80 text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-[#052E22] hover:border-white transition-colors"
              >
                Get Started
              </button>
              <div className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                <Link to="/register" className="hover:text-amber-400 transition-colors">Create New</Link>
                <span className="opacity-40">|</span>
                <span className="text-amber-400">Log In</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: EMERALD + GOLD FORM PANEL ───────────────────────────── */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#052E22] to-[#064E3B] shadow-2xl border border-emerald-500/30 min-h-[520px] flex flex-col justify-center p-8 md:p-10 lg:p-12">
            {/* decorative glow */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">welcome</h2>
              <p className="mt-1 text-sm text-amber-300">Login to your account to continue</p>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-white/10 border border-white/20 text-xs font-medium text-white/80">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-7 space-y-4">
                {/* Email */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full h-12 rounded-xl pl-11 pr-4 bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/40 transition-all duration-150 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/25"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full h-12 rounded-xl pl-11 pr-11 bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/40 transition-all duration-150 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-300 p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-3">
                  {checkbox(rememberMe, (e) => setRememberMe(e.target.checked), 'remember')}
                  <span className="text-sm font-medium text-white/70">Remember me</span>
                </div>

                {/* Sign in */}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold uppercase tracking-[0.15em] shadow-lg hover:shadow-emerald-500/20 hover:brightness-105 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                >
                  {busy ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Create account link */}
              <p className="mt-7 text-sm text-ink-soft text-center">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-amber-300 hover:underline transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}