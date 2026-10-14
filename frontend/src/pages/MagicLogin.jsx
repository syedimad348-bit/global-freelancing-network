import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';

export default function MagicLogin() {
  const navigate = useNavigate();
  const [status, setStatus] = useState({ kind: 'loading', message: 'Signing you in…' });

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setStatus({ kind: 'error', message: 'Missing token. Please request a new login link.' });
      return;
    }
    fetch(`${API_BASE_URL}/api/auth/magic-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Magic login failed');
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setStatus({ kind: 'success', message: 'Success. Redirecting…' });
        setTimeout(() => navigate('/dashboard'), 400);
      })
      .catch((e) => {
        setStatus({ kind: 'error', message: e.message || 'Magic login failed. Please try again.' });
      });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center">
        <div className="flex justify-center mb-4"><Logo size="md" /></div>
        <h1 className="text-2xl font-black text-ink tracking-tight">Magic link</h1>
        <p className="mt-2 text-sm text-ink-muted">{status.message}</p>
        <div className="mt-6 flex justify-center">
          {status.kind === 'loading' ? (
            <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
          ) : (
            <Button variant="secondary" onClick={() => navigate('/login')}>Back to login</Button>
          )}
        </div>
      </div>
    </div>
  );
}
