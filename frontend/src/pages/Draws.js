import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Draws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/draws').then(r => setDraws(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div>Loading draws...</div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="section-header">
          <h2>Monthly Draws</h2>
          <p>Published draw results — your scores are your entries</p>
        </div>

        {draws.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--gray)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <h3>No draws published yet</h3>
            <p style={{ marginTop: 8 }}>Check back after the first monthly draw runs.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {draws.map((draw, idx) => (
              <div key={draw._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 22 }}>{MONTHS[draw.month - 1]} {draw.year} Draw</h3>
                      {idx === 0 && <span className="badge badge-green">Latest</span>}
                    </div>
                    <div style={{ color: 'var(--gray)', fontSize: 13 }}>
                      {draw.activeSubscribers} participants · {draw.drawType === 'algorithmic' ? 'Algorithmic Draw' : 'Random Draw'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--gray)', fontSize: 12, marginBottom: 4 }}>TOTAL POOL</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>
                      £{draw.prizePool?.total || 0}
                    </div>
                  </div>
                </div>

                {/* Winning numbers */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Winning Numbers</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {draw.winningNumbers.map((n, i) => (
                      <div key={i} className="score-circle">{n}</div>
                    ))}
                  </div>
                </div>

                {/* Prize tiers */}
                <div className="grid-3" style={{ gap: 12 }}>
                  {[
                    { label: '5-Match (Jackpot)', amount: draw.prizePool?.fiveMatch, color: 'var(--gold)' },
                    { label: '4-Match', amount: draw.prizePool?.fourMatch, color: 'var(--green)' },
                    { label: '3-Match', amount: draw.prizePool?.threeMatch, color: 'var(--gray-light)' },
                  ].map(tier => (
                    <div key={tier.label} style={{ background: 'var(--dark)', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 4 }}>{tier.label}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: tier.color }}>£{tier.amount || 0}</div>
                    </div>
                  ))}
                </div>

                {/* Winners count */}
                {draw.winners?.length > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', color: 'var(--gray)', fontSize: 14 }}>
                    🏆 {draw.winners.length} winner{draw.winners.length !== 1 ? 's' : ''} this month
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
