import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Golf<span>Give</span>
      </Link>
      <div className="navbar-links">
        <Link to="/charities" className="btn btn-secondary btn-sm">Charities</Link>
        <Link to="/draws" className="btn btn-secondary btn-sm">Draws</Link>
        {user ? (
          <>
            <Link to="/dashboard" className="btn btn-secondary btn-sm">Dashboard</Link>
            {user.role === 'admin' && <Link to="/admin" className="btn btn-gold btn-sm">Admin</Link>}
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Join Now</Link>
          </>
        )}
      </div>
    </nav>
  );
}
