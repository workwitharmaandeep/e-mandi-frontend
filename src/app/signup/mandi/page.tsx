'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MandiSignup() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    secret: ''
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
      const res = await fetch('http://localhost:4000/api/auth/signup/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sign up');
      
      setSuccess('Signup successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '2rem' }}>
      <h1 className="title" style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Mandi Head Registration</h1>
      <p className="subtitle" style={{ fontSize: '0.95rem', marginBottom: '2rem' }}>
        Register your official License Number to access the Mandi Administration portal.
      </p>

      <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Full Name *</label>
            <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Ram Kumar" />
          </div>
          <div>
            <label>Phone Number *</label>
            <input name="phone" value={formData.phone} onChange={handleChange} required maxLength={10} placeholder="e.g. 9999999999" />
          </div>
          <div>
            <label>Mandi License Number *</label>
            <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required placeholder="e.g. MANDI-ADMIN-001" />
          </div>
          <div>
            <label>Authorisation Secret *</label>
            <input name="secret" type="password" value={formData.secret} onChange={handleChange} required placeholder="Enter administrative secret" />
            <span className="field-hint">Required to verify administrative privileges (use admin123 for demo)</span>
          </div>

          {error && <div className="info-banner error">{error}</div>}
          {success && <div className="info-banner success">{success}</div>}

          <button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <Link href="/admin" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
