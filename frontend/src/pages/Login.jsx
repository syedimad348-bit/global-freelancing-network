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

  return (
    <div className="min-h-screen bg-[#E9EDF0] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-5xl rounded-[28px] overflow-hidden shadow-2xl grid md:grid-cols-2 min-h-[620px]">

        {/* ── LEFT: BLACK BRAND PANEL ─────────────────────────────────────── */}
        <div className="relative bg-[#0B0B0B] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
          {/* corner accents */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#22C55E]/10 blur-2xl pointer-events-none" />

          <div>
            <h2 className="text-lg font-semibold text-white/90">Hello</h2>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mt-1">
              welcome to<span className="text-[#22C55E]">!</span>
            </h1>
          </div>

          {/* Brand mark */}
          <div className="flex flex-col items-center text-center my-6">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
              <Flame className="w-9 h-9 text-[#2563EB]" fill="#2563EB" />
            </div>
            <h3 className="mt-4 text-2xl font-extrabold tracking-tight">Global Freelancing</h3>
            <p className="mt-3 text-xs leading-relaxed text-white/60 max-w-[230px]">
              Your global career, powered by AI. Real-time jobs from Upwork, LinkedIn and Remotive, plus 20 elite productivity tricks.
            </p>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full h-11 rounded-full border border-white/25 text-white/80 text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
            >
              Get Started
            </button>
            <div className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
              <Link to="/register" className="hover:text-[#22C55E] transition-colors">Create New</Link>
              <span className="opacity-40">|</span>
              <span className="text-[#22C55E]">Log In</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: VIVID GREEN FORM PANEL ───────────────────────────────── */}
        <div className="relative bg-[#3BE06B] p-8 sm:p-12 flex flex-col justify-center overflow-hidden">
          {/* soft blob accents */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/15 blur-2xl pointer-events-none" />

          <div className="relative w-full max-w-sm mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">welcome</h2>
            <p className="mt-1 text-sm text-white/80">Login to your account to continue</p>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-black/15 border border-black/20 text-xs font-medium text-black/80">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-7 space-y-4">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email Address"
                  className="w-full h-12 rounded-lg pl-11 pr-4 bg-white text-sm text-black placeholder:text-black/40 outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full h-12 rounded-lg pl-11 pr-11 bg-white text-sm text-black placeholder:text-black/40 outline-none focus:ring-2 focus:ring-black/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <span className={`w-4 h-4 rounded-full grid place-items-center border ${rememberMe ? 'bg-black border-black' : 'border-black/40 bg-white'}`}>
                  {rememberMe && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <span className="text-xs font-medium text-black/70">Remember me</span>
              </label>

              {/* Sign in */}
              <button
                type="submit"
                disabled={busy}
                className="w-full h-12 rounded-lg bg-black text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-black/85 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {busy ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
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

            <p className="mt-5 text-xs text-white/80 text-center">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-black hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}