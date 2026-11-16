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

  const socialButton = (label, icon) => (
    <button
      type="button"
      className="flex-1 h-10 rounded-xl border border-emerald-100 bg-white flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
    >
      <span className="w-4 h-4">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F4] text-ink font-sans antialiased relative overflow-hidden">
      {/* decorative blobs like reference */}
      <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-emerald-100/60 blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-100/50 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full bg-emerald-50/70 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-amber-50/60 blur-[80px] pointer-events-none" />

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

            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-1">Login</h2>
            <p className="text-sm text-ink-muted mb-7">Welcome back. Sign in to your account.</p>

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
              {socialButton('Google', <span className="text-red-500">G</span>)}
              {socialButton('Facebook', <span className="text-blue-600">f</span>)}
              {socialButton('Apple', <span className="text-ink"></span>)}
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