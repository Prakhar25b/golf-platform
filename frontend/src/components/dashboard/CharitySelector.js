import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function CharitySelector() {
  const { user, refreshUser } = useAuth();
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(user?.selectedCharity?._id || '');
  const [percentage, setPercentage] = useState(user?.charityPercentage || 10);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/charities').then(r => setCharities(r.data));
  }, []);

  const filtered = charities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!selected) return setError('Please select a charity');
    setLoading(true); setError('');
    try {
      await api.put('/charities/select', { charityId: selected, percentage });
      await refreshUser();
      setSuccess('Charity selection saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8, fontSize: 20 }}>My Charity Contribution</h3>
        <p style={{ color: 'var(--gray-light)', fontSize: 14, marginBottom: 20 }}>
          Minimum 10% of your subscription goes to your chosen charity. You can increase this anytime.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--gray-light)' }}>Donation Percentage: <strong style={{ color: 'var(--green)' }}>{percentage}%</strong></label>
            <input type="range" min="10" max="100" value={percentage} onChange={e => setPercentage(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--green)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--gray)', marginTop: 4 }}>
              <span>10% (min)</span><span>100%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: 20 }}>Choose a Charity</h3>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <input type="text" placeholder="Search charities..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', marginBottom: 20, background: 'var(--dark)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--white)', fontFamily: 'var(--font-body)', outline: 'none' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, maxHeight: 400, overflowY: 'auto' }}>
          {filtered.map(c => (
            <div key={c._id} onClick={() => setSelected(c._id)}
              style={{ padding: 16, borderRadius: 10, border: `2px solid ${selected === c._id ? 'var(--green)' : 'var(--border)'}`, cursor: 'pointer', background: selected === c._id ? 'rgba(34,197,94,0.05)' : 'var(--dark)', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-light)' }}>{c.shortDescription || c.description?.slice(0, 80)}</div>
                </div>
                <span className="badge badge-green" style={{ marginLeft: 12, flexShrink: 0 }}>{c.category}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p style={{ color: 'var(--gray)', textAlign: 'center', padding: 24 }}>No charities found</p>}
        </div>

        <button onClick={handleSave} className="btn btn-primary" disabled={loading || !selected}>
          {loading ? 'Saving...' : 'Save Charity Selection'}
        </button>
      </div>
    </div>
  );
}
