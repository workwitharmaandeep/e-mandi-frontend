'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Scale, Cpu, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mandis, setMandis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [scanMode, setScanMode] = useState<'NONE' | 'ARRIVE' | 'QUALITY' | 'WEIGH' | 'UPDATE'>('NONE');
  const [qrToken, setQrToken] = useState('');
  const [gatePassId, setGatePassId] = useState('');
  const [moisture, setMoisture] = useState('');
  const [actualQuantity, setActualQuantity] = useState('');
  const [mspRate, setMspRate] = useState('2585');
  const [updateStatus, setUpdateStatus] = useState('LIFTED');
  const [opMsg, setOpMsg] = useState({ type: '', text: '' });
  const [fetchingIot, setFetchingIot] = useState(false);
  const [iotTelemetry, setIotTelemetry] = useState<any>(null);

  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  const fetchFromWeighbridge = async () => {
    setFetchingIot(true);
    try {
      const res = await fetch(`http://localhost:4000/api/mandi/simulate-weighbridge?estimatedQuantity=${actualQuantity || 50}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActualQuantity(data.actualQuantity.toString());
        setIotTelemetry(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingIot(false);
    }
  };

  useEffect(() => {
    if (!token) { router.push('/admin'); return; }
    fetchMandis();
  }, [date, token]);

  const fetchMandis = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/mandi?date=${date}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setMandis(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin');
  };

  const handleScanArrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpMsg({ type: '', text: '' });
    try {
      const res = await fetch('http://localhost:4000/api/gatepass/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ qrCodeToken: qrToken })
      });
      const data = await res.json();
      if (res.ok) setOpMsg({ type: 'success', text: 'Farmer marked as ARRIVED successfully.' });
      else throw new Error(data.error || 'Invalid QR Code');
    } catch (err: any) { setOpMsg({ type: 'error', text: err.message }); }
  };

  const handleQualityTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpMsg({ type: '', text: '' });
    try {
      const res = await fetch('http://localhost:4000/api/gatepass/quality-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ gatePassId, moisture })
      });
      const data = await res.json();
      if (res.ok) setOpMsg({ type: 'success', text: `Quality Test recorded: ${data.result}` });
      else throw new Error(data.error || 'Failed to record test');
    } catch (err: any) { setOpMsg({ type: 'error', text: err.message }); }
  };

  const handleWeighCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpMsg({ type: '', text: '' });
    try {
      const res = await fetch('http://localhost:4000/api/gatepass/weigh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ gatePassId, actualQuantity, mspRate })
      });
      const data = await res.json();
      if (res.ok) setOpMsg({ type: 'success', text: `Weighed & Ledger Generated. Net to farmer: ₹${data.ledger?.netToFarmer?.toLocaleString()}` });
      else throw new Error(data.error || 'Failed to weigh');
    } catch (err: any) { setOpMsg({ type: 'error', text: err.message }); }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpMsg({ type: '', text: '' });
    try {
      const res = await fetch('http://localhost:4000/api/gatepass/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ gatePassId, status: updateStatus })
      });
      const data = await res.json();
      if (res.ok) setOpMsg({ type: 'success', text: `Status updated to ${updateStatus}.` });
      else throw new Error(data.error || 'Failed to update');
    } catch (err: any) { setOpMsg({ type: 'error', text: err.message }); }
  };

  const opTabStyle = (mode: string) => ({
    flex: 1,
    background: scanMode === mode ? 'var(--primary)' : 'transparent',
    color: scanMode === mode ? 'white' : 'var(--muted-foreground)',
    borderRadius: 0,
    borderBottom: scanMode === mode ? '2px solid var(--accent)' : '2px solid transparent',
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    fontWeight: scanMode === mode ? 700 : 500,
  });

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="title" style={{ marginBottom: '0.25rem' }}>Administration Dashboard</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>Procurement operations and mandi monitoring.</p>
        </div>
        <button onClick={handleLogout} className="btn-danger" style={{ fontSize: '0.8125rem' }}>
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

        {/* Left Column: Congestion Map */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mandi Congestion (Quintals)</h2>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: '150px', padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }} />
          </div>

          {loading ? <p>Loading…</p> : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {mandis.map(mandi => (
                <div key={mandi.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{mandi.name}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                      {mandi.bookedCount.toLocaleString()} / {mandi.capacity.toLocaleString()} qtl · {mandi.state}
                    </p>
                  </div>
                  <span className={`badge badge-${mandi.congestionLevel === 'RED' ? 'error' : mandi.congestionLevel === 'AMBER' ? 'warning' : 'success'}`}>
                    {mandi.congestionLevel === 'RED' ? 'HIGH' : mandi.congestionLevel === 'AMBER' ? 'MED' : 'LOW'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Operations */}
        <div>
          <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Procurement Operations</h2>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Operation Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
              <button onClick={() => { setScanMode('ARRIVE'); setOpMsg({type:'', text:''}); }} style={opTabStyle('ARRIVE')}>1. Arrive</button>
              <button onClick={() => { setScanMode('QUALITY'); setOpMsg({type:'', text:''}); }} style={opTabStyle('QUALITY')}>2. Quality</button>
              <button onClick={() => { setScanMode('WEIGH'); setOpMsg({type:'', text:''}); }} style={opTabStyle('WEIGH')}>3. Weigh</button>
              <button onClick={() => { setScanMode('UPDATE'); setOpMsg({type:'', text:''}); }} style={opTabStyle('UPDATE')}>4. Status</button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              {scanMode === 'ARRIVE' && (
                <form onSubmit={handleScanArrive}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>QR Code Token</label>
                    <input type="text" placeholder="Scan or paste gate pass QR token" value={qrToken} onChange={(e) => setQrToken(e.target.value)} required />
                  </div>
                  <button type="submit" style={{ width: '100%' }}>Mark as Arrived</button>
                </form>
              )}

              {scanMode === 'QUALITY' && (
                <form onSubmit={handleQualityTest}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Gate Pass ID</label>
                    <input type="text" value={gatePassId} onChange={(e) => setGatePassId(e.target.value)} required />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Moisture %</label>
                    <input type="number" step="0.1" value={moisture} onChange={(e) => setMoisture(e.target.value)} required />
                  </div>
                  <button type="submit" style={{ width: '100%' }}>Record Quality Test</button>
                </form>
              )}

              {scanMode === 'WEIGH' && (
                <form onSubmit={handleWeighCrop}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Gate Pass ID</label>
                    <input type="text" value={gatePassId} onChange={(e) => setGatePassId(e.target.value)} required />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ margin: 0 }}>Actual Qty (Quintals)</label>
                      <button
                        type="button"
                        onClick={fetchFromWeighbridge}
                        disabled={fetchingIot}
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Cpu size={13} /> {fetchingIot ? 'Reading Loadcell…' : 'Fetch from Digital Weighbridge'}
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 52.40"
                          value={actualQuantity}
                          onChange={(e) => setActualQuantity(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="1"
                          placeholder="MSP Rate"
                          value={mspRate}
                          onChange={(e) => setMspRate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* IoT Telemetry Readout */}
                  {iotTelemetry && (
                    <div className="info-banner success" style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                        <Scale size={13} /> IoT Weighbridge Stream: {iotTelemetry.hardwareModel}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', color: 'var(--civic-green-dark)' }}>
                        <span>Device: {iotTelemetry.device}</span>
                        <span>Protocol: {iotTelemetry.sensorProtocol}</span>
                        <span>Gross: {iotTelemetry.grossWeight} qtl</span>
                        <span>Tare: {iotTelemetry.tareWeight} qtl</span>
                      </div>
                      <div style={{ marginTop: '0.25rem', opacity: 0.8 }}>
                        Status: <strong>{iotTelemetry.status}</strong> · {new Date(iotTelemetry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn-success" style={{ width: '100%' }}>Weigh & Generate Ledger</button>
                </form>
              )}

              {scanMode === 'UPDATE' && (
                <form onSubmit={handleUpdateStatus}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Gate Pass ID</label>
                    <input type="text" value={gatePassId} onChange={(e) => setGatePassId(e.target.value)} required />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>New Status</label>
                    <select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
                      <option value="LIFTED">LIFTED</option>
                      <option value="PAYMENT_PROCESSED">PAYMENT PROCESSED</option>
                    </select>
                  </div>
                  <button type="submit" style={{ width: '100%' }}>Update Status</button>
                </form>
              )}

              {scanMode === 'NONE' && (
                <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: '1rem' }}>
                  Select an operation above to begin.
                </p>
              )}

              {opMsg.text && (
                <div className={`info-banner ${opMsg.type === 'error' ? 'error' : 'success'}`} style={{ marginTop: '1rem' }}>
                  {opMsg.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
