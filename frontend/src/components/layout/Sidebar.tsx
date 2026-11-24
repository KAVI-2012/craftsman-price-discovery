import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRightLeft,
  Gavel,
  PiggyBank,
  Cpu,
  ChevronDown,
  ChevronUp,
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
    <path d="M3 13.5l4.5-6.5 4.5 4.5 7.5-8" />
    <circle cx="10" cy="16" r="3.2" />
    <path d="m12.3 18.3 2.7 2.7" />
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
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Collapsed / Expanded state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('craftsman_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('craftsman_sidebar_collapsed', String(newState));
  };

  // Accordion open/close state
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    discovery: true,
    connectors: false
  });

  const toggleGroup = (groupKey: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem('craftsman_sidebar_collapsed', 'false');
    }
    setOpenGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const isCurrentPath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
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
      {/* 1. Header with Logo & Toggle Button */}
      <div className={`sidebar-header ${isCollapsed ? 'collapsed' : ''}`}>
        {isCollapsed ? (
          /* Collapsed Header: Centered Logo + Centered Toggle Button Below */
          <>
            <div
              className="rounded-3 d-flex align-items-center justify-content-center shadow-sm"
              style={{
                width: 38,
                height: 38,
                background: '#FFFFFF',
                borderRadius: 10,
                padding: 4,
                margin: '0 auto',
                flexShrink: 0
              }}
              title="Craftsman Price Intelligence"
            >
              <div
                className="w-100 h-100 rounded-2 d-flex align-items-center justify-content-center text-white"
                style={{
                  background: 'linear-gradient(135deg, #1E40AF 0%, #06B6D4 100%)'
                }}
              >
                <Cpu size={20} className="text-white" />
              </div>
            </div>

            <button
              type="button"
              onClick={toggleSidebar}
              className="sidebar-toggle-btn shadow-sm"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
              style={{ margin: '0 auto' }}
            >
              <ChevronRight size={14} />
            </button>
          </>
        ) : (
          /* Expanded Header: Logo + Brand Title + Collapse Button (<) */
          <>
            <div className="d-flex align-items-center gap-2.5 overflow-hidden flex-grow-1">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                style={{
                  width: 38,
                  height: 38,
                  background: '#FFFFFF',
                  borderRadius: 10,
                  padding: 4
                }}
              >
                <div
                  className="w-100 h-100 rounded-2 d-flex align-items-center justify-content-center text-white"
                  style={{
                    background: 'linear-gradient(135deg, #1E40AF 0%, #06B6D4 100%)'
                  }}
                >
                  <Cpu size={20} className="text-white" />
                </div>
              </div>

              <div className="text-truncate" style={{ lineHeight: 1.15 }}>
                <div
                  className="fw-bold tracking-tight text-white"
                  style={{ fontSize: '0.94rem', letterSpacing: '-0.01em' }}
                >
                  CRAFTSMAN
                </div>
                <div
                  className="fw-semibold"
                  style={{ fontSize: '0.67rem', letterSpacing: '0.08em', color: '#38BDF8' }}
                >
                  PRICE INTELLIGENCE
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleSidebar}
              className="sidebar-toggle-btn shadow-sm"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <ChevronLeft size={14} />
            </button>
          </>
        )}
      </div>

      {/* 2. Navigation List Container (Using exact icons and names from Executive reference) */}
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

        {/* --- Item 2: Price Discovery Engine (Accordion with Submenu) --- */}
        <div className="sidebar-nav-item-wrap">
          <button
            type="button"
            onClick={() => toggleGroup('discovery')}
            className={`sidebar-nav-item ${
              isCurrentPath('/discovery') ? 'group-active' : ''
            }`}
            title={isCollapsed ? 'Price Discovery Engine' : undefined}
          >
            <span className="sidebar-icon-box">
              <PriceDiscoveryIcon
                size={20}
                className={isCurrentPath('/discovery') ? 'text-info' : ''}
              />
            </span>
            {!isCollapsed && (
              <>
                <span className="sidebar-item-label">Price Discovery Engine</span>
                <span className="sidebar-arrow-box">
                  {openGroups.discovery ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </span>
              </>
            )}
          </button>
          {isCollapsed && <div className="sidebar-tooltip">Price Discovery Engine</div>}

          {/* Tree sub-menu lines (when expanded) */}
          {!isCollapsed && openGroups.discovery && (
            <div className="sidebar-tree-container">
              <NavLink
                to="/discovery"
                end
                className={({ isActive }) =>
                  `sidebar-tree-item ${isActive && !location.search.includes('mode=excel') ? 'active' : ''}`
                }
              >
                Item Price Search
              </NavLink>

              <NavLink
                to="/discovery?mode=excel"
                className={() =>
                  `sidebar-tree-item ${location.search.includes('mode=excel') ? 'active' : ''}`
                }
              >
                Bulk Excel BOM Upload
              </NavLink>
            </div>
          )}
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

        {/* --- Item 5: Portal Connectors (Accordion with 7 Suppliers & Admin) --- */}
        <div className="sidebar-nav-item-wrap">
          <button
            type="button"
            onClick={() => toggleGroup('connectors')}
            className={`sidebar-nav-item ${
              isCurrentPath('/suppliers') || isCurrentPath('/users') || isCurrentPath('/settings') ? 'group-active' : ''
            }`}
            title={isCollapsed ? 'Portal Connectors' : undefined}
          >
            <span className="sidebar-icon-box">
              <PortalConnectorsIcon
                size={20}
                className={
                  isCurrentPath('/suppliers') || isCurrentPath('/users') || isCurrentPath('/settings')
                    ? 'text-info'
                    : ''
                }
              />
            </span>
            {!isCollapsed && (
              <>
                <span className="sidebar-item-label">Portal Connectors</span>
                <span className="sidebar-arrow-box">
                  {openGroups.connectors ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </span>
              </>
            )}
          </button>
          {isCollapsed && <div className="sidebar-tooltip">Portal Connectors</div>}

          {/* Tree sub-menu lines */}
          {!isCollapsed && openGroups.connectors && (
            <div className="sidebar-tree-container">
              <NavLink
                to="/suppliers"
                className={({ isActive }) =>
                  `sidebar-tree-item ${isActive ? 'active' : ''}`
                }
              >
                Supplier Portals (7 Active)
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/users"
                  className={({ isActive }) =>
                    `sidebar-tree-item ${isActive ? 'active' : ''}`
                  }
                >
                  User Management
                </NavLink>
              )}

              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `sidebar-tree-item ${isActive ? 'active' : ''}`
                }
              >
                System Settings
              </NavLink>
            </div>
          )}
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
