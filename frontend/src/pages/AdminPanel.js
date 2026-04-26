import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TABS = ['Analytics', 'Users', 'Draws', 'Charities', 'Winners'];

export default function AdminPanel() {
  const [tab, setTab] = useState('Analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [draws, setDraws] = useState([]);
  const [charities, setCharities] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Draw form
  const now = new Date();
  const [drawForm, setDrawForm] = useState({ month: now.getMonth() + 1, year: now.getFullYear(), drawType: 'random', publish: false });
  const [drawResult, setDrawResult] = useState(null);

  // Charity form
  const [charityForm, setCharityForm] = useState({ name: '', description: '', shortDescription: '', category: 'sports', featured: false });
  const [showCharityForm, setShowCharityForm] = useState(false);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  useEffect(() => {
    if (tab === 'Analytics') api.get('/admin/analytics').then(r => setAnalytics(r.data)).catch(() => {});
    if (tab === 'Users') api.get('/admin/users').then(r => setUsers(r.data)).catch(() => {});
    if (tab === 'Draws') api.get('/admin/draws').then(r => setDraws(r.data)).catch(() => {});
    if (tab === 'Charities') api.get('/charities').then(r => setCharities(r.data)).catch(() => {});
    if (tab === 'Winners') api.get('/admin/winners').then(r => setWinners(r.data)).catch(() => {});
  }, [tab]);

  const handleSeedData = async () => {
    try { await api.post('/admin/seed'); flash('Sample charities seeded!'); }
    catch (e) { flash('Seed failed or already done'); }
  };

  const handleRunDraw = async () => {
    setLoading(true); setDrawResult(null);
    try {
      const res = await api.post('/admin/draws/run', drawForm);
      setDrawResult(res.data);
      api.get('/admin/draws').then(r => setDraws(r.data));
      flash(res.data.message);
    } catch (err) {
      flash(err.response?.data?.message || 'Draw failed');
    } finally { setLoading(false); }
  };

  const handlePublishDraw = async (drawId) => {
    try {
      await api.put(`/admin/draws/${drawId}/publish`);
      flash('Draw published!');
      api.get('/admin/draws').then(r => setDraws(r.data));
    } catch (e) { flash('Failed to publish'); }
  };

  const handleAddCharity = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/charities', charityForm);
      flash('Charity added!');
      setCharityForm({ name: '', description: '', shortDescription: '', category: 'sports', featured: false });
      setShowCharityForm(false);
      api.get('/charities').then(r => setCharities(r.data));
    } catch (err) { flash(err.response?.data?.message || 'Failed to add charity'); }
  };

  const handleDeleteCharity = async (id) => {
    if (!window.confirm('Delete this charity?')) return;
    try {
      await api.delete(`/admin/charities/${id}`);
      flash('Charity deleted');
      setCharities(prev => prev.filter(c => c._id !== id));
    } catch (e) { flash('Failed to delete'); }
  };

  const handleWinnerStatus = async (drawId, winnerId, status) => {
    try {
      await api.put(`/admin/winners/${drawId}/${winnerId}`, { paymentStatus: status });
      flash('Status updated');
      api.get('/admin/winners').then(r => setWinners(r.data));
    } catch (e) { flash('Failed to update'); }
  };

  const handleUserSubStatus = async (userId, status) => {
    try {
      await api.put(`/admin/users/${userId}`, { 'subscription.status': status });
      flash('User updated');
      api.get('/admin/users').then(r => setUsers(r.data));
    } catch (e) {}
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>Admin Panel</h1>
          <p style={{ color: 'var(--gray-light)' }}>Full platform control</p>
        </div>

        {msg && <div className="alert alert-success" style={{ marginBottom: 24 }}>{msg}</div>}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-secondary'}`}>{t}</button>
          ))}
          <button className="btn btn-secondary btn-sm" onClick={handleSeedData} style={{ marginLeft: 'auto' }}>
            🌱 Seed Demo Data
          </button>
        </div>

        {/* ── ANALYTICS ── */}
        {tab === 'Analytics' && analytics && (
          <div>
            <div className="grid-4" style={{ marginBottom: 24 }}>
              {[
                { label: 'Total Users', value: analytics.totalUsers },
                { label: 'Active Subscribers', value: analytics.activeSubscribers },
                { label: 'Monthly Plan', value: analytics.monthlySubscribers },
                { label: 'Yearly Plan', value: analytics.yearlySubscribers },
              ].map(s => (
                <div key={s.label} className="card stat-card">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid-3">
              {[
                { label: 'Published Draws', value: analytics.totalDraws, color: 'var(--green)' },
                { label: 'Active Charities', value: analytics.totalCharities, color: 'var(--gold)' },
                { label: 'Est. Monthly Pool', value: `£${analytics.estimatedMonthlyPool}`, color: 'var(--green)' },
              ].map(s => (
                <div key={s.label} className="card stat-card">
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'Users' && (
          <div className="card">
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Plan</th><th>Sub Status</th><th>Joined</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td style={{ color: 'var(--gray-light)' }}>{u.email}</td>
                      <td style={{ textTransform: 'capitalize' }}>{u.subscription?.plan || '—'}</td>
                      <td>
                        <span className={`badge ${u.subscription?.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                          {u.subscription?.status || 'inactive'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gray)', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select value={u.subscription?.status || 'inactive'}
                          onChange={e => handleUserSubStatus(u._id, e.target.value)}
                          style={{ background: 'var(--dark)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--white)', fontSize: 12, cursor: 'pointer' }}>
                          <option value="active">active</option>
                          <option value="inactive">inactive</option>
                          <option value="cancelled">cancelled</option>
                          <option value="lapsed">lapsed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>No users yet</div>}
            </div>
          </div>
        )}

        {/* ── DRAWS ── */}
        {tab === 'Draws' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Run Draw */}
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 18 }}>Run / Simulate Draw</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Month</label>
                  <select value={drawForm.month} onChange={e => setDrawForm({ ...drawForm, month: Number(e.target.value) })}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Year</label>
                  <input type="number" value={drawForm.year} onChange={e => setDrawForm({ ...drawForm, year: Number(e.target.value) })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Draw Type</label>
                  <select value={drawForm.drawType} onChange={e => setDrawForm({ ...drawForm, drawType: e.target.value })}>
                    <option value="random">Random</option>
                    <option value="algorithmic">Algorithmic</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Publish?</label>
                  <select value={drawForm.publish} onChange={e => setDrawForm({ ...drawForm, publish: e.target.value === 'true' })}>
                    <option value="false">Simulate Only</option>
                    <option value="true">Publish Immediately</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleRunDraw} disabled={loading}>
                {loading ? 'Running...' : drawForm.publish ? '🎯 Run & Publish Draw' : '🔬 Simulate Draw'}
              </button>

              {drawResult && (
                <div style={{ marginTop: 20, padding: 16, background: 'var(--dark)', borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12, color: 'var(--green)' }}>Draw Result:</div>
                  <div style={{ marginBottom: 8 }}>Winning Numbers: <strong>{drawResult.draw.winningNumbers.join(', ')}</strong></div>
                  <div style={{ marginBottom: 8 }}>Winners: <strong>{drawResult.draw.winners?.length || 0}</strong></div>
                  <div>Status: <span className="badge badge-green">{drawResult.draw.status}</span></div>
                </div>
              )}
            </div>

            {/* Draws list */}
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 18 }}>All Draws</h3>
              <table className="table">
                <thead>
                  <tr><th>Period</th><th>Status</th><th>Subscribers</th><th>Pool</th><th>Winners</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {draws.map(d => (
                    <tr key={d._id}>
                      <td>{MONTHS[d.month - 1]} {d.year}</td>
                      <td><span className={`badge ${d.status === 'published' ? 'badge-green' : 'badge-gray'}`}>{d.status}</span></td>
                      <td>{d.activeSubscribers}</td>
                      <td style={{ color: 'var(--gold)' }}>£{d.prizePool?.total || 0}</td>
                      <td>{d.winners?.length || 0}</td>
                      <td>
                        {d.status !== 'published' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handlePublishDraw(d._id)}>Publish</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {draws.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>No draws yet — run one above</div>}
            </div>
          </div>
        )}

        {/* ── CHARITIES ── */}
        {tab === 'Charities' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowCharityForm(!showCharityForm)}>
                {showCharityForm ? 'Cancel' : '+ Add Charity'}
              </button>
            </div>

            {showCharityForm && (
              <div className="card">
                <h3 style={{ marginBottom: 16, fontSize: 18 }}>Add New Charity</h3>
                <form onSubmit={handleAddCharity}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Name</label>
                      <input value={charityForm.name} onChange={e => setCharityForm({ ...charityForm, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select value={charityForm.category} onChange={e => setCharityForm({ ...charityForm, category: e.target.value })}>
                        {['health','education','environment','sports','community','other'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Short Description</label>
                    <input value={charityForm.shortDescription} onChange={e => setCharityForm({ ...charityForm, shortDescription: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Full Description</label>
                    <textarea rows={3} value={charityForm.description} onChange={e => setCharityForm({ ...charityForm, description: e.target.value })} required
                      style={{ width: '100%', background: 'var(--dark)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--white)', fontFamily: 'var(--font-body)', resize: 'vertical' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" checked={charityForm.featured} onChange={e => setCharityForm({ ...charityForm, featured: e.target.checked })}
                        style={{ width: 'auto' }} />
                      Feature on homepage
                    </label>
                  </div>
                  <button className="btn btn-primary" type="submit">Add Charity</button>
                </form>
              </div>
            )}

            <div className="card">
              <table className="table">
                <thead>
                  <tr><th>Name</th><th>Category</th><th>Featured</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {charities.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td style={{ textTransform: 'capitalize' }}>{c.category}</td>
                      <td>{c.featured ? '⭐' : '—'}</td>
                      <td><span className={`badge ${c.active ? 'badge-green' : 'badge-gray'}`}>{c.active ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCharity(c._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {charities.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>No charities — add one or seed demo data</div>}
            </div>
          </div>
        )}

        {/* ── WINNERS ── */}
        {tab === 'Winners' && (
          <div className="card">
            <table className="table">
              <thead>
                <tr><th>Draw</th><th>User</th><th>Match</th><th>Prize</th><th>Proof</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {winners.map(w => (
                  <tr key={`${w.drawId}-${w.winnerId}`}>
                    <td>{MONTHS[w.month - 1]} {w.year}</td>
                    <td style={{ fontSize: 13 }}>{w.user?.name || 'Unknown'}</td>
                    <td><span className="badge badge-gold">{w.matchType}</span></td>
                    <td style={{ color: 'var(--green)', fontWeight: 600 }}>£{w.prizeAmount}</td>
                    <td>{w.proofUpload ? <a href={w.proofUpload} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>View</a> : '—'}</td>
                    <td><span className={`badge ${w.paymentStatus === 'paid' ? 'badge-green' : w.paymentStatus === 'rejected' ? 'badge-red' : 'badge-gray'}`}>{w.paymentStatus}</span></td>
                    <td>
                      <select value={w.paymentStatus}
                        onChange={e => handleWinnerStatus(w.drawId, w.winnerId, e.target.value)}
                        style={{ background: 'var(--dark)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--white)', fontSize: 12, cursor: 'pointer' }}>
                        <option value="pending">pending</option>
                        <option value="verified">verified</option>
                        <option value="paid">paid</option>
                        <option value="rejected">rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {winners.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray)' }}>No winners yet</div>}
          </div>
        )}
      </div>
    </div>
  );
}
