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
    <div className="min-h-screen bg-[#FAF9F4] flex items-center justify-center p-4 sm:p-6 font-sans antialiased">
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden bg-gradient-to-br from-[#052E22] to-[#064E3B] border border-emerald-500/30 shadow-2xl p-8 sm:p-10">
        {/* decorative glows */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-full bg-amber-500/15 flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Global Freelancing</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Network</p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">welcome</h1>
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
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <span className={`w-4 h-4 rounded-sm grid place-items-center border-2 transition-colors ${rememberMe ? 'bg-amber-500 border-amber-500' : 'border-amber-300 bg-transparent'}`}>
                {rememberMe && <span className="w-2 h-2 rounded-[2px] bg-white" />}
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only opacity-0"
                />
              </span>
              <span className="text-sm font-medium text-white/70">Remember me</span>
            </label>

            {/* Sign in */}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold uppercase tracking-[0.15em] shadow-lg hover:brightness-105 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
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

          {/* Footer links */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors"
            >
              Use demo account
            </button>
            <p className="text-sm text-white/60 text-center">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-amber-300 hover:underline transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}