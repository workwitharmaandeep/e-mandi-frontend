'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STATES = [
  'Punjab', 'Haryana', 'Madhya Pradesh', 'Rajasthan',
  'Maharashtra', 'Telangana', 'Uttar Pradesh'
];

export default function Profile() {
  const [formData, setFormData] = useState({
    name: '', phone: '', state: '', district: '', village: '',
    bankAccount: '', ifsc: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setFormData({
        name: user.name || '', phone: user.phone || '',
        state: user.state || '', district: user.district || '',
        village: user.village || '', bankAccount: user.bankAccount || '',
        ifsc: user.ifsc || ''
      });
    } else {
      router.push('/');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updatedUser = await res.json();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      router.push('/dashboard');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ maxWidth: '640px' }}>
      <h1 className="title">Farmer Profile</h1>
      <p className="subtitle">
        Your state determines the procurement workflow. Complete all fields for Direct Benefit Transfer (DBT) eligibility.
      </p>

      <form onSubmit={handleSave} className="card">
        {error && <div className="info-banner error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

        {/* Personal Details */}
        <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>PERSONAL DETAILS</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <label>Phone Number</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>
        </div>

        {/* Location */}
        <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>LOCATION & STATE</h3>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>State</label>
          <select name="state" value={formData.state} onChange={handleChange} required>
            <option value="">— Select your state —</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {formData.state && ['Punjab', 'Haryana'].includes(formData.state) && (
          <div className="info-banner warning" style={{ marginBottom: '1rem' }}>
            <strong>{formData.state}</strong> uses the Arhtiya (Commission Agent) system.
            You must select a registered Arhtiya during slot booking.
          </div>
        )}
        {formData.state && !['Punjab', 'Haryana', ''].includes(formData.state) && (
          <div className="info-banner success" style={{ marginBottom: '1rem' }}>
            <strong>{formData.state}</strong> supports direct sale at MSP. No Arhtiya required.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label>District</label>
            <input type="text" name="district" value={formData.district} onChange={handleChange} required />
          </div>
          <div>
            <label>Village / Tehsil</label>
            <input type="text" name="village" value={formData.village} onChange={handleChange} required />
          </div>
        </div>

        {/* Bank Details */}
        <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>BANK DETAILS (DBT)</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label>Bank Account Number</label>
            <input type="password" name="bankAccount" value={formData.bankAccount} onChange={handleChange} required />
          </div>
          <div>
            <label>IFSC Code</label>
            <input type="text" name="ifsc" value={formData.ifsc} onChange={handleChange} required />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Saving…' : 'Save Profile'}
          </button>
          <Link href="/dashboard" style={{ flex: 1, textDecoration: 'none' }}>
            <button type="button" className="btn-secondary" style={{ width: '100%' }}>Cancel</button>
          </Link>
        </div>
      </form>
    </div>
  );
}
