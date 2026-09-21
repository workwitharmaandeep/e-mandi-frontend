'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Scale, User } from 'lucide-react';

export default function BookSlot() {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [stateConfig, setStateConfig] = useState<any>(null);
  const [farmerState, setFarmerState] = useState('');

  const [cropType, setCropType] = useState('');
  const [cropVariety, setCropVariety] = useState('');
  const [estimatedQuantity, setEstimatedQuantity] = useState('');
  const [vehicleType, setVehicleType] = useState('Tractor Trolley');

  const [mandis, setMandis] = useState<any[]>([]);
  const [selectedMandi, setSelectedMandi] = useState<any>(null);

  const [arhtiyas, setArhtiyas] = useState<any[]>([]);
  const [selectedArhtiya, setSelectedArhtiya] = useState('');

  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { router.push('/'); return; }
    const user = JSON.parse(userStr);
    if (!user.state) { router.push('/profile'); return; }
    setFarmerState(user.state);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config/state-config/${user.state}`)
      .then(res => res.json())
      .then(data => { setStateConfig(data); if (data.crops.length > 0) setCropType(data.crops[0]); })
      .catch(console.error);
  }, [router]);

  const goToMandiSelection = async () => {
    if (!estimatedQuantity) { setError('Please enter estimated quantity'); return; }
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mandi?date=${date}&state=${farmerState}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch mandis');
      setMandis(await res.json());
      setStep(2);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const goToArhtiyaSelection = (mandi: any) => {
    setSelectedMandi(mandi);
    setError('');
    if (stateConfig?.isArhtiyaRequired) {
      const token = localStorage.getItem('token');
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/arhtiya/list?state=${farmerState}&district=${mandi.district}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setArhtiyas(data); setStep(3); })
        .catch(console.error);
    } else {
      handleBook(mandi.id, '');
    }
  };

  const handleBook = async (mandiId: string, arhtiyaId: string) => {
    setBooking(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gatepass/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ mandiId, date, cropType, cropVariety, estimatedQuantity, vehicleType, arhtiyaId: arhtiyaId || undefined })
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Booking failed'); }
      router.push('/dashboard');
    } catch (err: any) { setError(err.message); setBooking(false); }
  };

  const totalSteps = stateConfig?.isArhtiyaRequired ? 3 : 2;

  if (!stateConfig) return <div className="container"><p>Loading state configuration…</p></div>;

  return (
    <div className="container">
      <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <h1 className="title">Book Procurement Slot</h1>
      <p className="subtitle">{stateConfig.description}</p>

      {/* Civic Step Indicator */}
      <div className="steps">
        <div className={`step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>1. Crop Details</div>
        <div className={`step ${step >= 2 ? (step > 2 ? 'done' : 'active') : ''}`}>2. Select Mandi</div>
        {stateConfig.isArhtiyaRequired && (
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Select Arhtiya</div>
        )}
      </div>

      {error && <div className="info-banner error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* ── Step 1: Crop Details ── */}
      {step === 1 && (
        <div className="card" style={{ maxWidth: '640px' }}>
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label>Procurement Date</label>
              <input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Crop Type</label>
                <select value={cropType} onChange={e => setCropType(e.target.value)}>
                  {stateConfig.crops.map((crop: string) => <option key={crop} value={crop}>{crop}</option>)}
                </select>
              </div>
              <div>
                <label>Crop Variety (Optional)</label>
                <input type="text" placeholder="e.g. Sharbati, HD-2967" value={cropVariety} onChange={e => setCropVariety(e.target.value)} />
              </div>
            </div>

            {stateConfig.mspRates[cropType] > 0 && (
              <div className="info-banner success">
                MSP for <strong>{cropType}</strong> (2026-27): <strong>₹{stateConfig.mspRates[cropType].toLocaleString()}/quintal</strong>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Estimated Quantity (Quintals)</label>
                <input type="number" min="1" placeholder="e.g. 50" value={estimatedQuantity} onChange={e => setEstimatedQuantity(e.target.value)} required />
              </div>
              <div>
                <label>Vehicle Type</label>
                <select value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
                  <option value="Tractor Trolley">Tractor Trolley</option>
                  <option value="Mini Truck">Mini Truck</option>
                  <option value="Pickup">Pickup</option>
                </select>
              </div>
            </div>

            <button onClick={goToMandiSelection} disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Searching available mandis…' : 'Proceed to Mandi Selection →'}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Mandi Selection ── */}
      {step === 2 && (
        <div>
          <button onClick={() => setStep(1)} className="btn-secondary" style={{ marginBottom: '1.5rem' }}>
            ← Back to Crop Details
          </button>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {mandis.map(mandi => (
              <div key={mandi.id} className="card" style={{ opacity: mandi.isFull ? 0.5 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{mandi.name}</h3>
                  <span className={`badge badge-${mandi.congestionLevel === 'RED' ? 'error' : mandi.congestionLevel === 'AMBER' ? 'warning' : 'success'}`}>
                    {mandi.congestionLevel === 'RED' ? 'HIGH LOAD' : mandi.congestionLevel === 'AMBER' ? 'MODERATE' : 'AVAILABLE'}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1rem', display: 'grid', gap: '0.375rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><MapPin size={14} /> {mandi.location}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Scale size={14} /> Capacity: {mandi.bookedCount.toLocaleString()} / {mandi.capacity.toLocaleString()} qtl</div>
                </div>
                <button onClick={() => goToArhtiyaSelection(mandi)} disabled={mandi.isFull || booking} style={{ width: '100%' }}>
                  {mandi.isFull ? 'Capacity Reached' : booking ? 'Processing…' : stateConfig.isArhtiyaRequired ? 'Select Mandi →' : 'Confirm Booking'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 3: Arhtiya Selection ── */}
      {step === 3 && stateConfig.isArhtiyaRequired && selectedMandi && (
        <div>
          <button onClick={() => { setStep(2); setSelectedArhtiya(''); }} className="btn-secondary" style={{ marginBottom: '1.5rem' }}>
            ← Back to Mandi Selection
          </button>

          <div className="info-banner" style={{ marginBottom: '1.5rem' }}>
            Selected: <strong>{selectedMandi.name}</strong> — {selectedMandi.location}
          </div>

          <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>SELECT COMMISSION AGENT</h3>
          </div>

          {arhtiyas.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
              No registered Arhtiyas found at this Mandi. Contact your local APMC.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {arhtiyas.map((a: any) => (
                <div
                  key={a.id}
                  className="card"
                  onClick={() => setSelectedArhtiya(a.id)}
                  style={{
                    cursor: 'pointer',
                    borderColor: selectedArhtiya === a.id ? 'var(--primary)' : 'var(--border)',
                    borderWidth: selectedArhtiya === a.id ? '2px' : '1px',
                    borderStyle: 'solid',
                    borderLeftWidth: selectedArhtiya === a.id ? '4px' : '1px',
                    borderLeftColor: selectedArhtiya === a.id ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '2px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                      {a.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{a.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>License: {a.licenseNumber}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{a.apmcMarket} · ☎ {a.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => handleBook(selectedMandi.id, selectedArhtiya)}
            disabled={!selectedArhtiya || booking}
            style={{ marginTop: '1.5rem', width: '100%' }}
          >
            {booking ? 'Processing booking…' : 'Confirm Booking →'}
          </button>
        </div>
      )}
    </div>
  );
}
