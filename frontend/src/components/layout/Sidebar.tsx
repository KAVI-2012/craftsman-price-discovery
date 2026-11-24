import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutGrid,
  FolderTree,
  Cpu,
  Settings,
  Bell,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
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
      {/* 1. Header with Logo & Toggle Button */}
      <div className={`sidebar-header ${isCollapsed ? 'collapsed' : ''}`}>
        {isCollapsed ? (
          /* Collapsed Header: Centered Logo + Centered Toggle Button (No overlap, perfectly aligned inside header) */
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

              {/* Brand Name */}
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

            {/* Circular Collapse Button (<) */}
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

      {/* 2. Navigation List Container (Uses full vertical space) */}
      <div className="sidebar-nav-container">
        {/* --- Top Nav: Dashboard --- */}
        <div className="sidebar-nav-item-wrap">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            title={isCollapsed ? 'Dashboard' : undefined}
          >
            <span className="sidebar-icon-box">
              <LayoutGrid size={20} />
            </span>
            {!isCollapsed && <span className="sidebar-item-label">Dashboard</span>}
          </NavLink>
          {isCollapsed && <div className="sidebar-tooltip">Dashboard</div>}
        </div>

        {/* --- Group 1: Market Discovery (Accordion with Tree Lines) --- */}
        <div className="sidebar-nav-item-wrap">
          <button
            type="button"
            onClick={() => toggleGroup('discovery')}
            className={`sidebar-nav-item ${
              isCurrentPath('/discovery') || isCurrentPath('/history') ? 'group-active' : ''
            }`}
            title={isCollapsed ? 'Market Discovery' : undefined}
          >
            <span className="sidebar-icon-box">
              <FolderTree
                size={20}
                style={{
                  color: isCurrentPath('/discovery') || isCurrentPath('/history') ? '#38BDF8' : 'currentColor'
                }}
              />
            </span>
            {!isCollapsed && (
              <>
                <span className="sidebar-item-label">Market Discovery</span>
                <span className="sidebar-arrow-box">
                  {openGroups.discovery ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </span>
              </>
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
        <div className="sidebar-nav-item-wrap">
          <button
            type="button"
            onClick={() => toggleGroup('intelligence')}
            className={`sidebar-nav-item ${
              isCurrentPath('/comparison') || isCurrentPath('/reports') ? 'group-active' : ''
            }`}
            title={isCollapsed ? 'Price Intelligence' : undefined}
          >
            <span className="sidebar-icon-box">
              <Cpu
                size={20}
                style={{
                  color: isCurrentPath('/comparison') || isCurrentPath('/reports') ? '#38BDF8' : 'currentColor'
                }}
              />
            </span>
            {!isCollapsed && (
              <>
                <span className="sidebar-item-label">Price Intelligence</span>
                <span className="sidebar-arrow-box">
                  {openGroups.intelligence ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </span>
              </>
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
        <div className="sidebar-nav-item-wrap">
          <button
            type="button"
            onClick={() => toggleGroup('admin')}
            className={`sidebar-nav-item ${
              isCurrentPath('/suppliers') || isCurrentPath('/users') || isCurrentPath('/settings') ? 'group-active' : ''
            }`}
            title={isCollapsed ? 'Settings & Admin' : undefined}
          >
            <span className="sidebar-icon-box">
              <Settings
                size={20}
                style={{
                  color:
                    isCurrentPath('/suppliers') || isCurrentPath('/users') || isCurrentPath('/settings')
                      ? '#38BDF8'
                      : 'currentColor'
                }}
              />
            </span>
            {!isCollapsed && (
              <>
                <span className="sidebar-item-label">Settings & Admin</span>
                <span className="sidebar-arrow-box">
                  {openGroups.admin ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </span>
              </>
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

        {/* --- Single Item: Notifications & Alerts --- */}
        <div className="sidebar-nav-item-wrap">
          <NavLink
            to="/discovery"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive && location.search.includes('alerts') ? 'active' : ''}`
            }
            title={isCollapsed ? 'Notifications & Alerts' : undefined}
          >
            <span className="sidebar-icon-box">
              <Bell size={20} />
            </span>
            {!isCollapsed && <span className="sidebar-item-label">Notifications & Alerts</span>}
          </NavLink>
          {isCollapsed && <div className="sidebar-tooltip">Notifications & Alerts</div>}
        </div>

        {/* --- Single Item: Archived Searches --- */}
        <div className="sidebar-nav-item-wrap">
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            title={isCollapsed ? 'Archived Searches' : undefined}
          >
            <span className="sidebar-icon-box">
              <Trash2 size={20} />
            </span>
            {!isCollapsed && <span className="sidebar-item-label">Archived Searches</span>}
          </NavLink>
          {isCollapsed && <div className="sidebar-tooltip">Archived Searches</div>}
        </div>
      </div>
    </aside>
  );
};
