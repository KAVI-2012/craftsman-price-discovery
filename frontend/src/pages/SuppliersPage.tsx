import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { SupplierConnector } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Activity,
  Edit2,
  Zap,
  Globe,
  Clock,
  Shield,
  Save,
  X,
  Radio
} from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [connectors, setConnectors] = useState<SupplierConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConnector, setEditingConnector] = useState<SupplierConnector | null>(null);
  const [testResult, setTestResult] = useState<{ slot: number; message: string; success: boolean } | null>(null);
  const [testingSlot, setTestingSlot] = useState<number | null>(null);

  useEffect(() => {
    loadConnectors();
  }, []);

  const loadConnectors = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getConnectors();
      setConnectors(data);
    } catch (e) {
      console.error('Failed to load connectors:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (slot: number) => {
    try {
      const updated = await apiClient.toggleConnector(slot);
      setConnectors((prev) => prev.map((c) => (c.slot_number === slot ? updated : c)));
    } catch (e) {
      console.error('Toggle failed:', e);
    }
  };

  const handleTest = async (slot: number) => {
    try {
      setTestingSlot(slot);
      setTestResult(null);
      const res = await apiClient.testConnector(slot);
      setTestResult({
        slot,
        message: `${res.message} (${res.latency_ms} ms)`,
        success: res.status === 'HEALTHY'
      });
      loadConnectors();
    } catch (e: any) {
      setTestResult({
        slot,
        message: e.response?.data?.detail || 'Connection test failed',
        success: false
      });
    } finally {
      setTestingSlot(null);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConnector) return;

    try {
      const updated = await apiClient.updateConnector(editingConnector.slot_number, {
        supplier_name: editingConnector.supplier_name,
        base_url: editingConnector.base_url,
        search_endpoint: editingConnector.search_endpoint,
        api_key: editingConnector.api_key,
        timeout_seconds: editingConnector.timeout_seconds
      });
      setConnectors((prev) => prev.map((c) => (c.slot_number === updated.slot_number ? updated : c)));
      setEditingConnector(null);
    } catch (e) {
      console.error('Failed to update connector:', e);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Supplier Portal Configuration & Connectors
          </h4>
          <p className="text-secondary small mb-0">
            Manage, configure, and monitor connection reliability across all 7 industrial supplier portals.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success-subtle text-success border border-success-subtle p-2 px-3 small d-flex align-items-center gap-1.5 fw-semibold">
            <span className="pulse-indicator"></span>
            <span>7 Portals Active & Synchronized</span>
          </span>
        </div>
      </div>

      {/* Test Notification */}
      {testResult && (
        <div className={`alert ${testResult.success ? 'alert-success' : 'alert-warning'} alert-dismissible fade show mb-4`} role="alert">
          <div className="d-flex align-items-center gap-2">
            {testResult.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <div>
              <strong>Slot #{testResult.slot}:</strong> {testResult.message}
            </div>
          </div>
          <button type="button" className="btn-close" onClick={() => setTestResult(null)}></button>
        </div>
      )}

      {/* Connectors Grid */}
      <div className="row g-3">
        {connectors.map((c) => (
          <div key={c.slot_number} className="col-12 col-md-6 col-xl-4">
            <div className="craftsman-card h-100 d-flex flex-column justify-content-between">
              <div>
                {/* Card Header */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle d-flex align-items-center justify-content-center text-white small fw-bold"
                      style={{ width: 28, height: 28, background: '#2563EB', fontSize: '0.78rem' }}
                    >
                      {c.slot_number}
                    </span>
                    <h6 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                      {c.supplier_name}
                    </h6>
                  </div>

                  <span className={`badge ${c.is_enabled ? (c.last_status === 'HEALTHY' ? 'bg-success' : 'bg-warning') : 'bg-secondary'} px-2 py-0.5 small`} style={{ fontSize: '0.68rem' }}>
                    {c.is_enabled ? c.last_status : 'DISABLED'}
                  </span>
                </div>

                {/* Details */}
                <div className="p-2.5 rounded-2 my-2.5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                  <div className="d-flex justify-content-between text-secondary mb-1">
                    <span>Integration Mode:</span>
                    <strong className="text-uppercase text-info">{c.adapter_type}</strong>
                  </div>
                  <div className="d-flex justify-content-between text-secondary mb-1">
                    <span>Base URL:</span>
                    <a href={c.base_url} target="_blank" rel="noopener noreferrer" className="text-truncate text-secondary ms-2" style={{ maxWidth: 170 }}>
                      {c.base_url}
                    </a>
                  </div>
                  <div className="d-flex justify-content-between text-secondary mb-1">
                    <span>Search Endpoint:</span>
                    <span className="mono" style={{ color: 'var(--text-primary)' }}>{c.search_endpoint}</span>
                  </div>
                  <div className="d-flex justify-content-between text-secondary mb-1">
                    <span>Max Latency Timeout:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{c.timeout_seconds}s</span>
                  </div>
                  <div className="d-flex justify-content-between text-secondary">
                    <span>Performance Uptime:</span>
                    <span className="text-success fw-bold">
                      {c.success_count + c.error_count > 0
                        ? `${Math.round((c.success_count / (c.success_count + c.error_count)) * 100)}%`
                        : '100%'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex align-items-center justify-content-between pt-2 border-top gap-2" style={{ borderColor: 'var(--border-color)' }}>
                {isAdmin ? (
                  <button
                    onClick={() => handleToggle(c.slot_number)}
                    className="btn btn-sm text-secondary p-0 d-flex align-items-center gap-1"
                    style={{ fontSize: '0.75rem', background: 'transparent', border: 'none' }}
                  >
                    {c.is_enabled ? (
                      <>
                        <ToggleRight size={20} className="text-success" />
                        <span className="text-success fw-medium">Enabled</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={20} className="text-muted" />
                        <span>Disabled</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-muted small">{c.is_enabled ? 'Active' : 'Disabled'}</span>
                )}

                <div className="d-flex align-items-center gap-1.5 ms-auto">
                  <button
                    onClick={() => handleTest(c.slot_number)}
                    disabled={testingSlot === c.slot_number}
                    className="craftsman-btn-outline py-1 px-2.5"
                    style={{ fontSize: '0.74rem' }}
                    title="Probe portal connectivity"
                  >
                    {testingSlot === c.slot_number ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <Zap size={13} className="text-warning" />
                    )}
                    <span>Ping</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setEditingConnector({ ...c })}
                      className="craftsman-btn-outline py-1 px-2.5"
                      style={{ fontSize: '0.74rem' }}
                      title="Edit endpoint & configuration"
                    >
                      <Edit2 size={13} />
                      <span>Config</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Connector Modal */}
      {editingConnector && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1050, backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content craftsman-card p-0" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="modal-header p-3.5 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                <h6 className="modal-title fw-bold" style={{ color: 'var(--text-primary)' }}>
                  Configure Slot #{editingConnector.slot_number}: {editingConnector.supplier_name}
                </h6>
                <button type="button" className="btn text-secondary p-1" onClick={() => setEditingConnector(null)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-3.5">
                  <div className="mb-2.5">
                    <label className="form-label small text-secondary">Supplier Name</label>
                    <input
                      type="text"
                      className="form-control craftsman-input"
                      value={editingConnector.supplier_name}
                      onChange={(e) => setEditingConnector({ ...editingConnector, supplier_name: e.target.value })}
                    />
                  </div>

                  <div className="mb-2.5">
                    <label className="form-label small text-secondary">Base Website URL</label>
                    <input
                      type="text"
                      className="form-control craftsman-input"
                      value={editingConnector.base_url}
                      onChange={(e) => setEditingConnector({ ...editingConnector, base_url: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-2.5">
                    <div className="col-8">
                      <label className="form-label small text-secondary">Search Endpoint Path</label>
                      <input
                        type="text"
                        className="form-control craftsman-input"
                        value={editingConnector.search_endpoint}
                        onChange={(e) => setEditingConnector({ ...editingConnector, search_endpoint: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small text-secondary">Timeout (s)</label>
                      <input
                        type="number"
                        className="form-control craftsman-input"
                        value={editingConnector.timeout_seconds}
                        onChange={(e) => setEditingConnector({ ...editingConnector, timeout_seconds: parseInt(e.target.value, 10) })}
                      />
                    </div>
                  </div>

                  <div className="mb-2.5">
                    <label className="form-label small text-secondary">API Key / Auth Token (Optional)</label>
                    <input
                      type="password"
                      className="form-control craftsman-input"
                      placeholder="Leave blank to use default public catalog scraper"
                      value={editingConnector.api_key || ''}
                      onChange={(e) => setEditingConnector({ ...editingConnector, api_key: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer p-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
                  <button type="button" className="craftsman-btn-outline btn-sm" onClick={() => setEditingConnector(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="craftsman-btn-primary btn-sm">
                    <Save size={14} />
                    <span>Save Configuration</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
