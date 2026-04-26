import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', country: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
    try {
      await register(form.name, form.email, form.password, form.country);
      navigate('/subscribe');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Create Account</h1>
          <p style={{ color: 'var(--gray-light)' }}>Join GolfGive and make every round count</p>
        </div>
        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input placeholder="John Smith" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min. 6 characters" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Country <span style={{ color: 'var(--gray)' }}>(optional)</span></label>
              <input placeholder="e.g. United Kingdom" value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value })} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account & Continue →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--gray-light)', fontSize: 14 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
