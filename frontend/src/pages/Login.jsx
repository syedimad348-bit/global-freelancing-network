import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Flame } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-[#052E22] to-[#064E3B] text-ink font-sans antialiased relative overflow-hidden">
      {/* decorative blobs like reference */}
      <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-emerald-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-300/15 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full bg-emerald-300/15 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-amber-200/10 blur-[80px] pointer-events-none" />

      {/* single login card */}
      <div className="relative z-10 mx-auto w-full max-w-md p-4 sm:p-6">
        <div className="relative rounded-3xl overflow-hidden bg-white border border-emerald-100 shadow-xl">
          <div className="p-8 sm:p-10 lg:p-12">

            {/* logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-amber-500 flex items-center justify-center shadow-lg">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-ink leading-tight">Global Freelancing</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">Network</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-ink tracking-tight mb-1">Login</h2>
            <p className="text-sm text-center text-ink-muted mb-7">Welcome back. Sign in to your account.</p>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200/50 text-xs font-medium text-rose-800">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5 mb-8">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full h-12 rounded-xl pl-11 pr-4 bg-white border border-line text-sm text-ink placeholder:text-ink-subtle transition-all duration-150 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
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
                <p className="text-[11px] mt-1.5 text-right font-medium text-emerald-600 cursor-pointer hover:underline">Forgot Password?</p>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold uppercase tracking-[0.15em] shadow-lg hover:brightness-105 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {busy ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <>
                    Sign In
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* continue with */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-line"></span>
              </div>
              <div className="relative flex justify-center text-xs font-semibold text-ink-soft uppercase tracking-wider">
                <span className="bg-white px-3 relative z-10">Continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-8">
              <button
                type="button"
                className="w-full rounded-xl h-11 bg-white text-ink border border-line flex items-center justify-center gap-2 shadow-sm hover:bg-[#F5F5F0] transition-colors disabled:opacity-50"
                disabled={busy}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-xs font-semibold">Google</span>
              </button>
              <button
                type="button"
                className="w-full rounded-xl h-11 bg-white text-ink border border-line flex items-center justify-center gap-2 shadow-sm hover:bg-[#F5F5F0] transition-colors disabled:opacity-50"
                disabled={busy}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-xs font-semibold">Facebook</span>
              </button>
              <button
                type="button"
                className="w-full rounded-xl h-11 bg-white text-ink border border-line flex items-center justify-center gap-2 shadow-sm hover:bg-[#F5F5F0] transition-colors disabled:opacity-50"
                disabled={busy}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000000">
                  <path fill="#000000" d="M19.119 15.286c.597.228 1.14.497 1.623.807 1.371-.85 2.438-2.027 3.267-3.569a8.87 8.87 0 0 0-.516-2.764c-.114-.164-.225-.33-.34-.5H12.003v-3.963h3.271l.327-3.16H12.003V2.63c0-.805.023-1.641.048-2.448 1.71-.577 3.604-.584 4.938.072 1.485.727 2.668 2.02 3.527 3.736-.757 2.045-2.04 3.875-3.805 5.274-.002.003-.003.006-.005.009-.52.502-1.13.925-1.801 1.268.65-.156 1.26-.351 1.83-.581-.212.66-.477 1.3-.788 1.923zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.206 19.543c-.95 0-1.84-.223-2.63-.653-.248-.13-.52-.234-.816-.313.118.413.244.807.376 1.182.525 1.491 1.406 2.627 2.643 3.392-.736.36-1.58.49-2.42.49-.887 0-1.723-.18-2.494-.512z" />
                </svg>
                <span className="text-xs font-semibold">Apple</span>
              </button>
            </div>

            <p className="text-center text-sm text-ink-soft">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-emerald-600 hover:underline transition-colors">
                Create one
              </Link>
            </p>

            <p className="text-center mt-5 text-[10px] text-ink-muted uppercase tracking-wider">
              or continue with demo
            </p>
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full rounded-xl h-11 border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 py-2 hover:bg-emerald-100 transition-colors disabled:opacity-50"
              disabled={busy}
            >
              Demo Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}