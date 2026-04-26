import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Subscribe() {
  const [selected, setSelected] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const plans = {
    monthly: { label: 'Monthly', price: '£10', period: '/month', saving: null, description: 'Flexible, cancel anytime' },
    yearly: { label: 'Yearly', price: '£99', period: '/year', saving: 'Save £21', description: 'Best value — 2 months free' }
  };

  const handleSubscribe = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/subscriptions/subscribe', { plan: selected });
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Subscription failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, marginBottom: 12 }}>Choose Your Plan</h1>
          <p style={{ color: 'var(--gray-light)' }}>Your subscription funds prize pools and charitable giving</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="grid-2" style={{ marginBottom: 24 }}>
          {Object.entries(plans).map(([key, plan]) => (
            <div key={key} className="card" onClick={() => setSelected(key)}
              style={{ cursor: 'pointer', border: selected === key ? '2px solid var(--green)' : '1px solid var(--border)', position: 'relative', transition: 'all 0.2s' }}>
              {plan.saving && <div className="badge badge-gold" style={{ position: 'absolute', top: 16, right: 16 }}>{plan.saving}</div>}
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{plan.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 900, color: 'var(--green)', lineHeight: 1 }}>
                {plan.price}<span style={{ fontSize: 16, color: 'var(--gray)', fontFamily: 'var(--font-body)' }}>{plan.period}</span>
              </div>
              <p style={{ color: 'var(--gray-light)', fontSize: 14, marginTop: 8 }}>{plan.description}</p>
              {selected === key && <div style={{ position: 'absolute', top: 16, left: 16, width: 20, height: 20, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</div>}
            </div>
          ))}
        </div>

        {/* What's included */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 18 }}>What's included</h3>
          {['Access to monthly prize draws', 'Score tracking (5 Stableford scores)', 'Charitable contribution to your chosen cause', 'Full dashboard & results history', 'Winner verification & payout system'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, fontSize: 14 }}>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span>
              <span style={{ color: 'var(--gray-light)' }}>{item}</span>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" style={{ width: '100%', fontSize: 18, padding: 16 }}
          onClick={handleSubscribe} disabled={loading}>
          {loading ? 'Processing...' : `Subscribe — ${plans[selected].price}${plans[selected].period}`}
        </button>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--gray)' }}>
          Note: This is a demo project. No real payment is processed.
        </p>
      </div>
    </div>
  );
}
