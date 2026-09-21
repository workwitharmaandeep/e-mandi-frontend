'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret })
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Invalid credentials'); }
      const data = await res.json();
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      router.push('/admin/dashboard');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ maxWidth: '480px', marginTop: '4rem' }}>

      <h1 className="title">Mandi Administration</h1>
      <p className="subtitle">
        Monitor mandi congestion across all centres, process farmer arrivals, conduct quality tests,
        weigh crops, and manage the end-to-end procurement pipeline.
      </p>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>Official Login</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
            Authorised personnel only
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Administrative Secret</label>
            <input
              type="password"
              placeholder="Enter authorisation code"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          </div>
          {error && <div className="info-banner error" style={{ marginBottom: '1rem' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Authenticating…' : 'Authenticate & Login'}
          </button>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>New Mandi Head? </span>
            <a href="/signup/mandi" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
              Register Here
            </a>
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: '1rem 1.5rem' }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
          Other Portals
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a href="/" style={{ fontSize: '0.9375rem' }}>Farmer Portal →</a>
          <a href="/arhtiya" style={{ fontSize: '0.9375rem' }}>Commission Agent Portal →</a>
        </div>
      </div>
    </div>
  );
}
