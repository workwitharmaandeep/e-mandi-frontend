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
    <div className="container" style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'flex-start' }}>
        
        {/* Left: Civic Service Information */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--civic-navy-light)', border: '1px solid #CBD5E1', padding: '0.25rem 0.65rem', borderRadius: '2px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--civic-navy)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
            <ShieldCheck size={14} /> National Agricultural Mandi Service
          </div>
          <h1 className="title" style={{ fontSize: '2.1rem', marginBottom: '0.75rem' }}>
            Agricultural Produce Procurement &amp; Slot Management
          </h1>
          <p className="subtitle" style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            Secure your mandi arrival slot, avoid vehicular congestion with digital QR gate passes, and receive government-backed Minimum Support Price (MSP) payments directly into your Aadhaar-linked bank account via DBT.
          </p>

          {/* Civic Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--civic-navy)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--civic-navy)', fontFamily: 'var(--font-mono)' }}>100% MSP</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Government Benchmark</div>
            </div>
            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--civic-green)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--civic-green)', fontFamily: 'var(--font-mono)' }}>Direct DBT</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Direct Bank Transfer</div>
            </div>
          </div>

          {/* Workflow Steps */}
          <div style={{ borderTop: '2px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--civic-navy)', marginBottom: '1rem' }}>
              Standard Procurement Protocol
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ width: '24px', height: '24px', background: 'var(--civic-navy)', color: '#FFF', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>1</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Aadhaar Authentication &amp; Profile Setup</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--foreground-secondary)' }}>Login with Aadhaar to sync your state and DBT bank account details.</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ width: '24px', height: '24px', background: 'var(--civic-navy)', color: '#FFF', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>2</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Select Mandi &amp; Book Procurement Slot</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--foreground-secondary)' }}>Choose your date and mandi based on live congestion indicators. Select licensed Arhtiya where applicable (Punjab &amp; Haryana).</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ width: '24px', height: '24px', background: 'var(--civic-navy)', color: '#FFF', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>3</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>QR Token Gate Entry &amp; Transparent Settlement</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--foreground-secondary)' }}>Present digital QR gate pass at the weighbridge. Payment released directly via PFMS.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Civic Farmer Login Card */}
        <div style={{ maxWidth: '440px', width: '100%' }}>
          <div className="card" style={{ borderTop: '4px solid var(--civic-navy)' }}>
            <div className="card-header">
              <div>
                <h2 className="card-title">Farmer Login</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>
                  Aadhaar-based e-KYC One-Time Password
                </p>
              </div>
              <span className="badge badge-primary">UIDAI VERIFIED</span>
            </div>

            {!otpSent ? (
              <form onSubmit={handleRequestOtp}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="aadhaar">Aadhaar Number (12 Digits)</label>
                  <input
                    id="aadhaar"
                    type="text"
                    placeholder="xxxx xxxx xxxx"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    style={{ letterSpacing: '2px', fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 600 }}
                    required
                  />
                  <span className="field-hint">Enter the 12-digit number printed on your Aadhaar card</span>
                </div>

                {error && <div className="info-banner error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

                <button type="submit" disabled={loading} style={{ width: '100%' }}>
                  {loading ? 'Requesting OTP from UIDAI…' : 'Generate OTP →'}
                </button>

                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--foreground-secondary)' }}>New Farmer? </span>
                  <Link href="/signup/farmer" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--civic-navy)' }}>
                    Sign Up Here
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="info-banner success" style={{ marginBottom: '1.25rem' }}>
                  OTP generated for Aadhaar ending in <strong>{aadhaar.slice(-4)}</strong>.
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="otp">One-Time Password (OTP)</label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="● ● ● ● ● ●"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.35rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                    required
                  />
                  <span className="field-hint">Enter the 6-digit code received on mobile</span>
                </div>

                {error && <div className="info-banner error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

                <button type="submit" disabled={loading} style={{ width: '100%' }}>
                  {loading ? 'Verifying Credentials…' : 'Verify & Enter Portal →'}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="btn-secondary"
                  style={{ width: '100%', marginTop: '0.75rem' }}
                >
                  ← Change Aadhaar Number
                </button>
              </form>
            )}
          </div>

          {/* Other Portals Card */}
          <div className="card" style={{ marginTop: '1.25rem', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--foreground-muted)', marginBottom: '0.75rem' }}>
              Institutional Portals
            </div>
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              <Link href="/arhtiya" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: 'var(--civic-navy)', padding: '0.5rem', background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '2px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                  <UserCheck size={16} /> Commission Agent (Arhtiya) Portal
                </span>
                <ArrowRight size={14} />
              </Link>
              <Link href="/admin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: 'var(--civic-navy)', padding: '0.5rem', background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '2px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                  <Building2 size={16} /> APMC Mandi Administration Portal
                </span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
