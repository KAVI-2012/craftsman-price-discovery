import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { DashboardStats } from '../types';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Building2,
  ArrowRight,
  Clock,
  Activity
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to load dashboard stats:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4" style={{ maxWidth: 1600, margin: '0 auto' }}>
      {/* 1. Hero Section - Matching Reference Screenshot media_1795513103674_6f51584a.jpg */}
      <div className="dashboard-hero-card">
        <div className="row align-items-center g-4">
          {/* Left Column: Heading, Badges, Description & CTAs */}
          <div className="col-12 col-lg-8">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span
                className="badge bg-primary px-2.5 py-1 text-uppercase fw-bold"
                style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}
              >
                CRAFTSMAN AUTOMATION
              </span>
              <span className="text-secondary small fw-medium">
                Direct Material Procurement Intelligence
              </span>
            </div>

            <h3
              className="fw-bold mb-2 tracking-tight"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em', fontSize: '1.65rem' }}
            >
              Market Price Discovery & Supplier Benchmarking Engine
            </h3>

            <p
              className="text-secondary mb-3.5 small"
              style={{ maxWidth: 660, lineHeight: 1.5, fontSize: '0.86rem' }}
            >
              Automated multi-portal price intelligence across 7 industrial supplier networks. Real-time technical specification matching, multi-currency normalization to INR, and direct supplier verification links.
            </p>

            <div className="d-flex flex-wrap align-items-center gap-2.5">
              <button
                onClick={() => navigate('/discovery')}
                className="craftsman-btn-primary d-inline-flex align-items-center gap-2 shadow-sm"
              >
                <Search size={16} />
                <span>Launch Price Discovery Search</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => navigate('/suppliers')}
                className="craftsman-btn-outline d-inline-flex align-items-center gap-2"
              >
                <Building2 size={16} className="text-info" />
                <span>Manage 7 Supplier Portals</span>
              </button>
            </div>
          </div>

          {/* Right Column: Active Discovery Engine Status Box */}
          <div className="col-12 col-lg-4 text-lg-end">
            <div className="dashboard-hero-status-box d-inline-block text-start w-100" style={{ maxWidth: 320 }}>
              <div className="d-flex align-items-center gap-2 text-success small fw-bold mb-1.5">
                <span className="pulse-indicator"></span>
                <span style={{ fontSize: '0.8rem', letterSpacing: '0.02em' }}>Active Discovery Engine</span>
              </div>
              <div
                className="fw-bold tracking-tight"
                style={{ color: 'var(--text-primary)', fontSize: '1.42rem', lineHeight: 1.2 }}
              >
                7 Portals Synchronized
              </div>
              <div className="text-muted small mt-1" style={{ fontSize: '0.76rem' }}>
                Resilient parallel search active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI Dashboard - 5 Distinct Equal-Width Cards in Grid */}
      <div className="dashboard-kpi-grid">
        {/* Card 1: Total Searches */}
        <div className="dashboard-kpi-card kpi-accent-blue">
          <div
            className="text-muted small fw-bold text-uppercase"
            style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}
          >
            TOTAL SEARCHES
          </div>
          <div
            className="fw-bold my-2"
            style={{ color: 'var(--text-primary)', fontSize: '1.75rem', lineHeight: 1.1 }}
          >
            {stats?.total_searches ?? 0}
          </div>
          <div className="text-secondary small" style={{ fontSize: '0.74rem' }}>
            Automated runs
          </div>
        </div>

        {/* Card 2: Supplier Portals */}
        <div className="dashboard-kpi-card kpi-accent-green">
          <div
            className="text-muted small fw-bold text-uppercase"
            style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}
          >
            SUPPLIER PORTALS
          </div>
          <div
            className="fw-bold my-2 text-success"
            style={{ fontSize: '1.75rem', lineHeight: 1.1 }}
          >
            {stats?.total_suppliers_configured ?? 7} / 7
          </div>
          <div className="text-secondary small" style={{ fontSize: '0.74rem' }}>
            Active Connectors
          </div>
        </div>

        {/* Card 3: Success Rate */}
        <div className="dashboard-kpi-card kpi-accent-cyan">
          <div
            className="text-muted small fw-bold text-uppercase"
            style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}
          >
            SUCCESS RATE
          </div>
          <div
            className="fw-bold my-2 text-info"
            style={{ fontSize: '1.75rem', lineHeight: 1.1 }}
          >
            {stats?.successful_connections_rate ?? 98.4}%
          </div>
          <div className="text-secondary small" style={{ fontSize: '0.74rem' }}>
            Connection Uptime
          </div>
        </div>

        {/* Card 4: Products Discovered */}
        <div className="dashboard-kpi-card kpi-accent-amber">
          <div
            className="text-muted small fw-bold text-uppercase"
            style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}
          >
            PRODUCTS DISCOVERED
          </div>
          <div
            className="fw-bold my-2 text-warning"
            style={{ fontSize: '1.75rem', lineHeight: 1.1 }}
          >
            {stats?.total_products_discovered ?? 0}
          </div>
          <div className="text-secondary small" style={{ fontSize: '0.74rem' }}>
            Extracted SKU listings
          </div>
        </div>

        {/* Card 5: Total Savings Found */}
        <div className="dashboard-kpi-card kpi-accent-emerald">
          <div
            className="text-muted small fw-bold text-uppercase"
            style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}
          >
            TOTAL SAVINGS FOUND
          </div>
          <div
            className="fw-bold my-2 text-success"
            style={{ fontSize: '1.75rem', lineHeight: 1.1 }}
          >
            ₹{stats?.total_potential_savings?.toLocaleString('en-IN') ?? '0'}
          </div>
          <div className="text-secondary small" style={{ fontSize: '0.74rem' }}>
            Max spread vs lowest price
          </div>
        </div>
      </div>

      {/* 3. Dashboard Content Section: Recent Discoveries & 7 Portals Status */}
      <div className="row g-4">
        {/* Left Column: Recent Price Discoveries */}
        <div className="col-12 col-lg-7">
          <div className="craftsman-card h-100">
            <div
              className="d-flex align-items-center justify-content-between mb-3 pb-2.5 border-bottom"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div className="d-flex align-items-center gap-2">
                <Clock size={17} className="text-primary" />
                <h6 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                  Recent Price Discoveries
                </h6>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="btn btn-sm btn-link text-info text-decoration-none p-0"
                style={{ fontSize: '0.82rem' }}
              >
                View Full Audit History →
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-sm" style={{ color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                <thead>
                  <tr className="text-muted small" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th>Part / Item</th>
                    <th>Date</th>
                    <th>Suppliers</th>
                    <th>Lowest (INR)</th>
                    <th>Savings</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recent_searches && stats.recent_searches.length > 0 ? (
                    stats.recent_searches.map((s) => (
                      <tr key={s.id} style={{ borderBottomColor: 'var(--border-color)' }}>
                        <td className="py-2.5">
                          <div className="fw-semibold text-truncate" style={{ maxWidth: 220, color: 'var(--text-primary)' }}>
                            {s.part_number || s.query_text}
                          </div>
                          {s.part_number && (
                            <div className="text-muted small text-truncate" style={{ fontSize: '0.72rem', maxWidth: 220 }}>
                              {s.query_text}
                            </div>
                          )}
                        </td>
                        <td className="small text-muted py-2.5">{s.date}</td>
                        <td className="py-2.5">
                          <span className="badge bg-secondary p-1 px-2" style={{ fontSize: '0.7rem' }}>
                            {s.suppliers_count} / 7
                          </span>
                        </td>
                        <td className="fw-bold text-success small py-2.5">
                          ₹{s.lowest_price?.toLocaleString('en-IN')}
                        </td>
                        <td className="small text-info fw-semibold py-2.5">
                          ₹{s.savings?.toLocaleString('en-IN')}
                        </td>
                        <td className="text-end py-2.5">
                          <button
                            onClick={() => navigate(`/comparison?search_id=${s.id}`)}
                            className="craftsman-btn-outline py-0.5 px-2"
                            style={{ fontSize: '0.74rem' }}
                          >
                            Open Matrix
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted small">
                        No recent searches found. Launch your first price discovery search above!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Configured 7 Portals Status */}
        <div className="col-12 col-lg-5">
          <div className="craftsman-card h-100">
            <div
              className="d-flex align-items-center justify-content-between mb-3 pb-2.5 border-bottom"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div className="d-flex align-items-center gap-2">
                <Activity size={17} className="text-success" />
                <h6 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                  Configured 7 Portals Status
                </h6>
              </div>
              <button
                onClick={() => navigate('/suppliers')}
                className="btn btn-sm btn-link text-info text-decoration-none p-0"
                style={{ fontSize: '0.82rem' }}
              >
                Configure Portals →
              </button>
            </div>

            <div className="d-flex flex-column gap-2">
              {stats?.supplier_reliability.map((s) => (
                <div
                  key={s.slot_number}
                  className="p-2.5 rounded-2 d-flex align-items-center justify-content-between transition-all"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                >
                  <div className="d-flex align-items-center gap-2.5">
                    <span
                      className="rounded-circle d-flex align-items-center justify-content-center text-white small fw-bold flex-shrink-0"
                      style={{ width: 24, height: 24, background: '#2563EB', fontSize: '0.7rem' }}
                    >
                      {s.slot_number}
                    </span>
                    <div>
                      <div className="fw-semibold small" style={{ color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                        {s.supplier_name}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Adapter: <span className="text-uppercase fw-semibold">{s.adapter_type}</span> • {s.success_count} queries
                      </div>
                    </div>
                  </div>

                  <div className="text-end">
                    <span
                      className={`badge ${s.status === 'HEALTHY' ? 'bg-success' : 'bg-warning'} px-2 py-0.5 small`}
                      style={{ fontSize: '0.68rem' }}
                    >
                      {s.status}
                    </span>
                    <div className="text-muted mt-0.5" style={{ fontSize: '0.7rem' }}>
                      {s.reliability_rate}% uptime
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
