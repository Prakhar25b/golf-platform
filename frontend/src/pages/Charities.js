import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CATEGORIES = ['all', 'health', 'education', 'environment', 'sports', 'community', 'other'];

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(null);
  const [percentage, setPercentage] = useState(10);
  const [msg, setMsg] = useState('');
  const { user, refreshUser } = useAuth();

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      const res = await api.get('/charities', { params });
      setCharities(res.data);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCharities(); }, [category, search]);

  const handleSelect = async (charityId) => {
    try {
      await api.put('/charities/select', { charityId, percentage: Number(percentage) });
      await refreshUser();
      setMsg('Charity selected successfully!');
      setSelecting(null);
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg('Failed to select charity');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="section-header">
          <h2>Our Charities</h2>
          <p>Your subscription contribution goes directly to the charity you choose</p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
          <input placeholder="Search charities..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', color: 'var(--white)', fontFamily: 'var(--font-body)', outline: 'none' }} />
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div>Loading charities...</div>
        ) : charities.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--gray)', padding: 60 }}>No charities found</div>
        ) : (
          <div className="grid-3">
            {charities.map(charity => (
              <div key={charity._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 36 }}>💚</div>
                  {charity.featured && <span className="badge badge-gold">Featured</span>}
                  {user?.selectedCharity?._id === charity._id && <span className="badge badge-green">Your Choice</span>}
                </div>
                <h3 style={{ fontSize: 18 }}>{charity.name}</h3>
                <p style={{ color: 'var(--gray-light)', fontSize: 14, flex: 1 }}>{charity.description}</p>
                <span className="badge badge-gray" style={{ alignSelf: 'flex-start', textTransform: 'capitalize' }}>{charity.category}</span>

                {/* Events */}
                {charity.events?.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 6 }}>UPCOMING EVENTS</div>
                    {charity.events.slice(0, 2).map((ev, i) => (
                      <div key={i} style={{ fontSize: 13, color: 'var(--gray-light)', marginBottom: 4 }}>
                        📅 {ev.title} — {new Date(ev.date).toLocaleDateString()}
                      </div>
                    ))}
                  </div>
                )}

                {/* Select */}
                {user && user.subscription?.status === 'active' && (
                  selecting === charity._id ? (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 13 }}>Contribution % (min 10%)</label>
                        <input type="number" min="10" max="100" value={percentage}
                          onChange={e => setPercentage(e.target.value)}
                          style={{ padding: '8px 12px' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleSelect(charity._id)}>Confirm</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelecting(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelecting(charity._id)}>
                      {user?.selectedCharity?._id === charity._id ? 'Change %' : 'Select This Charity'}
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
