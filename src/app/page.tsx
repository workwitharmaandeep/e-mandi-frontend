'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, QrCode, Building2, UserCheck, ArrowRight } from 'lucide-react';

export default function Home() {
  const [aadhaar, setAadhaar] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (aadhaar.length !== 12) { setError('Aadhaar number must be exactly 12 digits'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar })
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to request OTP'); }
      setOtpSent(true);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar, otp })
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Invalid OTP'); }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ marginTop: '3rem', maxWidth: '600px' }}>
      
      {/* Centered Civic Service Information */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--civic-navy-light)', padding: '0.25rem 0.65rem', borderRadius: '2px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--civic-navy)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1.25rem' }}>
          <ShieldCheck size={14} /> National Agricultural Mandi Service
        </div>
        <h1 className="title" style={{ fontSize: '2.25rem', marginBottom: '1rem', lineHeight: 1.1 }}>
          Agricultural Produce Procurement &amp; Slot Management
        </h1>
        <p className="subtitle" style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--foreground-secondary)' }}>
          Secure your mandi arrival slot, avoid vehicular congestion, and receive Minimum Support Price (MSP) payments directly into your Aadhaar-linked bank account via DBT.
        </p>
      </div>

      {/* Symmetrical Login Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--civic-navy)' }}>Farmer Login</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', marginTop: '0.25rem' }}>
            Aadhaar-based e-KYC One-Time Password
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleRequestOtp}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="aadhaar" style={{ textAlign: 'left' }}>Aadhaar Number (12 Digits)</label>
              <input
                id="aadhaar"
                type="text"
                placeholder="xxxx xxxx xxxx"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                style={{ letterSpacing: '2px', fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 600, textAlign: 'center' }}
                required
              />
            </div>

            {error && <div className="info-banner error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}>
              {loading ? 'Requesting OTP from UIDAI…' : 'Generate OTP →'}
            </button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--foreground-secondary)' }}>New Farmer? </span>
              <Link href="/signup/farmer" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--civic-navy)' }}>
                Sign Up Here
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="info-banner success" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              OTP generated for Aadhaar ending in <strong>{aadhaar.slice(-4)}</strong>.
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="otp" style={{ textAlign: 'left' }}>One-Time Password (OTP)</label>
              <input
                id="otp"
                type="text"
                placeholder="● ● ● ● ● ●"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.35rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                required
              />
            </div>

            {error && <div className="info-banner error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}>
              {loading ? 'Verifying Credentials…' : 'Verify & Enter Portal →'}
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="btn-secondary"
              style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
            >
              ← Change Aadhaar Number
            </button>
          </form>
        )}
      </div>

      {/* Simplified Institutional Links */}
      <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--foreground-muted)', marginBottom: '1rem' }}>
          Other Institutional Portals
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <Link href="/arhtiya" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--civic-navy)', textDecoration: 'none' }}>
            <UserCheck size={16} /> Commission Agent (Arhtiya)
          </Link>
          <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--civic-navy)', textDecoration: 'none' }}>
            <Building2 size={16} /> APMC Mandi Administration
          </Link>
        </div>
      </div>

    </div>
  );
}
