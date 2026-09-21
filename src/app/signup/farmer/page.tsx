'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function FarmerSignup() {
  const [formData, setFormData] = useState({
    aadhaar: '',
    name: '',
    phone: '',
    state: '',
    district: '',
    village: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/auth/signup/farmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sign up');
      
      setSuccess('Signup successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '2rem' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--civic-navy-light)', border: '1px solid #CBD5E1', padding: '0.25rem 0.65rem', borderRadius: '2px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--civic-navy)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
        <ShieldCheck size={14} /> National Agricultural Mandi Service
      </div>
      <h1 className="title" style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Farmer Registration</h1>
      <p className="subtitle" style={{ fontSize: '0.95rem', marginBottom: '2rem' }}>
        Register your Aadhaar to access procurement slots and MSP payments.
      </p>

      <div className="card" style={{ borderTop: '4px solid var(--civic-navy)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Aadhaar Number (12 Digits) *</label>
            <input name="aadhaar" value={formData.aadhaar} onChange={handleChange} required maxLength={12} placeholder="e.g. 123456789012" />
          </div>
          <div>
            <label>Full Name *</label>
            <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Ramesh Singh" />
          </div>
          <div>
            <label>Phone Number *</label>
            <input name="phone" value={formData.phone} onChange={handleChange} required maxLength={10} placeholder="e.g. 9876543210" />
          </div>
          <div>
            <label>State *</label>
            <input name="state" value={formData.state} onChange={handleChange} required placeholder="e.g. Haryana" />
          </div>
          <div>
            <label>District *</label>
            <input name="district" value={formData.district} onChange={handleChange} required placeholder="e.g. Karnal" />
          </div>
          <div>
            <label>Village *</label>
            <input name="village" value={formData.village} onChange={handleChange} required placeholder="e.g. Nilokheri" />
          </div>

          {error && <div className="info-banner error">{error}</div>}
          {success && <div className="info-banner success">{success}</div>}

          <button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <Link href="/" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--civic-navy)' }}>
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
