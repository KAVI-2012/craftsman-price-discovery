import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, ShieldCheck, User as UserIcon, LogOut, Radio, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBreadcrumbTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Executive Overview';
      case '/discovery':
        return 'Market Price Discovery';
      case '/history':
        return 'Search History & Audit';
      case '/comparison':
        return 'Price Benchmarking Matrix';
      case '/reports':
        return 'Procurement Reports';
      case '/suppliers':
        return '7 Supplier Portals';
      case '/users':
        return 'User Management';
      case '/settings':
        return 'System Configuration';
      default:
        return 'Procurement Division';
    }
  };

  return (
    <header className="top-navbar">
      {/* Left: Breadcrumbs & Status */}
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2 text-secondary small fw-medium">
          <span style={{ color: 'var(--text-muted)' }}>Craftsman</span>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{getBreadcrumbTitle()}</span>
        </div>

        <div className="d-none d-md-flex align-items-center gap-2 ps-3 border-start" style={{ borderColor: 'var(--border-color)' }}>
          <span className="pulse-indicator"></span>
          <span className="text-secondary small fw-medium" style={{ fontSize: '0.8rem' }}>
            7 Portals Synchronized
          </span>
        </div>
      </div>

      {/* Right: Currency, Theme & Profile */}
      <div className="d-flex align-items-center gap-3">
        {/* Base Currency Pill */}
        <div
          className="d-none d-sm-inline-flex align-items-center px-2.5 py-1 rounded-2 text-secondary small fw-medium"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}
        >
          <span className="text-muted me-1">Base:</span>
          <strong style={{ color: 'var(--text-primary)' }}>INR (₹)</strong>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-sm btn-outline-secondary d-flex align-items-center p-2 rounded-2"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User Profile */}
        {user ? (
          <div className="d-flex align-items-center gap-2.5 border-start ps-3" style={{ borderColor: 'var(--border-color)' }}>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{
                width: 34,
                height: 34,
                background: user.role === 'admin' ? 'linear-gradient(135deg, #EF4444, #B91C1C)' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                fontSize: '0.82rem'
              }}
            >
              {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>

            <div className="d-none d-md-block text-start" style={{ lineHeight: 1.2 }}>
              <div className="fw-semibold small" style={{ color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                {user.full_name}
              </div>
              <div className="text-muted d-flex align-items-center gap-1.5 mt-0.5" style={{ fontSize: '0.72rem' }}>
                <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'} p-0.5 px-1.5`} style={{ fontSize: '0.62rem' }}>
                  {user.role.toUpperCase()}
                </span>
                <span>{user.department || 'Direct Sourcing'}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-sm text-secondary ms-1 p-1 hover-text-danger"
              title="Logout session"
              style={{ background: 'transparent', border: 'none' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className="craftsman-btn-primary btn-sm">
            Login
          </button>
        )}
      </div>
    </header>
  );
};
