import React, { useState } from 'react';
import { Settings, Database, Cpu, Globe, Sliders, Shield, Save, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [timeoutSecs, setTimeoutSecs] = useState(8);
  const [minSuppliers, setMinSuppliers] = useState(5);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            System Settings & Engine Parameters
          </h4>
          <p className="text-secondary small mb-0">
            Configure system timeouts, target supplier thresholds, and multi-currency normalization rates.
          </p>
        </div>

        {saved && (
          <span className="badge bg-success p-2 px-3 d-flex align-items-center gap-1.5 fw-semibold" style={{ fontSize: '0.78rem' }}>
            <Check size={16} /> Settings Saved Successfully
          </span>
        )}
      </div>

      <div className="row g-4">
        {/* Left Column: Form */}
        <div className="col-12 col-lg-7">
          <form onSubmit={handleSave}>
            {/* Orchestration Parameters */}
            <div className="craftsman-card mb-4">
              <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                <Sliders size={17} className="text-primary" />
                <h6 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
                  Search Orchestration Engine
                </h6>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small text-secondary">
                    Connector Latency Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={20}
                    className="form-control craftsman-input"
                    value={timeoutSecs}
                    onChange={(e) => setTimeoutSecs(parseInt(e.target.value, 10))}
                  />
                  <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                    Max wait time per portal before activating resilient fallback.
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small text-secondary">
                    Minimum Guaranteed Suppliers Target
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={7}
                    className="form-control craftsman-input"
                    value={minSuppliers}
                    onChange={(e) => setMinSuppliers(parseInt(e.target.value, 10))}
                  />
                  <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                    Standard requirement is minimum 5 suppliers whenever items match.
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small text-secondary">
                    Default Reporting Currency
                  </label>
                  <select
                    className="form-select craftsman-input"
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Matching Configuration */}
            <div className="craftsman-card mb-4">
              <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                <Cpu size={17} className="text-info" />
                <h6 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
                  AI Matching Engine & Semantic Integrations
                </h6>
              </div>

              <div className="mb-2">
                <label className="form-label small text-secondary">Google Gemini API Key (Optional)</label>
                <input
                  type="password"
                  className="form-control craftsman-input"
                  placeholder="AIzaSy... (Leave empty to use built-in deterministic heuristic matcher)"
                />
                <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                  Used for advanced semantic specification extraction from unstructured catalogues.
                </div>
              </div>
            </div>

            <button type="submit" className="craftsman-btn-primary">
              <Save size={15} />
              <span>Save Configuration</span>
            </button>
          </form>
        </div>

        {/* Right Column: Database & System Status */}
        <div className="col-12 col-lg-5">
          <div className="craftsman-card mb-4">
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <Database size={17} className="text-success" />
              <h6 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
                Database Persistence Engine
              </h6>
            </div>

            <div className="d-flex flex-column gap-2.5 small text-secondary">
              <div className="d-flex justify-content-between">
                <span>Relational Database:</span>
                <strong style={{ color: 'var(--text-primary)' }}>PostgreSQL / SQLite Dual Engine</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Active ORM Driver:</span>
                <span className="mono text-info">SQLAlchemy 2.0</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Database Tables:</span>
                <span style={{ color: 'var(--text-primary)' }}>10 Core Normalized Tables</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Connection Health:</span>
                <span className="badge bg-success-subtle text-success border border-success-subtle small px-2">Connected & Healthy</span>
              </div>
            </div>
          </div>

          <div className="craftsman-card">
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <Globe size={17} className="text-warning" />
              <h6 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
                Currency Normalization Rates (to INR)
              </h6>
            </div>

            <div className="table-responsive">
              <table className="table table-sm" style={{ color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                <thead>
                  <tr className="text-muted small">
                    <th>Currency</th>
                    <th>ISO Code</th>
                    <th className="text-end">Conversion Rate (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-secondary">US Dollar</td>
                    <td className="mono fw-semibold">USD</td>
                    <td className="text-end fw-bold text-success">₹83.00</td>
                  </tr>
                  <tr>
                    <td className="text-secondary">Euro</td>
                    <td className="mono fw-semibold">EUR</td>
                    <td className="text-end fw-bold text-success">₹90.50</td>
                  </tr>
                  <tr>
                    <td className="text-secondary">British Pound</td>
                    <td className="mono fw-semibold">GBP</td>
                    <td className="text-end fw-bold text-success">₹105.20</td>
                  </tr>
                  <tr>
                    <td className="text-secondary">Japanese Yen</td>
                    <td className="mono fw-semibold">JPY</td>
                    <td className="text-end fw-bold text-success">₹0.55</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
