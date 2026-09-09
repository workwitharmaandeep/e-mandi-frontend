'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ArhtiyaProfile() {
  const [formData, setFormData] = useState({
    name: '', phone: '', state: '', district: '',
    licenseNumber: '', apmcMarket: '', bankAccount: '', ifsc: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('arhtiya_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setFormData({
        name: user.name || '', phone: user.phone || '',
        state: user.state || '', district: user.district || '',
        licenseNumber: user.licenseNumber || '', apmcMarket: user.apmcMarket || '',
        bankAccount: user.bankAccount || '', ifsc: user.ifsc || ''
      });
    } else { router.push('/arhtiya'); }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('arhtiya_token');
      const res = await fetch('http://localhost:4000/api/arhtiya/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updatedUser = await res.json();
      localStorage.setItem('arhtiya_user', JSON.stringify(updatedUser));
      router.push('/arhtiya/dashboard');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ maxWidth: '640px' }}>
      <h1 className="title">Commission Agent Profile</h1>
      <p className="subtitle">Complete your profile to receive farmer bookings. All details are verified against your APMC license.</p>

      <form onSubmit={handleSave} className="card">
        {error && <div className="info-banner error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

        {/* Personal */}
        <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>PERSONAL DETAILS</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div><label>Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required /></div>
          <div><label>Phone Number</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} required /></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label>State</label>
            <select name="state" value={formData.state} onChange={handleChange} required>
              <option value="">— Select —</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
            </select>
          </div>
          <div><label>District</label><input type="text" name="district" value={formData.district} onChange={handleChange} required /></div>
        </div>

        {/* APMC License */}
        <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>APMC LICENSE</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div><label>License Number</label><input type="text" name="licenseNumber" placeholder="HR-APMC-2024-001" value={formData.licenseNumber} onChange={handleChange} required /></div>
          <div><label>APMC Market</label><input type="text" name="apmcMarket" placeholder="Karnal Grain Market" value={formData.apmcMarket} onChange={handleChange} required /></div>
        </div>

        {/* Bank */}
        <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>BANK DETAILS (COMMISSION PAYOUT)</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div><label>Bank Account</label><input type="password" name="bankAccount" value={formData.bankAccount} onChange={handleChange} required /></div>
          <div><label>IFSC Code</label><input type="text" name="ifsc" value={formData.ifsc} onChange={handleChange} required /></div>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
