import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  History,
  Scale,
  FileSpreadsheet,
  Building2,
  Users,
  Settings,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  TrendingDown,
  UploadCloud
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, isAdmin } = useAuth();

  const coreNav = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { label: 'Price Discovery', path: '/discovery', icon: <Search size={18} />, badge: '7 Portals' },
    { label: 'Excel BOM Upload', path: '/discovery?mode=excel', icon: <UploadCloud size={18} />, badge: 'BOM' },
    { label: 'Search History', path: '/history', icon: <History size={18} /> },
  ];

  const analysisNav = [
    { label: 'Price Comparison', path: '/comparison', icon: <Scale size={18} /> },
    { label: 'Research Reports', path: '/reports', icon: <FileSpreadsheet size={18} /> },
  ];

  const adminNav = [
    { label: 'Supplier Portals', path: '/suppliers', icon: <Building2 size={18} />, badge: '7 Active' },
    ...(isAdmin ? [{ label: 'User Management', path: '/users', icon: <Users size={18} /> }] : []),
    { label: 'System Settings', path: '/settings', icon: <Settings size={18} /> }
  ];

  return (
    <aside className="sidebar-wrapper">
      {/* Brand Header */}
      <div className="brand-header p-3 border-bottom d-flex align-items-center gap-2.5" style={{ borderColor: 'var(--sidebar-border)', height: 64 }}>
        <div
          className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0"
          style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #1E40AF 0%, #06B6D4 100%)' }}
        >
          <Cpu size={22} />
        </div>
        <div className="brand-details">
          <div className="fw-bold tracking-tight text-white" style={{ fontSize: '0.94rem', letterSpacing: '0.01em', lineHeight: 1.15 }}>
            CRAFTSMAN
          </div>
          <div className="text-info fw-semibold" style={{ fontSize: '0.67rem', letterSpacing: '0.07em' }}>
            PRICE INTELLIGENCE
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="p-3 flex-grow-1 overflow-auto d-flex flex-column gap-3">
        {/* Section 1: Core Sourcing */}
        <div>
          <div className="sidebar-label text-uppercase fw-bold text-muted mb-1.5 px-2.5" style={{ fontSize: '0.66rem', letterSpacing: '0.08em' }}>
            Core Procurement
          </div>
          <nav className="nav flex-column gap-1">
            {coreNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center justify-content-between px-2.5 py-2 rounded-2 text-decoration-none transition-all ${
                    isActive
                      ? 'bg-primary text-white fw-semibold shadow-sm'
                      : 'text-secondary hover-bg text-light'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? '#2563EB' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontSize: '0.86rem'
                })}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <span className="opacity-90">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className="sidebar-badge badge px-2 py-0.5 rounded-pill"
                    style={{
                      fontSize: '0.65rem',
                      backgroundColor: 'rgba(56, 189, 248, 0.2)',
                      color: '#38BDF8'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Section 2: Analysis & Benchmarking */}
        <div>
          <div className="sidebar-label text-uppercase fw-bold text-muted mb-1.5 px-2.5" style={{ fontSize: '0.66rem', letterSpacing: '0.08em' }}>
            Intelligence & Analytics
          </div>
          <nav className="nav flex-column gap-1">
            {analysisNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center justify-content-between px-2.5 py-2 rounded-2 text-decoration-none transition-all ${
                    isActive
                      ? 'bg-primary text-white fw-semibold shadow-sm'
                      : 'text-secondary hover-bg text-light'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? '#2563EB' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontSize: '0.86rem'
                })}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <span className="opacity-90">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </div>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Section 3: Platform Administration */}
        <div>
          <div className="sidebar-label text-uppercase fw-bold text-muted mb-1.5 px-2.5" style={{ fontSize: '0.66rem', letterSpacing: '0.08em' }}>
            Administration
          </div>
          <nav className="nav flex-column gap-1">
            {adminNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center justify-content-between px-2.5 py-2 rounded-2 text-decoration-none transition-all ${
                    isActive
                      ? 'bg-primary text-white fw-semibold shadow-sm'
                      : 'text-secondary hover-bg text-light'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? '#2563EB' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontSize: '0.86rem'
                })}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <span className="opacity-90">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className="sidebar-badge badge px-2 py-0.5 rounded-pill"
                    style={{
                      fontSize: '0.65rem',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      color: '#10B981'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Supplier Connectivity Widget */}
      <div className="engine-widget p-3 m-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="d-flex align-items-center justify-content-between mb-1.5">
          <div className="d-flex align-items-center gap-2">
            <span className="pulse-indicator"></span>
            <span className="fw-semibold small text-white" style={{ fontSize: '0.78rem' }}>Discovery Engine</span>
          </div>
          <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.65rem' }}>
            ONLINE
          </span>
        </div>
        <p className="text-secondary small mb-2" style={{ fontSize: '0.72rem', lineHeight: 1.3 }}>
          7 industrial supplier connectors listening with automated fallback.
        </p>
        <div className="progress" style={{ height: 4, background: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="progress-bar bg-info" style={{ width: '100%' }}></div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-2.5 px-3 border-top text-center text-muted small d-none d-lg-block" style={{ borderColor: 'var(--sidebar-border)', fontSize: '0.68rem' }}>
        Craftsman Automation v2.4 Enterprise
      </div>
    </aside>
  );
};
