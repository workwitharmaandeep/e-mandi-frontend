'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ArhtiyaLogin() {
  const [pan, setPan] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PAN' | 'OTP'>('PAN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const requestOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/arhtiya/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pan })
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to send OTP'); }
      setStep('OTP');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/arhtiya/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pan, otp })
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Invalid OTP'); }
      const data = await res.json();
      localStorage.setItem('arhtiya_token', data.token);
      localStorage.setItem('arhtiya_user', JSON.stringify(data.user));
      if (!data.user.name || !data.user.licenseNumber) {
        router.push('/arhtiya/profile');
      } else {
        router.push('/arhtiya/dashboard');
      }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ maxWidth: '480px', marginTop: '4rem' }}>

      <h1 className="title">Commission Agent Services</h1>
      <p className="subtitle">
        View and manage farmer procurement bookings assigned to you, accept or reject
        incoming requests, and track your commission earnings transparently.
      </p>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>Arhtiya / Commission Agent Login</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
            Authenticate using your PAN-linked OTP
          </p>
        </div>

        {step === 'PAN' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label>PAN Number</label>
              <input
                type="text"
                placeholder="ABCPK1234R"
                maxLength={10}
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase', letterSpacing: '3px', fontFamily: 'monospace' }}
              />
            </div>
            {error && <div className="info-banner error">{error}</div>}
            <button onClick={requestOtp} disabled={pan.length !== 10 || loading} style={{ width: '100%' }}>
              {loading ? 'Sending OTP…' : 'Request OTP'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="info-banner">
              OTP sent to PAN-linked mobile for <strong>{pan}</strong>. For demo, use: <strong>123456</strong>
            </div>
            <div>
              <label>One-Time Password</label>
              <input
                type="text"
                placeholder="● ● ● ● ● ●"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ letterSpacing: '6px', textAlign: 'center', fontSize: '1.25rem', fontFamily: 'monospace' }}
              />
            </div>
            {error && <div className="info-banner error">{error}</div>}
            <button onClick={verifyOtp} disabled={otp.length !== 6 || loading} style={{ width: '100%' }}>
              {loading ? 'Verifying…' : 'Verify & Login'}
            </button>
            <button onClick={() => setStep('PAN')} className="btn-secondary" style={{ width: '100%' }}>
              ← Change PAN Number
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '1rem 1.5rem' }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
          Other Portals
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a href="/" style={{ fontSize: '0.9375rem' }}>
            Farmer Portal (Aadhaar Login) →
          </a>
          <a href="/admin" style={{ fontSize: '0.9375rem', color: 'var(--muted-foreground)' }}>
            Mandi Administration Portal →
          </a>
        </div>
      </div>
    </div>
  );
}
