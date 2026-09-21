'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut, Plus, MapPin, Calendar, Clock, Banknote, User, Printer, ShieldCheck, FileCheck, Radio } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function Dashboard() {
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [farmer, setFarmer] = useState<any>(null);
  const [liveConnected, setLiveConnected] = useState(false);
  
  // Cancel Slot Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelPassId, setCancelPassId] = useState<string | null>(null);
  const [cancelReasonOption, setCancelReasonOption] = useState<string>('Weather conditions');
  const [cancelOtherReason, setCancelOtherReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) { router.push('/'); return; }
    const user = JSON.parse(userStr);
    setFarmer(user);
    if (!user.name || !user.state || !user.bankAccount) { router.push('/profile'); return; }

    const fetchPasses = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/gatepass/my-passes', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setPasses(await res.json());
        else if (res.status === 401 || res.status === 403) router.push('/');
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };

    fetchPasses();

    // ── Real-Time WebSocket Connection ──
    const socket: Socket = io('http://localhost:4000', {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      setLiveConnected(true);
      if (user.id) socket.emit('join_user', user.id);
    });

    socket.on('GATEPASS_UPDATED', (payload: any) => {
      console.log('[WebSocket Event] GATEPASS_UPDATED:', payload);
      // Immediately refresh passes without polling
      fetchPasses();
    });

    socket.on('disconnect', () => {
      setLiveConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'ISSUED': 'Gate Pass Issued · Ready for Entry',
      'ARRIVED': 'Arrived at Mandi',
      'QUALITY_TESTED': 'Quality Grading Done',
      'WEIGHED': 'Weighment Completed',
      'LIFTED': 'Produce Lifted',
      'PAYMENT_PROCESSED': 'DBT Payment Disbursed',
    };
    return map[status] || status;
  };

  const getStatusBadge = (status: string) => {
    if (['WEIGHED', 'LIFTED', 'PAYMENT_PROCESSED'].includes(status)) return 'badge-success';
    if (['ARRIVED', 'QUALITY_TESTED'].includes(status)) return 'badge-warning';
    if (status === 'ISSUED') return 'badge-primary';
    return 'badge-neutral';
  };

  return (
    <div className="container">
      {/* ── Official Farmer Profile Banner ── */}
      {farmer && (
        <div className="card" style={{ marginBottom: '1.75rem', borderLeft: '4px solid var(--civic-navy)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--civic-navy)', color: '#FFF', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem' }}>
                {farmer.name?.charAt(0) || 'F'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--civic-navy)' }}>{farmer.name}</h2>
                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                    <ShieldCheck size={12} /> Aadhaar Verified
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--foreground-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                  <span>State: <strong>{farmer.state}</strong></span>
                  <span>District: <strong>{farmer.district || 'Not Set'}</strong></span>
                  <span>Aadhaar: <strong>•••• •••• {farmer.aadhaar ? farmer.aadhaar.slice(-4) : '****'}</strong></span>
                  <span>DBT Status: <strong style={{ color: 'var(--civic-green)' }}>A/C Linked (PFMS)</strong></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/profile">
                <button className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}>
                  Update Profile
                </button>
              </Link>
              <button onClick={handleLogout} className="btn-danger" style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Section Title & Action ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--civic-navy)', paddingBottom: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="title" style={{ fontSize: '1.4rem', marginBottom: 0 }}>Registered Gate Passes &amp; Slips</h1>
            <span
              className={`badge ${liveConnected ? 'badge-success' : 'badge-neutral'}`}
              style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Radio size={11} className={liveConnected ? 'pulse' : ''} />
              {liveConnected ? 'LIVE SYNC ACTIVE' : 'CONNECTING…'}
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--foreground-muted)' }}>
            Real-time updates via WebSockets for weighment, queue progression, and DBT credit.
          </p>
        </div>
        <Link href="/book">
          <button style={{ fontSize: '0.8125rem' }}>
            <Plus size={14} /> Book New Mandi Slot
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--foreground-muted)' }}>Retrieving official records from National Mandi Registry…</p>
        </div>
      ) : passes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <FileCheck size={40} style={{ margin: '0 auto 1rem auto', color: 'var(--foreground-muted)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Active Mandi Bookings Found</h3>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Schedule your crop delivery at your nearest APMC market yard to receive an authorized digital QR token.
          </p>
          <Link href="/book"><button>Book Procurement Slot →</button></Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {passes.map((pass, index) => (
            <div key={pass.id} className="card" style={{ padding: 0, overflow: 'hidden', borderTop: '3px solid var(--civic-navy)' }}>
              
              {/* Slip Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', background: '#F1F5F9', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--civic-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      APMC PASS #{index + 1} · {pass.qrCodeToken.slice(0, 8).toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>|</span>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--foreground)' }}>{pass.mandi.name}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={13} /> {pass.mandi.location}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={13} /> Date: {new Date(pass.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge ${getStatusBadge(pass.status)}`}>{getStatusLabel(pass.status)}</span>
                  {pass.status === 'ISSUED' && (
                    <button
                      onClick={() => {
                        setCancelPassId(pass.id);
                        setCancelReasonOption('Weather conditions');
                        setCancelOtherReason('');
                        setCancelModalOpen(true);
                      }}
                      className="btn-danger"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                      title="Cancel Booking"
                    >
                      Cancel Slot
                    </button>
                  )}
                  <button
                    onClick={() => window.print()}
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                    title="Print Gate Pass"
                  >
                    <Printer size={13} /> Print Slip
                  </button>
                </div>
              </div>

              {/* Slip Body */}
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {/* Information Column */}
                <div style={{ flex: 1, minWidth: '320px', padding: '1.25rem 1.5rem' }}>
                  
                  {/* Commodity & Transport Specs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.25rem', background: '#F8FAFC', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: '2px' }}>
                    <div>
                      <span style={{ color: 'var(--foreground-muted)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase' }}>Commodity</span>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{pass.cropType} {pass.cropVariety && `(${pass.cropVariety})`}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--foreground-muted)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase' }}>Declared Quantity</span>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{pass.estimatedQuantity} Quintals</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--foreground-muted)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase' }}>Transport Vehicle</span>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{pass.vehicleType || 'Tractor Trolley'}</div>
                    </div>
                  </div>

                  {/* Arhtiya Commission Agent Block */}
                  {pass.arhtiya && (
                    <div style={{ padding: '0.85rem', background: '#F8FAFC', borderLeft: '4px solid var(--civic-navy)', border: '1px solid var(--border)', borderLeftWidth: '4px', borderLeftColor: 'var(--civic-navy)', marginBottom: '1.25rem', borderRadius: '2px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--civic-navy)', marginBottom: '0.2rem' }}>
                        <User size={15} /> Assigned Arhtiya (Commission Agent): {pass.arhtiya.name}
                      </div>
                      <div style={{ color: 'var(--foreground-secondary)', fontSize: '0.75rem' }}>
                        License No: <strong>{pass.arhtiya.licenseNumber}</strong> · Market: {pass.arhtiya.apmcMarket} · Helpline: {pass.arhtiya.phone}
                      </div>
                      {pass.arhtiyaStatus === 'REJECTED' && (
                        <div className="info-banner error" style={{ marginTop: '0.5rem', marginBottom: 0, padding: '0.45rem 0.65rem', fontSize: '0.75rem' }}>
                          Agent rejected allocation. Re-booking slot required.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Live Queue Indicator */}
                  {pass.queuePosition && !['WEIGHED', 'LIFTED', 'PAYMENT_PROCESSED'].includes(pass.status) && (
                    <div className="queue-banner" style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                        <Clock size={18} /> Current Queue Turn: #{pass.queuePosition}
                      </div>
                      {pass.estimatedTimeOfTurn && (
                        <div style={{ fontSize: '0.8125rem', opacity: 0.9 }}>
                          Estimated Yard Entry: <strong>{new Date(pass.estimatedTimeOfTurn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quality Inspection Results */}
                  {pass.qualityTest && (
                    <div style={{ padding: '0.75rem 1rem', background: '#F1F5F9', border: '1px solid var(--border)', fontSize: '0.8125rem', marginBottom: '1.25rem', borderRadius: '2px' }}>
                      <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6875rem', color: 'var(--foreground-muted)', marginBottom: '0.25rem' }}>
                        Quality &amp; Grading Certificate
                      </div>
                      <div>
                        Status: <strong style={{ color: pass.qualityTest.result === 'PASSED' ? 'var(--civic-green)' : 'var(--civic-red)' }}>{pass.qualityTest.result}</strong> · 
                        Moisture Content: <strong>{pass.qualityTest.moisture}%</strong> · 
                        Grade: <strong>{pass.qualityTest.grade || 'Standard FAQ'}</strong>
                      </div>
                    </div>
                  )}

                  {/* Transparent Payment & DBT Ledger */}
                  {pass.ledger && (
                    <div className="ledger">
                      <div style={{ fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.8125rem' }}>
                        <Banknote size={16} /> Official Procurement &amp; DBT Settlement Breakdown
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', fontSize: '0.8125rem' }}>
                        <div>MSP Benchmark: <strong>₹{pass.ledger.mspRate.toLocaleString()}/qtl</strong></div>
                        <div>Gross Yield Value: <strong>₹{pass.ledger.totalValue.toLocaleString()}</strong></div>
                        {pass.ledger.arhtiyaCommission > 0 && <div>Agent Commission: <strong>₹{pass.ledger.arhtiyaCommission.toLocaleString()}</strong></div>}
                        <div>APMC Cess / Market Fee: <strong>₹{pass.ledger.marketFee.toLocaleString()}</strong></div>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: '1.05rem', marginTop: '0.75rem', borderTop: '1.5px solid #86EFAC', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Net Direct Benefit Transfer (DBT):</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>₹{pass.ledger.netToFarmer.toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', marginTop: '0.25rem', opacity: 0.85 }}>
                        Status: <strong>{pass.ledger.dbtStatus}</strong> · Settled via Public Financial Management System (PFMS)
                      </div>
                    </div>
                  )}
                </div>

                {/* QR Code Pass Stamp */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid var(--border)', padding: '1.75rem', background: '#F8FAFC', minWidth: '180px' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--civic-navy)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
                    Gate Entry Token
                  </div>
                  <div style={{ padding: '0.6rem', background: '#FFFFFF', border: '1.5px solid var(--civic-navy)', borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <QRCodeSVG value={pass.qrCodeToken} size={110} />
                  </div>
                  <div style={{ fontSize: '0.6875rem', marginTop: '0.6rem', color: 'var(--foreground-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {pass.qrCodeToken.slice(0, 13)}
                  </div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--foreground-muted)', textAlign: 'center', marginTop: '0.25rem' }}>
                    Scan at Mandi Entry Gate
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal overlay */}
      {cancelModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Cancel Booking</h2>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--foreground-muted)' }}>
              Please select a reason for cancelling your slot.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {['Weather conditions', 'Transport issue', 'Crop not ready', 'Other'].map(option => (
                <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <input
                    type="radio"
                    name="cancelReason"
                    value={option}
                    checked={cancelReasonOption === option}
                    onChange={(e) => setCancelReasonOption(e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>

            {cancelReasonOption === 'Other' && (
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Please specify..."
                  value={cancelOtherReason}
                  onChange={(e) => setCancelOtherReason(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                className="btn-secondary"
                onClick={() => setCancelModalOpen(false)}
                disabled={isCancelling}
                style={{ padding: '0.4rem 1rem' }}
              >
                Close
              </button>
              <button
                className="btn-danger"
                disabled={isCancelling}
                onClick={async () => {
                  const finalReason = cancelReasonOption === 'Other' ? cancelOtherReason.trim() : cancelReasonOption;
                  if (finalReason.length < 5) {
                    alert('Please provide a valid reason (min 5 characters).');
                    return;
                  }
                  setIsCancelling(true);
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('http://localhost:4000/api/gatepass/cancel', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ gatePassId: cancelPassId, reason: finalReason })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Failed to cancel');
                    setCancelModalOpen(false);
                    // Trigger reload of passes is handled by WebSocket automatically
                  } catch (err: any) {
                    alert(err.message);
                  } finally {
                    setIsCancelling(false);
                  }
                }}
                style={{ padding: '0.4rem 1rem' }}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
