import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Flame, ArrowRight } from 'lucide-react';
import { apiFetch, DEMO_CREDENTIALS } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="h-dvh bg-gradient-to-b from-[#052E22] via-[#064E3B] to-[#052E22] text-ink font-sans antialiased relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-400/15 blur-[150px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-amber-300/10 blur-[150px]" />
        <div className="absolute -bottom-40 left-1/3 w-[350px] h-[350px] rounded-full bg-emerald-300/10 blur-[120px]" />
        <div className="absolute bottom-20 right-20 w-[300px] h-[300px] rounded-full bg-amber-200/10 blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[200px]" />
      </div>

      {/* Single centered login card */}
      <div className="relative z-10 w-full max-w-md max-h-full origin-center will-change-transform [@media(max-height:840px)]:scale-[0.95] [@media(max-height:720px)]:scale-[0.88] [@media(max-height:600px)]:scale-[0.8] [@media(max-height:520px)]:scale-[0.7]">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_25px_50px_-12px_rgba(5,46,34,0.4)]">
            <div className="p-6 sm:p-8 lg:p-10">

              {/* Logo & Brand */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-amber-500 flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(16,185,129,0.4)]">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-base font-black text-ink leading-tight tracking-tight">Global Freelancing</p>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-ink-muted font-semibold">Network</p>
                </div>
              </div>

              {/* Headline */}
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight mb-1.5">Welcome back</h2>
                <p className="text-sm text-ink-muted leading-relaxed">Sign in to access your dashboard and continue your journey</p>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm font-medium text-rose-800 flex items-start gap-3"
                  role="alert"
                >
                  <svg className="w-5 h-5 mt-0.5 shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 001.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Login form */}
              <form onSubmit={handleLogin} className="space-y-4 mb-7">
                {/* Email field */}
                <div>
                  <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle block mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/70" aria-hidden="true" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="h-12 pl-11 pr-4 bg-white border border-line rounded-xl w-full text-sm text-ink placeholder:text-ink-subtle transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white hover:border-emerald-200"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/70" aria-hidden="true" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="h-12 pl-11 pr-11 bg-white border border-line rounded-xl w-full text-sm text-ink placeholder:text-ink-subtle transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white hover:border-emerald-200"
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

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white text-sm font-extrabold uppercase tracking-[0.15em] shadow-[0_8px_24px_-4px_rgba(16,185,129,0.4)] hover:brightness-105 hover:shadow-[0_12px_32px_-6px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  {busy ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-line"></div>
                </div>
                <div className="relative flex justify-center text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                  <span className="bg-white/95 px-4 relative z-10 backdrop-blur-sm">Continue with</span>
                </div>
              </div>

              {/* Social login buttons */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  type="button"
                  className="w-full h-12 rounded-xl bg-white text-ink border border-line flex items-center justify-center gap-2.5 shadow-sm hover:bg-surface-subtle hover:border-emerald-200 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none group"
                  disabled={busy}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:scale-105 transition-transform duration-200">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-xs font-bold">Google</span>
                </button>
                <button
                  type="button"
                  className="w-full h-12 rounded-xl bg-white text-ink border border-line flex items-center justify-center gap-2.5 shadow-sm hover:bg-surface-subtle hover:border-emerald-200 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none group"
                  disabled={busy}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:scale-105 transition-transform duration-200" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-xs font-bold">Facebook</span>
                </button>
                <button
                  type="button"
                  className="w-full h-12 rounded-xl bg-white text-ink border border-line flex items-center justify-center gap-2.5 shadow-sm hover:bg-surface-subtle hover:border-emerald-200 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none group"
                  disabled={busy}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:scale-105 transition-transform duration-200" fill="#000000">
                    <path d="M19.119 15.286c.597.228 1.14.497 1.623.807 1.371-.85 2.438-2.027 3.267-3.569a8.87 8.87 0 0 0-.516-2.764c-.114-.164-.225-.33-.34-.5H12.003v-3.963h3.271l.327-3.16H12.003V2.63c0-.805.023-1.641.048-2.448 1.71-.577 3.604-.584 4.938.072 1.485.727 2.668 2.02 3.527 3.736-.757 2.045-2.04 3.875-3.805 5.274-.002.003-.003.006-.005.009-.52.502-1.13.925-1.801 1.268.65-.156 1.26-.351 1.83-.581-.212.66-.477 1.3-.788 1.923zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.206 19.543c-.95 0-1.84-.223-2.63-.653-.248-.13-.52-.234-.816-.313.118.413.244.807.376 1.182.525 1.491 1.406 2.627 3.392-.736.36-1.58.49-2.42.49-.887 0-1.723-.18-2.494-.512z" />
                  </svg>
                  <span className="text-xs font-bold">Apple</span>
                </button>
              </div>

              {/* Register link */}
              <p className="text-center text-sm text-ink-muted mb-6">
                Don't have an account?{' '}
                <Link to="/register" className="font-extrabold text-emerald-600 hover:text-emerald-700 underline-offset-2 hover:underline transition-colors">
                  Create one
                </Link>
              </p>

              {/* Demo sign in */}
              <p className="text-center mb-3 text-[11px] text-ink-muted uppercase tracking-wider font-semibold">
                Or continue with demo
              </p>
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={busy}
                className="w-full h-12 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-[0_4px_16px_-4px_rgba(16,185,129,0.3)] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Flame className="w-4 h-4" />
                Demo Sign In
              </button>

            </div>
          </div>

          {/* Footer note */}
          <p className="mt-4 text-center text-[11px] text-white/50 font-medium [@media(max-height:760px)]:hidden">
            By signing in, you agree to our <Link to="/terms" className="underline hover:text-white">Terms</Link> & <Link to="/privacy" className="underline hover:text-white">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}