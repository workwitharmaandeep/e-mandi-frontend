import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "e-Mandi Procurement Portal — Government of India",
  description: "Digital agricultural procurement portal for transparent slot booking, real-time queue tokens, and direct bank transfer (DBT) MSP settlements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* ── National Tricolor Accent Ribbon ── */}
        <div className="tricolor-strip" />

        {/* ── Top Citizen Utility Bar ── */}
        <div className="civic-topbar">
          <div className="civic-topbar-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span>भारत सरकार | Government of India</span>
              <span className="hide-on-mobile" style={{ opacity: 0.4 }}>|</span>
              <span>Ministry of Consumer Affairs, Food &amp; Public Distribution</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <span>☎ Kisan Helpline: <strong>1800-180-1551</strong></span>
            </div>
          </div>
        </div>

        {/* ── Primary Civic Header ── */}
        <header className="civic-header">
          <div className="civic-header-inner">
            <Link href="/" className="civic-brand">
              <div className="civic-emblem" title="National Emblem of India">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18" />
                  <path d="M3 12h18" />
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 8v8" />
                  <path d="M8 12h8" />
                </svg>
              </div>
              <div className="civic-brand-titles">
                <div className="civic-header-hindi">राष्ट्रीय कृषि विपणन एवं खरीद पोर्टल</div>
                <div className="civic-header-title">National e-Mandi Procurement Portal</div>
                <div className="civic-header-subtitle">Department of Food &amp; Public Distribution · DBT Enabled</div>
              </div>
            </Link>

            <nav className="civic-nav-links">
              <Link href="/">Farmer Home</Link>
              <Link href="/book">Book Slot</Link>
              <Link href="/arhtiya">Arhtiya Portal</Link>
              <Link href="/admin">Admin Control</Link>
            </nav>
          </div>
        </header>

        {/* ── Official Gazette / Status Notice Strip ── */}
        <div className="civic-gazette-strip">
          <div className="civic-gazette-inner">
            <span className="civic-badge-gazette">Gazette Notice</span>
            <span>
              Kharif &amp; Rabi 2026-27 procurement windows operational. Aadhaar-linked bank accounts verified through PFMS for direct DBT credit within 48-72 hours.
            </span>
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <main style={{ minHeight: 'calc(100vh - 280px)' }}>
          {children}
        </main>

        {/* ── Official Civic Footer ── */}
        <footer className="civic-footer">
          <div className="civic-footer-inner">
            <div>
              <div style={{ fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                National e-Mandi Procurement Portal
              </div>
              <p style={{ lineHeight: 1.6, marginBottom: '0.75rem' }}>
                An integrated digital platform for streamlining agricultural arrivals, automated queue token allocation, quality grading, and transparent MSP settlements.
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Department of Food and Public Distribution · Ministry of Consumer Affairs, Food &amp; Public Distribution
              </p>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Portals &amp; Services
              </div>
              <ul style={{ listStyle: 'none', display: 'grid', gap: '0.4rem', padding: 0 }}>
                <li><Link href="/">Farmer Slot Booking</Link></li>
                <li><Link href="/profile">Farmer Profile &amp; DBT</Link></li>
                <li><Link href="/arhtiya">Commission Agent (Arhtiya) Portal</Link></li>
                <li><Link href="/admin">Mandi Administration &amp; Weighbridge</Link></li>
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Support &amp; Standards
              </div>
              <ul style={{ listStyle: 'none', display: 'grid', gap: '0.4rem', padding: 0 }}>
                <li>Kisan Call Centre: 1800-180-1551</li>
                <li>Email: support-emandi@gov.in</li>
                <li>Smart India Hackathon 2026</li>
                <li>Problem Statement: SIH26032</li>
              </ul>
            </div>
          </div>

          <div className="civic-footer-bottom">
            <div>
              © 2026 Government of India. Designed according to Indian Civic Web Guidelines.
            </div>
            <div>
              Developed for Smart India Hackathon · Prototype Demonstration
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
