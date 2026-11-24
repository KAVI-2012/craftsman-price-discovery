import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
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
        return 'Price Discovery Engine';
      case '/history':
        return 'Audit & Savings';
      case '/comparison':
        return 'Supplier Benchmarking';
      case '/reports':
        return 'RFQ & Negotiations';
      case '/suppliers':
        return 'Portal Connectors';
      case '/users':
        return 'User Management';
      case '/settings':
        return 'System Configuration';
      default:
        return 'Procurement Division';
    }
  };

  return (
    <header
      className="top-navbar d-flex align-items-center justify-content-between px-4 border-bottom"
      style={{
        height: 64,
        backgroundColor: 'var(--header-bg)',
        borderColor: 'var(--border-color)',
        zIndex: 50
      }}
    >
      {/* Left: Breadcrumbs & Live Status Indicator */}
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2 text-secondary small fw-medium">
          <span style={{ color: 'var(--text-muted)' }}>Craftsman</span>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{getBreadcrumbTitle()}</span>
        </div>

        <div
          className="d-none d-md-flex align-items-center gap-2 ps-3 border-start"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <span className="pulse-indicator"></span>
          <span className="text-secondary small fw-medium" style={{ fontSize: '0.8rem' }}>
            7 Portals Synchronized
          </span>
        </div>
      </div>

      {/* Right: Base Currency, Theme Toggle & Corporate User Profile */}
      <div className="d-flex align-items-center gap-3">
        {/* Base Currency Pill */}
        <div
          className="d-none d-sm-inline-flex align-items-center px-2.5 py-1 rounded-2 text-secondary small fw-medium"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            fontSize: '0.78rem'
          }}
        >
          <span className="text-muted me-1">Base:</span>
          <strong style={{ color: 'var(--text-primary)' }}>INR (₹)</strong>
        </div>

        {/* User Profile matching reference */}
        {user ? (
          <div
            className="d-flex align-items-center gap-2.5 border-start ps-3"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {/* Avatar Circle */}
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0"
              style={{
                width: 32,
                height: 32,
                background:
                  user.role === 'admin'
                    ? 'linear-gradient(135deg, #2563EB, #1D4ED8)'
                    : 'linear-gradient(135deg, #1D4ED8, #0284C7)',
                fontSize: '0.82rem'
              }}
            >
              {user.full_name ? user.full_name[0].toUpperCase() : 'R'}
            </div>

            {/* User details */}
            <div className="d-none d-md-block text-start" style={{ lineHeight: 1.25 }}>
              <div
                className="fw-semibold small"
                style={{ color: 'var(--text-primary)', fontSize: '0.82rem' }}
              >
                {user.full_name || 'Rajesh Kumar'} {user.full_name?.includes('(') ? '' : '(Senior Buyer)'}
              </div>
              <div
                className="text-muted d-flex align-items-center gap-1.5 mt-0.5"
                style={{ fontSize: '0.7rem' }}
              >
                <span
                  className="badge bg-primary p-0.5 px-1.5 fw-bold text-uppercase"
                  style={{ fontSize: '0.6rem', letterSpacing: '0.04em' }}
                >
                  PROCUREMENT
                </span>
                <span>{user.department || 'Direct Material Sourcing'}</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn btn-sm text-secondary ms-1 p-1 hover-text-danger"
              title="Logout session"
              style={{ background: 'transparent', border: 'none' }}
              aria-label="Logout"
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
