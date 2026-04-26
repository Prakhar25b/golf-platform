import React, { useState } from 'react';
import api from '../../utils/api';

export default function ScoreManager({ initialScores = [], onUpdate }) {
  const [scores, setScores] = useState(initialScores);
  const [form, setForm] = useState({ score: '', date: '', course: '', notes: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const showMsg = (type, msg) => {
    if (type === 'error') setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/scores', form);
      const updated = [res.data, ...scores].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
      setScores(updated);
      onUpdate(updated);
      setForm({ score: '', date: '', course: '', notes: '' });
      showMsg('success', 'Score added!');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to add score');
    } finally { setLoading(false); }
  };

  const handleEdit = (score) => {
    setEditId(score._id);
    setEditForm({ score: score.score, course: score.course || '', notes: score.notes || '' });
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await api.put(`/scores/${id}`, editForm);
      const updated = scores.map(s => s._id === id ? res.data : s);
      setScores(updated);
      onUpdate(updated);
      setEditId(null);
      showMsg('success', 'Score updated!');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this score?')) return;
    try {
      await api.delete(`/scores/${id}`);
      const updated = scores.filter(s => s._id !== id);
      setScores(updated);
      onUpdate(updated);
      showMsg('success', 'Score deleted');
    } catch (err) {
      showMsg('error', 'Delete failed');
    }
  };

  return (
    <div className="grid-2">
      {/* Add Score */}
      <div className="card">
        <h3 style={{ marginBottom: 24, fontSize: 20 }}>Add New Score</h3>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label>Stableford Score (1–45)</label>
            <input type="number" min="1" max="45" placeholder="e.g. 32" value={form.score}
              onChange={e => setForm({ ...form, score: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Date Played</label>
            <input type="date" value={form.date} max={new Date().toISOString().split('T')[0]}
              onChange={e => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Course (optional)</label>
            <input type="text" placeholder="e.g. Royal Birkdale" value={form.course}
              onChange={e => setForm({ ...form, course: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Adding...' : '+ Add Score'}
          </button>
        </form>
        <div style={{ marginTop: 16, padding: 12, background: 'rgba(34,197,94,0.05)', borderRadius: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--gray)' }}>
            📋 Only your <strong style={{ color: 'var(--gray-light)' }}>last 5 scores</strong> are kept. Adding a new one auto-removes the oldest. One score per date only.
          </p>
        </div>
      </div>

      {/* Score List */}
      <div className="card">
        <h3 style={{ marginBottom: 24, fontSize: 20 }}>My Scores ({scores.length}/5)</h3>
        {scores.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--gray)', padding: '40px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⛳</div>
            <p>No scores yet. Add your first score!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {scores.map(s => (
              <div key={s._id} style={{ background: 'var(--dark)', borderRadius: 10, padding: 16 }}>
                {editId === s._id ? (
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input type="number" min="1" max="45" value={editForm.score}
                        onChange={e => setEditForm({ ...editForm, score: e.target.value })}
                        style={{ width: 80, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--white)', fontFamily: 'var(--font-body)' }} />
                      <input type="text" placeholder="Course" value={editForm.course}
                        onChange={e => setEditForm({ ...editForm, course: e.target.value })}
                        style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--white)', fontFamily: 'var(--font-body)' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleSaveEdit(s._id)} className="btn btn-primary btn-sm">Save</button>
                      <button onClick={() => setEditId(null)} className="btn btn-secondary btn-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="score-circle">{s.score}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      {s.course && <div style={{ fontSize: 13, color: 'var(--gray)' }}>{s.course}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEdit(s)} className="btn btn-secondary btn-sm">Edit</button>
                      <button onClick={() => handleDelete(s._id)} className="btn btn-danger btn-sm">Del</button>
                    </div>
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
