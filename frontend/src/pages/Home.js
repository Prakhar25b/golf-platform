import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Home() {
  const [charities, setCharities] = useState([]);
  const [latestDraw, setLatestDraw] = useState(null);

  useEffect(() => {
    api.get('/charities/featured').then(r => setCharities(r.data)).catch(() => {});
    api.get('/draws/latest').then(r => setLatestDraw(r.data)).catch(() => {});
  }, []);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div>
      {/* ─── Hero ─── */}
      <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', background: 'radial-gradient(ellipse at 60% 50%, rgba(34,197,94,0.08) 0%, transparent 70%)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div className="badge badge-green" style={{ marginBottom: 24, fontSize: 13 }}>🌿 Golf with Purpose</div>
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 80px)', lineHeight: 1.1, marginBottom: 24, maxWidth: 800, margin: '0 auto 24px' }}>
            Play Golf.<br />
            <span style={{ color: 'var(--green)' }}>Win Prizes.</span><br />
            Change Lives.
          </h1>
          <p style={{ fontSize: 18, color: 'var(--gray-light)', maxWidth: 560, margin: '24px auto 40px', lineHeight: 1.7 }}>
            Enter your Stableford scores, join monthly draws, and donate to the charity you care about most — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ fontSize: 18, padding: '16px 36px' }}>Join & Subscribe</Link>
            <Link to="/charities" className="btn btn-secondary" style={{ fontSize: 18, padding: '16px 36px' }}>Explore Charities</Link>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <h2>How It Works</h2>
            <p>Simple steps to play, win, and give back</p>
          </div>
          <div className="grid-3">
            {[
              { step: '01', icon: '🏌️', title: 'Subscribe', desc: 'Choose a monthly or yearly plan. A portion of every subscription goes straight to charity.' },
              { step: '02', icon: '⛳', title: 'Enter Scores', desc: 'Log your latest 5 Stableford golf scores. Your scores are your draw entries.' },
              { step: '03', icon: '🎯', title: 'Win & Give', desc: 'Monthly draws match your scores for prizes. Your chosen charity receives your contribution automatically.' },
            ].map(item => (
              <div key={item.step} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{item.icon}</div>
                <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 48, fontFamily: 'var(--font-display)', fontWeight: 900, color: 'rgba(34,197,94,0.08)', lineHeight: 1 }}>{item.step}</div>
                <h3 style={{ fontSize: 20, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ color: 'var(--gray-light)', fontSize: 15 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Prize Pool ─── */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border)', background: 'rgba(34,197,94,0.02)' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <h2>Prize Draw Structure</h2>
            <p>Every month, three tiers of winners are rewarded</p>
          </div>
          <div className="grid-3">
            {[
              { match: '5-Number Match', share: '40%', color: 'var(--gold)', label: 'Jackpot', note: 'Rolls over if unclaimed' },
              { match: '4-Number Match', share: '35%', color: 'var(--green)', label: 'Major Prize', note: 'Split equally among winners' },
              { match: '3-Number Match', share: '25%', color: 'var(--gray-light)', label: 'Bronze Prize', note: 'Split equally among winners' },
            ].map(tier => (
              <div key={tier.match} className="card" style={{ textAlign: 'center', borderColor: tier.color + '33' }}>
                <div style={{ fontSize: 40, fontFamily: 'var(--font-display)', fontWeight: 900, color: tier.color, marginBottom: 8 }}>{tier.share}</div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{tier.match}</div>
                <div className="badge" style={{ background: tier.color + '20', color: tier.color, marginBottom: 12 }}>{tier.label}</div>
                <p style={{ fontSize: 13, color: 'var(--gray)' }}>{tier.note}</p>
              </div>
            ))}
          </div>
          {latestDraw && (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <div className="card" style={{ display: 'inline-block', padding: '20px 40px' }}>
                <div style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 8 }}>Latest Draw — {monthNames[latestDraw.month - 1]} {latestDraw.year}</div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {latestDraw.winningNumbers.map((n, i) => (
                    <div key={i} className="score-circle">{n}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Featured Charities ─── */}
      {charities.length > 0 && (
        <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-header" style={{ textAlign: 'center' }}>
              <h2>Charities We Support</h2>
              <p>Choose the cause your subscription contributes to</p>
            </div>
            <div className="grid-3">
              {charities.map(charity => (
                <div key={charity._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 36 }}>💚</div>
                  <h3 style={{ fontSize: 20 }}>{charity.name}</h3>
                  <p style={{ color: 'var(--gray-light)', fontSize: 14, flex: 1 }}>{charity.shortDescription || charity.description.substring(0, 100)}...</p>
                  <span className="badge badge-green">{charity.category}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link to="/charities" className="btn btn-secondary">View All Charities →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 40, marginBottom: 16 }}>Ready to Play with Purpose?</h2>
          <p style={{ color: 'var(--gray-light)', fontSize: 18, marginBottom: 40 }}>Join hundreds of golfers making an impact with every swing.</p>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: 18, padding: '18px 48px' }}>Get Started Today</Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 0', textAlign: 'center', color: 'var(--gray)' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>Golf<span style={{ color: 'var(--green)' }}>Give</span></p>
        <p style={{ fontSize: 13 }}>© {new Date().getFullYear()} GolfGive. Play. Win. Give.</p>
      </footer>
    </div>
  );
}
