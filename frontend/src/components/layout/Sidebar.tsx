import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowRightLeft,
  Gavel,
  PiggyBank,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

/* --------------------------------------------------------------------------
   CUSTOM SVG ICONS MATCHING EXECUTIVE PROCUREMENT REFERENCE (media_1795511381779_73d0bc04)
   -------------------------------------------------------------------------- */

// 1. Executive Overview Icon: Card Screen with 3 Vertical Bar Charts
const ExecutiveOverviewIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2.5" />
    <path d="M8 17v-3" />
    <path d="M12 17v-6" />
    <path d="M16 17v-8" />
  </svg>
);

// 2. Price Discovery Engine Icon: Trending Up Line Graph with Magnifying Glass
const PriceDiscoveryIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3.5 13l4.5-6.5 4.5 4.5 8-8" />
    <circle cx="10.5" cy="16" r="3.2" />
    <path d="m12.8 18.3 2.7 2.7" />
  </svg>
);

// 5. Portal Connectors Icon: Central Hub Node connected radially to outer nodes
const PortalConnectorsIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="2.5" />
    <circle cx="12" cy="4" r="1.8" />
    <circle cx="4.5" cy="9.5" r="1.8" />
    <circle cx="19.5" cy="9.5" r="1.8" />
    <circle cx="7" cy="19" r="1.8" />
    <circle cx="17" cy="19" r="1.8" />
    <line x1="12" y1="9.5" x2="12" y2="5.8" />
    <line x1="9.8" y1="10.8" x2="6.3" y2="9.8" />
    <line x1="14.2" y1="10.8" x2="17.7" y2="9.8" />
    <line x1="10.2" y1="14" x2="8.2" y2="17.3" />
    <line x1="13.8" y1="14" x2="15.8" y2="17.3" />
  </svg>
);

export const Sidebar: React.FC = () => {
  // Collapsed / Expanded state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('craftsman_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('craftsman_sidebar_collapsed', String(newState));
  };

  return (
    <aside
      className={`sidebar-wrapper ${isCollapsed ? 'collapsed' : ''}`}
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}
    >
      {/* 1. Header with Logo & Border Toggle Button (Fixed on top right edge, straddling sidebar border) */}
      <div className="sidebar-header">
        <div className="d-flex align-items-center overflow-hidden flex-grow-1">
          {/* Logo container - centered in collapsed mode */}
          <div className="sidebar-logo-container flex-shrink-0">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center shadow-sm overflow-hidden"
              style={{
                width: 38,
                height: 38,
                background: '#FFFFFF',
                borderRadius: 10,
                padding: 2
              }}
              title="Craftsman Automation Price Intelligence"
            >
              <img
                src="/craftsman-logo.png"
                alt="Craftsman Automation Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>

          {/* Brand Name (Spacious gap from logo, smoothly collapses in collapsed mode) */}
          {!isCollapsed && (
            <div className="sidebar-brand-text text-truncate" style={{ lineHeight: 1.2, marginLeft: 14 }}>
              <div
                className="fw-bold tracking-tight text-white"
                style={{ fontSize: '0.94rem', letterSpacing: '-0.01em' }}
              >
                CRAFTSMAN
              </div>
              <div
                className="fw-semibold"
                style={{ fontSize: '0.67rem', letterSpacing: '0.08em', color: '#38BDF8', marginTop: 2 }}
              >
                PRICE INTELLIGENCE
              </div>
            </div>
          )}
        </div>

        {/* Circular Toggle Button fixed on top right border seam */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="sidebar-toggle-btn shadow-sm"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* 2. Navigation List Container (Unified 6 core procurement screens) */}
      <div className="sidebar-nav-container">
        {/* --- Item 1: Executive Overview --- */}
        <div className="sidebar-nav-item-wrap">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            title={isCollapsed ? 'Executive Overview' : undefined}
          >
            <span className="sidebar-icon-box">
              <ExecutiveOverviewIcon size={20} />
            </span>
            {!isCollapsed && <span className="sidebar-item-label">Executive Overview</span>}
          </NavLink>
          {isCollapsed && <div className="sidebar-tooltip">Executive Overview</div>}
        </div>

        {/* --- Item 2: Price Discovery Engine (Direct NavLink combining Item Search & Bulk Upload) --- */}
        <div className="sidebar-nav-item-wrap">
          <NavLink
            to="/discovery"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            title={isCollapsed ? 'Price Discovery Engine' : undefined}
          >
            <span className="sidebar-icon-box">
              <PriceDiscoveryIcon size={20} />
            </span>
            {!isCollapsed && <span className="sidebar-item-label">Price Discovery Engine</span>}
          </NavLink>
          {isCollapsed && <div className="sidebar-tooltip">Price Discovery Engine</div>}
        </div>

        {/* --- Item 3: Supplier Benchmarking --- */}
        <div className="sidebar-nav-item-wrap">
          <NavLink
            to="/comparison"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            title={isCollapsed ? 'Supplier Benchmarking' : undefined}
          >
            <span className="sidebar-icon-box">
              <ArrowRightLeft size={20} />
            </span>
            {!isCollapsed && <span className="sidebar-item-label">Supplier Benchmarking</span>}
          </NavLink>
          {isCollapsed && <div className="sidebar-tooltip">Supplier Benchmarking</div>}
        </div>

        {/* --- Item 4: RFQ & Negotiations --- */}
        <div className="sidebar-nav-item-wrap">
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            title={isCollapsed ? 'RFQ & Negotiations' : undefined}
          >
            <span className="sidebar-icon-box">
              <Gavel size={20} />
            </span>
            {!isCollapsed && <span className="sidebar-item-label">RFQ & Negotiations</span>}
          </NavLink>
          {isCollapsed && <div className="sidebar-tooltip">RFQ & Negotiations</div>}
        </div>

        {/* --- Item 5: Portal Connectors --- */}
        <div className="sidebar-nav-item-wrap">
          <NavLink
            to="/suppliers"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            title={isCollapsed ? 'Portal Connectors' : undefined}
          >
            <span className="sidebar-icon-box">
              <PortalConnectorsIcon size={20} />
            </span>
            {!isCollapsed && <span className="sidebar-item-label">Portal Connectors</span>}
          </NavLink>
          {isCollapsed && <div className="sidebar-tooltip">Portal Connectors</div>}
        </div>

        {/* --- Item 6: Audit & Savings --- */}
        <div className="sidebar-nav-item-wrap">
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            title={isCollapsed ? 'Audit & Savings' : undefined}
          >
            <span className="sidebar-icon-box">
              <PiggyBank size={20} />
            </span>
            {!isCollapsed && <span className="sidebar-item-label">Audit & Savings</span>}
          </NavLink>
          {isCollapsed && <div className="sidebar-tooltip">Audit & Savings</div>}
        </div>
      </div>
    </aside>
  );
};
