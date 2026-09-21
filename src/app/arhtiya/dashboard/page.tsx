'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, CheckCircle, XCircle, Clock, Banknote } from 'lucide-react';

export default function ArhtiyaDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'bookings' | 'earnings'>('bookings');
  const [opMsg, setOpMsg] = useState({ type: '', text: '' });
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('arhtiya_token') : null;

  useEffect(() => {
    if (!token) { router.push('/arhtiya'); return; }
    fetchBookings();
    fetchEarnings();
  }, [token]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/arhtiya/bookings`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setBookings(await res.json());
      else if (res.status === 401 || res.status === 403) router.push('/arhtiya');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchEarnings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/arhtiya/earnings`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setEarnings(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleAction = async (gatePassId: string, action: 'accept' | 'reject') => {
    setOpMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/arhtiya/${action}/${gatePassId}`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { setOpMsg({ type: 'success', text: `Booking ${action}ed successfully.` }); fetchBookings(); fetchEarnings(); }
      else { const data = await res.json(); throw new Error(data.error); }
    } catch (err: any) { setOpMsg({ type: 'error', text: err.message }); }
  };

  const handleLogout = () => {
    localStorage.removeItem('arhtiya_token');
    localStorage.removeItem('arhtiya_user');
    router.push('/arhtiya');
  };

  const pendingBookings = bookings.filter(b => b.arhtiyaStatus === 'PENDING');
  const activeBookings = bookings.filter(b => b.arhtiyaStatus === 'ACCEPTED');

  return (
    <div className="container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="title" style={{ marginBottom: '0.25rem' }}>Commission Agent Dashboard</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>Manage farmer bookings and track commission earnings.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/arhtiya/profile"><button className="btn-secondary" style={{ fontSize: '0.8125rem' }}>Edit Profile</button></Link>
          <button onClick={handleLogout} className="btn-danger" style={{ fontSize: '0.8125rem' }}><LogOut size={14} /> Logout</button>
        </div>
      </div>

      {/* Stat Cards */}
      {earnings && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-value">{earnings.totalTransactions}</div>
            <div className="stat-label">Transactions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{earnings.totalQuantity.toFixed(0)}</div>
            <div className="stat-label">Quintals Processed</div>
          </div>
          <div className="stat-card" style={{ borderTopColor: 'var(--success)' }}>
            <div className="stat-value" style={{ color: 'var(--success)' }}>₹{earnings.totalCommission.toLocaleString()}</div>
            <div className="stat-label">Total Commission</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem', borderBottom: '2px solid var(--border)' }}>
        <button
          onClick={() => setTab('bookings')}
          style={{
            background: 'transparent', color: tab === 'bookings' ? 'var(--primary)' : 'var(--muted-foreground)',
            borderRadius: 0, borderBottom: tab === 'bookings' ? '2px solid var(--primary)' : '2px solid transparent',
            fontWeight: tab === 'bookings' ? 700 : 500, marginBottom: '-2px', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em'
          }}
        >
          Farmer Bookings {pendingBookings.length > 0 && <span className="badge badge-error" style={{ marginLeft: '0.5rem' }}>{pendingBookings.length}</span>}
        </button>
        <button
          onClick={() => setTab('earnings')}
          style={{
            background: 'transparent', color: tab === 'earnings' ? 'var(--primary)' : 'var(--muted-foreground)',
            borderRadius: 0, borderBottom: tab === 'earnings' ? '2px solid var(--primary)' : '2px solid transparent',
            fontWeight: tab === 'earnings' ? 700 : 500, marginBottom: '-2px', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em'
          }}
        >
          Earnings Ledger
        </button>
      </div>

      {opMsg.text && <div className={`info-banner ${opMsg.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '1rem' }}>{opMsg.text}</div>}

      {loading ? <p>Loading…</p> : tab === 'bookings' ? (
        <div>
          {pendingBookings.length > 0 && (
            <>
              <div style={{ borderBottom: '2px solid var(--warning)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pending Acceptance ({pendingBookings.length})
                </h3>
              </div>
              <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
                {pendingBookings.map(b => (
                  <div key={b.id} className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{b.user?.name || 'Farmer'} — {b.cropType} ({b.estimatedQuantity} qtl)</h4>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8125rem' }}>
                          {b.mandi?.name} · {new Date(b.date).toLocaleDateString('en-IN')} · {b.vehicleType}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleAction(b.id, 'accept')} className="btn-success" style={{ fontSize: '0.8125rem' }}>
                          <CheckCircle size={14} /> Accept
                        </button>
                        <button onClick={() => handleAction(b.id, 'reject')} className="btn-danger" style={{ fontSize: '0.8125rem' }}>
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Bookings ({activeBookings.length})
            </h3>
          </div>
          {activeBookings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>No active bookings.</div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {activeBookings.map(b => (
                <div key={b.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{b.user?.name || 'Farmer'} — {b.cropType} ({b.estimatedQuantity} qtl)</h4>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8125rem' }}>
                        {b.mandi?.name} · {new Date(b.date).toLocaleDateString('en-IN')} · Status: {b.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <span className="badge badge-success">Accepted</span>
                  </div>
                  {b.ledger && (
                    <div className="info-banner success" style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem' }}>
                      <Banknote size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'text-bottom' }} />
                      Your Commission: <strong>₹{b.ledger.arhtiyaCommission?.toLocaleString() || '0'}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {earnings && earnings.transactions.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Farmer</th>
                    <th>Crop</th>
                    <th style={{ textAlign: 'right' }}>Qty (qtl)</th>
                    <th style={{ textAlign: 'right' }}>Commission (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.transactions.map((t: any) => (
                    <tr key={t.id}>
                      <td>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                      <td>{t.user?.name || 'N/A'}</td>
                      <td>{t.cropType}</td>
                      <td style={{ textAlign: 'right' }}>{t.estimatedQuantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>₹{t.ledger?.arhtiyaCommission?.toLocaleString() || '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>No completed transactions yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
