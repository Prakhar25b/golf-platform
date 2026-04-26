import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Score form state
  const [scoreForm, setScoreForm] = useState({ score: '', date: '', course: '', notes: '' });
  const [scoreError, setScoreError] = useState('');
  const [scoreSuccess, setScoreSuccess] = useState('');
  const [editingScore, setEditingScore] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/users/dashboard');
      setData(res.data);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleAddScore = async (e) => {
    e.preventDefault();
    setScoreError(''); setScoreSuccess('');
    try {
      await api.post('/scores', {
        score: Number(scoreForm.score),
        date: scoreForm.date,
        course: scoreForm.course,
        notes: scoreForm.notes
      });
      setScoreSuccess('Score added! ✓');
      setScoreForm({ score: '', date: '', course: '', notes: '' });
      fetchDashboard();
      setTimeout(() => setScoreSuccess(''), 3000);
    } catch (err) {
      setScoreError(err.response?.data?.message || 'Failed to add score');
    }
  };

  const handleEditScore = async (scoreId) => {
    try {
      await api.put(`/scores/${scoreId}`, {
        score: Number(editingScore.score),
        course: editingScore.course,
        notes: editingScore.notes
      });
      setEditingScore(null);
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDeleteScore = async (scoreId) => {
    if (!window.confirm('Delete this score?')) return;
    try {
      await api.delete(`/scores/${scoreId}`);
      fetchDashboard();
    } catch (e) {}
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your subscription? You will lose access to draws.')) return;
    try {
      await api.post('/subscriptions/cancel');
      await refreshUser();
      fetchDashboard();
    } catch (e) {}
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading dashboard...</div>;

  const isActive = user?.subscription?.status === 'active';

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 32, marginBottom: 4 }}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p style={{ color: 'var(--gray-light)' }}>Your GolfGive dashboard</p>
          </div>
          {!isActive && (
            <Link to="/subscribe" className="btn btn-primary">Activate Subscription</Link>
          )}
        </div>

        {/* Stats row */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          <div className="card stat-card">
            <div className="stat-value">{data?.scores?.length || 0}/5</div>
            <div className="stat-label">Scores Logged</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">£{data?.totalWon || 0}</div>
            <div className="stat-label">Total Won</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{data?.wins?.length || 0}</div>
            <div className="stat-label">Draw Wins</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{user?.charityPercentage || 10}%</div>
            <div className="stat-label">Charity Share</div>
          </div>
        </div>

        <div className="grid-2">
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Subscription Card */}
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 18 }}>Subscription</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: 'var(--gray-light)' }}>Status</span>
                <span className={`badge ${isActive ? 'badge-green' : 'badge-red'}`}>
                  {user?.subscription?.status || 'Inactive'}
                </span>
              </div>
              {isActive && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--gray-light)', fontSize: 14 }}>Plan</span>
                    <span style={{ textTransform: 'capitalize', fontSize: 14 }}>{user.subscription.plan}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: 'var(--gray-light)', fontSize: 14 }}>Renews</span>
                    <span style={{ fontSize: 14 }}>{user.subscription.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString() : '—'}</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={handleCancel}>Cancel Subscription</button>
                </>
              )}
              {!isActive && <Link to="/subscribe" className="btn btn-primary btn-sm">Subscribe Now</Link>}
            </div>

            {/* Charity Card */}
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 18 }}>My Charity</h3>
              {user?.selectedCharity ? (
                <>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 32 }}>💚</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.selectedCharity.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--gray)' }}>{user.charityPercentage}% of your subscription</div>
                    </div>
                  </div>
                  <Link to="/charities" className="btn btn-secondary btn-sm">Change Charity</Link>
                </>
              ) : (
                <>
                  <p style={{ color: 'var(--gray-light)', fontSize: 14, marginBottom: 12 }}>You haven't selected a charity yet.</p>
                  <Link to="/charities" className="btn btn-primary btn-sm">Choose a Charity</Link>
                </>
              )}
            </div>

            {/* Wins */}
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 18 }}>My Winnings</h3>
              {data?.wins?.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Draw</th>
                      <th>Match</th>
                      <th>Prize</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.wins.map((w, i) => (
                      <tr key={i}>
                        <td style={{ fontSize: 13 }}>{MONTHS[w.drawMonth - 1]} {w.drawYear}</td>
                        <td><span className="badge badge-gold">{w.matchType}</span></td>
                        <td style={{ color: 'var(--green)', fontWeight: 600 }}>£{w.prizeAmount}</td>
                        <td><span className={`badge ${w.paymentStatus === 'paid' ? 'badge-green' : 'badge-gray'}`}>{w.paymentStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: 'var(--gray)', fontSize: 14 }}>No wins yet — keep entering your scores!</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — Scores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Add Score */}
            {isActive && (
              <div className="card">
                <h3 style={{ marginBottom: 16, fontSize: 18 }}>Add Score</h3>
                <p style={{ color: 'var(--gray)', fontSize: 13, marginBottom: 16 }}>
                  Stableford format (1–45). Only 5 scores kept — oldest auto-removed.
                </p>
                {scoreError && <div className="alert alert-error">{scoreError}</div>}
                {scoreSuccess && <div className="alert alert-success">{scoreSuccess}</div>}
                <form onSubmit={handleAddScore}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label>Score (1–45)</label>
                      <input type="number" min="1" max="45" placeholder="e.g. 32" value={scoreForm.score}
                        onChange={e => setScoreForm({ ...scoreForm, score: e.target.value })} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label>Date Played</label>
                      <input type="date" value={scoreForm.date} max={new Date().toISOString().split('T')[0]}
                        onChange={e => setScoreForm({ ...scoreForm, date: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label>Course (optional)</label>
                    <input placeholder="e.g. Augusta National" value={scoreForm.course}
                      onChange={e => setScoreForm({ ...scoreForm, course: e.target.value })} />
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }} type="submit">Add Score</button>
                </form>
              </div>
            )}

            {/* Score List */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 18 }}>My Scores</h3>
                <span className="badge badge-gray">{data?.scores?.length || 0} / 5</span>
              </div>
              {!isActive && (
                <div className="alert alert-error">Subscribe to enter and view scores</div>
              )}
              {data?.scores?.length === 0 ? (
                <p style={{ color: 'var(--gray)', fontSize: 14 }}>No scores yet. Add your first Stableford score above.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.scores.map((s, i) => (
                    <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: i < data.scores.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      {editingScore?._id === s._id ? (
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                            <input type="number" min="1" max="45" value={editingScore.score}
                              onChange={e => setEditingScore({ ...editingScore, score: e.target.value })}
                              style={{ background: 'var(--dark)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--white)', fontFamily: 'var(--font-body)' }} />
                            <input value={editingScore.course || ''}
                              onChange={e => setEditingScore({ ...editingScore, course: e.target.value })}
                              placeholder="Course"
                              style={{ background: 'var(--dark)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--white)', fontFamily: 'var(--font-body)' }} />
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-primary btn-sm" onClick={() => handleEditScore(s._id)}>Save</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingScore(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="score-circle">{s.score}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 15 }}>{s.score} pts</div>
                            <div style={{ color: 'var(--gray)', fontSize: 13 }}>
                              {new Date(s.date).toLocaleDateString()} {s.course ? `· ${s.course}` : ''}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingScore({ ...s })}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteScore(s._id)}>Del</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
