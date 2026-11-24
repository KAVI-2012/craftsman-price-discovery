import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutGrid,
  FolderTree,
  Cpu,
  BarChart3,
  Settings,
  Bell,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  UploadCloud,
  History,
  Scale,
  FileSpreadsheet,
  Building2,
  Users,
  Activity,
  Bot,
  Sparkles
} from 'lucide-react';

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
    intelligence: false,
    admin: false
  });

  const toggleGroup = (groupKey: string) => {
    if (isCollapsed) {
      // If collapsed, expand the sidebar when clicking an accordion group
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
      {/* 1. Header with Logo & Circular Toggle Button */}
      <div
        className="d-flex align-items-center justify-content-between p-3 border-bottom"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.08)',
          height: 64,
          position: 'relative'
        }}
      >
        <div className="d-flex align-items-center gap-2.5 overflow-hidden">
          {/* Logo badge with white rounded card */}
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

          {/* Brand Name (Hidden when collapsed) */}
          {!isCollapsed && (
            <div className="text-truncate" style={{ lineHeight: 1.15 }}>
              <div
                className="fw-bold tracking-tight text-white"
                style={{ fontSize: '0.94rem', letterSpacing: '-0.01em' }}
              >
                CRAFTSMAN
              </div>
              <div
                className="text-info fw-semibold"
                style={{ fontSize: '0.67rem', letterSpacing: '0.08em' }}
              >
                PRICE INTELLIGENCE
              </div>
            </div>
          )}
        </div>

        {/* Circular Toggle Button (< or >) */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="sidebar-toggle-btn shadow-sm"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* 2. Navigation List Container */}
      <div className="p-3 flex-grow-1 overflow-auto d-flex flex-column gap-2.5">
        {/* --- Top Nav: Dashboard --- */}
        <div className="position-relative collapsed-item-wrap">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${
                isCollapsed ? 'justify-content-center' : 'justify-content-start'
              } gap-3 px-3 py-2.5 text-decoration-none transition-all ${
                isActive ? 'nav-active-pill' : 'text-secondary hover-bg'
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? '#2563EB' : 'transparent',
              color: isActive ? '#FFFFFF' : '#94A3B8',
              borderRadius: 12,
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.88rem'
            })}
          >
            <LayoutGrid size={19} className="flex-shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>
          {isCollapsed && <div className="sidebar-tooltip">Dashboard</div>}
        </div>

        {/* --- Group 1: Market Discovery (Accordion with Tree Lines) --- */}
        <div className="position-relative collapsed-item-wrap">
          <button
            type="button"
            onClick={() => toggleGroup('discovery')}
            className={`sidebar-group-btn ${
              isCollapsed ? 'justify-content-center px-0' : ''
            } ${isCurrentPath('/discovery') || isCurrentPath('/history') ? 'text-white' : ''}`}
            title={isCollapsed ? 'Market Discovery' : undefined}
          >
            <div className="d-flex align-items-center gap-3">
              <FolderTree
                size={19}
                style={{
                  color: isCurrentPath('/discovery') || isCurrentPath('/history') ? '#38BDF8' : '#94A3B8'
                }}
                className="flex-shrink-0"
              />
              {!isCollapsed && <span>Market Discovery</span>}
            </div>
            {!isCollapsed && (
              <span className="text-secondary opacity-75">
                {openGroups.discovery ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </span>
            )}
          </button>
          {isCollapsed && <div className="sidebar-tooltip">Market Discovery</div>}

          {/* Tree sub-menu lines (when expanded) */}
          {!isCollapsed && openGroups.discovery && (
            <div className="sidebar-tree-container">
              <NavLink
                to="/discovery"
                end
                className={({ isActive }) =>
                  `sidebar-tree-item ${isActive ? 'active' : ''}`
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

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `sidebar-tree-item ${isActive ? 'active' : ''}`
                }
              >
                Search History
              </NavLink>
            </div>
          )}
        </div>

        {/* --- Group 2: Price Intelligence (Accordion with Tree Lines) --- */}
        <div className="position-relative collapsed-item-wrap">
          <button
            type="button"
            onClick={() => toggleGroup('intelligence')}
            className={`sidebar-group-btn ${
              isCollapsed ? 'justify-content-center px-0' : ''
            } ${isCurrentPath('/comparison') || isCurrentPath('/reports') ? 'text-white' : ''}`}
            title={isCollapsed ? 'Price Intelligence' : undefined}
          >
            <div className="d-flex align-items-center gap-3">
              <Cpu
                size={19}
                style={{
                  color: isCurrentPath('/comparison') || isCurrentPath('/reports') ? '#38BDF8' : '#94A3B8'
                }}
                className="flex-shrink-0"
              />
              {!isCollapsed && <span>Price Intelligence</span>}
            </div>
            {!isCollapsed && (
              <span className="text-secondary opacity-75">
                {openGroups.intelligence ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </span>
            )}
          </button>
          {isCollapsed && <div className="sidebar-tooltip">Price Intelligence</div>}

          {/* Tree sub-menu lines */}
          {!isCollapsed && openGroups.intelligence && (
            <div className="sidebar-tree-container">
              <NavLink
                to="/comparison"
                className={({ isActive }) =>
                  `sidebar-tree-item ${isActive ? 'active' : ''}`
                }
              >
                Price Comparison Matrix
              </NavLink>

              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `sidebar-tree-item ${isActive ? 'active' : ''}`
                }
              >
                Research & Cost Reports
              </NavLink>
            </div>
          )}
        </div>

        {/* --- Group 3: Settings & Admin (Accordion with Tree Lines) --- */}
        <div className="position-relative collapsed-item-wrap">
          <button
            type="button"
            onClick={() => toggleGroup('admin')}
            className={`sidebar-group-btn ${
              isCollapsed ? 'justify-content-center px-0' : ''
            } ${isCurrentPath('/suppliers') || isCurrentPath('/users') || isCurrentPath('/settings') ? 'text-white' : ''}`}
            title={isCollapsed ? 'Settings & Admin' : undefined}
          >
            <div className="d-flex align-items-center gap-3">
              <Settings
                size={19}
                style={{
                  color:
                    isCurrentPath('/suppliers') || isCurrentPath('/users') || isCurrentPath('/settings')
                      ? '#38BDF8'
                      : '#94A3B8'
                }}
                className="flex-shrink-0"
              />
              {!isCollapsed && <span>Settings & Admin</span>}
            </div>
            {!isCollapsed && (
              <span className="text-secondary opacity-75">
                {openGroups.admin ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </span>
            )}
          </button>
          {isCollapsed && <div className="sidebar-tooltip">Settings & Admin</div>}

          {/* Tree sub-menu lines */}
          {!isCollapsed && openGroups.admin && (
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

        {/* --- Single Item: Price Alerts / Notifications --- */}
        <div className="position-relative collapsed-item-wrap">
          <NavLink
            to="/discovery"
            className={({ isActive }) =>
              `sidebar-group-btn text-decoration-none ${
                isCollapsed ? 'justify-content-center px-0' : ''
              }`
            }
          >
            <div className="d-flex align-items-center gap-3">
              <Bell size={19} className="text-secondary flex-shrink-0" />
              {!isCollapsed && <span>Notifications & Alerts</span>}
            </div>
          </NavLink>
          {isCollapsed && <div className="sidebar-tooltip">Notifications & Alerts</div>}
        </div>

        {/* --- Single Item: History / Archive --- */}
        <div className="position-relative collapsed-item-wrap">
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `sidebar-group-btn text-decoration-none ${
                isCollapsed ? 'justify-content-center px-0' : ''
              }`
            }
          >
            <div className="d-flex align-items-center gap-3">
              <Trash2 size={19} className="text-secondary flex-shrink-0" />
              {!isCollapsed && <span>Archived Searches</span>}
            </div>
          </NavLink>
          {isCollapsed && <div className="sidebar-tooltip">Archived Searches</div>}
        </div>
      </div>

      {/* 3. Bottom 3D AI Robot / Mascot Widget (from Sample Design!) */}
      <div className="p-3 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
        {isCollapsed ? (
          /* Collapsed Mini Bot Avatar */
          <div
            className="d-flex justify-content-center align-items-center position-relative collapsed-item-wrap"
            style={{ height: 48 }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{
                width: 42,
                height: 42,
                background: 'linear-gradient(135deg, #1E40AF 0%, #06B6D4 100%)',
                border: '2px solid rgba(56, 189, 248, 0.5)'
              }}
            >
              <Bot size={22} className="text-white" />
            </div>
            {/* Pulsing online green dot */}
            <span
              className="position-absolute rounded-circle"
              style={{
                width: 9,
                height: 9,
                background: '#10B981',
                bottom: 2,
                right: 14,
                border: '2px solid #080E24'
              }}
            ></span>
            <div className="sidebar-tooltip">AI Discovery Engine: Online</div>
          </div>
        ) : (
          /* Expanded Full AI Mascot Card */
          <div className="ai-mascot-container p-2.5 d-flex align-items-center gap-2.5">
            {/* Robot 3D Badge Avatar */}
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow"
              style={{
                width: 42,
                height: 42,
                background: 'linear-gradient(135deg, #1E40AF 0%, #06B6D4 100%)',
                border: '2px solid rgba(56, 189, 248, 0.4)'
              }}
            >
              <Bot size={22} className="text-white" />
            </div>

            <div className="flex-grow-1 overflow-hidden" style={{ lineHeight: 1.2 }}>
              <div className="d-flex align-items-center gap-1.5">
                <span className="fw-bold text-white small" style={{ fontSize: '0.8rem' }}>
                  AI Price Agent
                </span>
                <span
                  className="rounded-circle"
                  style={{
                    width: 7,
                    height: 7,
                    backgroundColor: '#10B981',
                    display: 'inline-block'
                  }}
                ></span>
              </div>
              <div className="text-secondary small text-truncate" style={{ fontSize: '0.68rem' }}>
                7/7 Portals Listening • Live
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
