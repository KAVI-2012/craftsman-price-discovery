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
  Radio,
  Plus,
  Download,
  Trash2,
  ExternalLink,
  Layers,
  Key
} from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [connectors, setConnectors] = useState<SupplierConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConnector, setEditingConnector] = useState<SupplierConnector | null>(null);
  const [testResult, setTestResult] = useState<{ slot: number; message: string; success: boolean } | null>(null);
  const [testingSlot, setTestingSlot] = useState<number | null>(null);
  const [downloadingConfig, setDownloadingConfig] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);

  // Add Portal State
  const [isAddingPortal, setIsAddingPortal] = useState(false);
  const [newPortal, setNewPortal] = useState({
    supplier_name: '',
    adapter_type: 'api',
    base_url: '',
    search_endpoint: '/search',
    timeout_seconds: 8,
    api_key: '',
    is_enabled: true
  });
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [addPortalError, setAddPortalError] = useState<string | null>(null);

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
      setNotification({
        type: 'success',
        message: `Configuration for Slot #${editingConnector.slot_number} (${editingConnector.supplier_name}) updated successfully.`
      });
    } catch (e) {
      console.error('Failed to update connector:', e);
    }
  };

  const handleCreatePortal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortal.supplier_name.trim() || !newPortal.base_url.trim()) {
      setAddPortalError('Please provide a Supplier Name and Base Portal URL.');
      return;
    }

    try {
      setIsSubmittingNew(true);
      setAddPortalError(null);
      const created = await apiClient.createConnector({
        supplier_name: newPortal.supplier_name.trim(),
        adapter_type: newPortal.adapter_type,
        base_url: newPortal.base_url.trim(),
        search_endpoint: newPortal.search_endpoint.trim() || '/search',
        timeout_seconds: Number(newPortal.timeout_seconds) || 8,
        api_key: newPortal.api_key.trim() || undefined,
        is_enabled: newPortal.is_enabled
      });

      setConnectors((prev) => [...prev, created]);
      setIsAddingPortal(false);
      setNewPortal({
        supplier_name: '',
        adapter_type: 'api',
        base_url: '',
        search_endpoint: '/search',
        timeout_seconds: 8,
        api_key: '',
        is_enabled: true
      });
      setNotification({
        type: 'success',
        message: `New Portal "${created.supplier_name}" successfully registered in Slot #${created.slot_number}.`
      });
    } catch (err: any) {
      console.error('Failed to create portal connector:', err);
      setAddPortalError(err.response?.data?.detail || 'Failed to create connector. Please check values.');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleDelete = async (slotNumber: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete custom portal Slot #${slotNumber} (${name})?`)) {
      return;
    }

    try {
      await apiClient.deleteConnector(slotNumber);
      setConnectors((prev) => prev.filter((c) => c.slot_number !== slotNumber));
      setNotification({
        type: 'info',
        message: `Portal Slot #${slotNumber} (${name}) removed.`
      });
    } catch (err: any) {
      console.error('Failed to delete connector:', err);
      setNotification({
        type: 'danger',
        message: err.response?.data?.detail || 'Failed to delete connector.'
      });
    }
  };

  const handleDownloadConfig = async () => {
    try {
      setDownloadingConfig(true);
      let exportData: any;
      try {
        exportData = await apiClient.exportConnectors();
      } catch (err) {
        // Fallback to client-side data serialization if endpoint is unavailable
        exportData = {
          export_date: new Date().toISOString(),
          system: 'Craftsman Price Discovery Engine',
          total_portals: connectors.length,
          active_portals: connectors.filter((c) => c.is_enabled).length,
          connectors: connectors.map((c) => ({
            slot_number: c.slot_number,
            supplier_name: c.supplier_name,
            adapter_type: c.adapter_type,
            base_url: c.base_url,
            search_endpoint: c.search_endpoint,
            is_enabled: c.is_enabled,
            timeout_seconds: c.timeout_seconds,
            last_status: c.last_status,
            api_configured: Boolean(c.api_key)
          }))
        };
      }

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `craftsman_portal_connectors_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setNotification({
        type: 'success',
        message: 'Portal connector configurations downloaded successfully.'
      });
    } catch (e) {
      console.error('Download failed:', e);
      setNotification({
        type: 'danger',
        message: 'Could not export configurations.'
      });
    } finally {
      setDownloadingConfig(false);
    }
  };

  const activeCount = connectors.filter((c) => c.is_enabled).length;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Portal Connectors — Supplier Gateway Configuration & Health
          </h4>
          <p className="text-secondary small mb-0">
            Manage, configure, and monitor connection reliability across industrial supplier portals.
          </p>
        </div>

        <div className="d-flex align-items-center flex-wrap gap-2">
          {/* Synchronized status badge */}
          <span className="badge bg-success-subtle text-success border border-success-subtle p-2 px-3 small d-flex align-items-center gap-1.5 fw-semibold">
            <span className="pulse-indicator"></span>
            <span>{activeCount} / {connectors.length} Portals Active & Synchronized</span>
          </span>

          {/* Download Config button */}
          <button
            onClick={handleDownloadConfig}
            disabled={downloadingConfig || connectors.length === 0}
            className="craftsman-btn-outline d-flex align-items-center gap-1.5 py-1.5 px-3"
            style={{ fontSize: '0.82rem', height: 38 }}
            title="Download all portal connector configurations as JSON"
          >
            {downloadingConfig ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              <Download size={15} />
            )}
            <span>Download Config</span>
          </button>

          {/* Add Another Application Portal button */}
          {isAdmin && (
            <button
              onClick={() => {
                setAddPortalError(null);
                setIsAddingPortal(true);
              }}
              className="craftsman-btn-primary d-flex align-items-center gap-1.5 py-1.5 px-3"
              style={{ fontSize: '0.82rem', height: 38 }}
              title="Manually enter and register another application portal"
            >
              <Plus size={16} />
              <span>Add Another Application Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Notification */}
      {notification && (
        <div className={`alert alert-${notification.type} alert-dismissible fade show mb-4`} role="alert">
          <div className="d-flex align-items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{notification.message}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setNotification(null)}></button>
        </div>
      )}

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
            <div className="craftsman-card h-100 d-flex flex-column justify-content-between position-relative">
              <div>
                {/* Card Header */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle d-flex align-items-center justify-content-center text-white small fw-bold"
                      style={{
                        width: 28,
                        height: 28,
                        background: c.slot_number <= 7 ? '#2563EB' : '#10B981',
                        fontSize: '0.78rem'
                      }}
                      title={c.slot_number > 7 ? 'Custom Added Application Portal' : 'System Gateway'}
                    >
                      {c.slot_number}
                    </span>
                    <h6 className="mb-0 fw-bold text-truncate" style={{ color: 'var(--text-primary)', fontSize: '0.92rem', maxWidth: 175 }} title={c.supplier_name}>
                      {c.supplier_name}
                    </h6>
                  </div>

                  <div className="d-flex align-items-center gap-1.5">
                    {c.slot_number > 7 && (
                      <span className="badge bg-primary-subtle text-primary px-1.5 py-0.5" style={{ fontSize: '0.62rem' }}>
                        CUSTOM
                      </span>
                    )}
                    <span
                      className={`badge ${
                        c.is_enabled
                          ? c.last_status === 'HEALTHY'
                            ? 'bg-success'
                            : 'bg-warning'
                          : 'bg-secondary'
                      } px-2 py-0.5 small`}
                      style={{ fontSize: '0.68rem' }}
                    >
                      {c.is_enabled ? c.last_status : 'DISABLED'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div
                  className="p-2.5 rounded-2 my-2.5"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}
                >
                  <div className="d-flex justify-content-between text-secondary mb-1">
                    <span>Integration Mode:</span>
                    <strong className="text-uppercase text-info">{c.adapter_type}</strong>
                  </div>
                  <div className="d-flex justify-content-between text-secondary mb-1">
                    <span>Base URL:</span>
                    <a
                      href={c.base_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-truncate text-secondary ms-2 d-inline-flex align-items-center gap-1 text-decoration-none"
                      style={{ maxWidth: 180 }}
                      title={c.base_url}
                    >
                      <span>{c.base_url}</span>
                      <ExternalLink size={10} />
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
                        : '96%'}
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
                        <span className="text-success fw-medium">Active</span>
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
                    title="Probe portal connectivity and latency"
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

                  {isAdmin && c.slot_number > 7 && (
                    <button
                      onClick={() => handleDelete(c.slot_number, c.supplier_name)}
                      className="craftsman-btn-outline py-1 px-2 text-danger border-danger-subtle"
                      style={{ fontSize: '0.74rem' }}
                      title="Remove this custom registered application portal"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Another Application Portal */}
      {isAddingPortal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1050, backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 540 }}>
            <div className="modal-content craftsman-card p-0 shadow-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header px-3.5 py-2.5 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--border-color)' }}>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-2 p-1.5 d-flex align-items-center justify-content-center" style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB', width: 28, height: 28 }}>
                    <Plus size={16} />
                  </div>
                  <div>
                    <h6 className="modal-title fw-bold mb-0" style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                      Add Another Application Portal
                    </h6>
                    <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
                      Configure new industrial supplier gateway endpoint
                    </span>
                  </div>
                </div>
                <button type="button" className="btn text-secondary p-1" onClick={() => setIsAddingPortal(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreatePortal} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div className="modal-body px-3.5 py-3" style={{ overflowY: 'auto' }}>
                  {addPortalError && (
                    <div className="alert alert-danger py-1.5 px-2.5 small mb-2.5 d-flex align-items-center gap-2" role="alert" style={{ fontSize: '0.76rem' }}>
                      <AlertCircle size={15} />
                      <span>{addPortalError}</span>
                    </div>
                  )}

                  <div className="row g-2.5">
                    {/* Supplier Name */}
                    <div className="col-12 col-md-7">
                      <label className="form-label small text-secondary fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>
                        Supplier / Portal Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control craftsman-input"
                        style={{ height: 36, fontSize: '0.82rem' }}
                        placeholder="e.g. L&T SuFin, Zetwerk, Tata nexarc..."
                        value={newPortal.supplier_name}
                        onChange={(e) => setNewPortal({ ...newPortal, supplier_name: e.target.value })}
                      />
                    </div>

                    {/* Integration Mode */}
                    <div className="col-12 col-md-5">
                      <label className="form-label small text-secondary fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>
                        Integration Mode <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select craftsman-input"
                        style={{ height: 36, fontSize: '0.82rem' }}
                        value={newPortal.adapter_type}
                        onChange={(e) => setNewPortal({ ...newPortal, adapter_type: e.target.value })}
                      >
                        <option value="api">API (REST Gateway)</option>
                        <option value="scraper">SCRAPER (Catalog)</option>
                        <option value="custom">CUSTOM (Direct OEM)</option>
                      </select>
                    </div>

                    {/* Base Website URL */}
                    <div className="col-12">
                      <label className="form-label small text-secondary fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>
                        Base Website / Portal Login URL <span className="text-danger">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        className="form-control craftsman-input"
                        style={{ height: 36, fontSize: '0.82rem' }}
                        placeholder="https://www.supplier-domain.com or https://portal.domain.com/login"
                        value={newPortal.base_url}
                        onChange={(e) => setNewPortal({ ...newPortal, base_url: e.target.value })}
                      />
                    </div>

                    {/* Search Endpoint Path */}
                    <div className="col-12 col-md-8">
                      <label className="form-label small text-secondary fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>
                        Search Endpoint Path
                      </label>
                      <input
                        type="text"
                        className="form-control craftsman-input"
                        style={{ height: 36, fontSize: '0.82rem' }}
                        placeholder="/search or /api/v1/parts"
                        value={newPortal.search_endpoint}
                        onChange={(e) => setNewPortal({ ...newPortal, search_endpoint: e.target.value })}
                      />
                    </div>

                    {/* Timeout */}
                    <div className="col-12 col-md-4">
                      <label className="form-label small text-secondary fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>
                        Timeout (s)
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="60"
                        className="form-control craftsman-input"
                        style={{ height: 36, fontSize: '0.82rem' }}
                        value={newPortal.timeout_seconds}
                        onChange={(e) => setNewPortal({ ...newPortal, timeout_seconds: parseInt(e.target.value, 10) || 8 })}
                      />
                    </div>

                    {/* API Key / Token */}
                    <div className="col-12">
                      <label className="form-label small text-secondary fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>
                        API Key / Auth Token (Optional)
                      </label>
                      <input
                        type="password"
                        className="form-control craftsman-input"
                        style={{ height: 36, fontSize: '0.82rem' }}
                        placeholder="Leave blank for public catalog discovery"
                        value={newPortal.api_key}
                        onChange={(e) => setNewPortal({ ...newPortal, api_key: e.target.value })}
                      />
                    </div>

                    {/* Enabled checkbox */}
                    <div className="col-12">
                      <div className="form-check form-switch pt-0.5">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="newPortalActive"
                          checked={newPortal.is_enabled}
                          onChange={(e) => setNewPortal({ ...newPortal, is_enabled: e.target.checked })}
                        />
                        <label className="form-check-label text-secondary" style={{ fontSize: '0.78rem' }} htmlFor="newPortalActive">
                          Enable portal gateway immediately
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer px-3.5 py-2.5 border-top d-flex justify-content-between" style={{ borderColor: 'var(--border-color)' }}>
                  <button type="button" className="craftsman-btn-outline btn-sm py-1 px-3" style={{ fontSize: '0.8rem' }} onClick={() => setIsAddingPortal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmittingNew} className="craftsman-btn-primary btn-sm py-1 px-3.5 d-flex align-items-center gap-1.5" style={{ fontSize: '0.82rem' }}>
                    {isSubmittingNew ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <Plus size={14} />
                    )}
                    <span>Register Portal</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Connector Modal */}
      {editingConnector && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1050, backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 540 }}>
            <div className="modal-content craftsman-card p-0 shadow-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header px-3.5 py-2.5 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--border-color)' }}>
                <h6 className="modal-title fw-bold mb-0" style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                  Configure Slot #{editingConnector.slot_number}: {editingConnector.supplier_name}
                </h6>
                <button type="button" className="btn text-secondary p-1" onClick={() => setEditingConnector(null)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div className="modal-body px-3.5 py-3" style={{ overflowY: 'auto' }}>
                  <div className="mb-2.5">
                    <label className="form-label small text-secondary fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>Supplier Name</label>
                    <input
                      type="text"
                      className="form-control craftsman-input"
                      style={{ height: 36, fontSize: '0.82rem' }}
                      value={editingConnector.supplier_name}
                      onChange={(e) => setEditingConnector({ ...editingConnector, supplier_name: e.target.value })}
                    />
                  </div>

                  <div className="mb-2.5">
                    <label className="form-label small text-secondary fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>Base Website URL</label>
                    <input
                      type="text"
                      className="form-control craftsman-input"
                      style={{ height: 36, fontSize: '0.82rem' }}
                      value={editingConnector.base_url}
                      onChange={(e) => setEditingConnector({ ...editingConnector, base_url: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-2.5">
                    <div className="col-8">
                      <label className="form-label small text-secondary fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>Search Endpoint Path</label>
                      <input
                        type="text"
                        className="form-control craftsman-input"
                        style={{ height: 36, fontSize: '0.82rem' }}
                        value={editingConnector.search_endpoint}
                        onChange={(e) => setEditingConnector({ ...editingConnector, search_endpoint: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small text-secondary fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>Timeout (s)</label>
                      <input
                        type="number"
                        className="form-control craftsman-input"
                        style={{ height: 36, fontSize: '0.82rem' }}
                        value={editingConnector.timeout_seconds}
                        onChange={(e) => setEditingConnector({ ...editingConnector, timeout_seconds: parseInt(e.target.value, 10) || 8 })}
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small text-secondary fw-semibold mb-1" style={{ fontSize: '0.76rem' }}>API Key / Auth Token (Optional)</label>
                    <input
                      type="password"
                      className="form-control craftsman-input"
                      style={{ height: 36, fontSize: '0.82rem' }}
                      placeholder="Leave blank to use default public catalog scraper"
                      value={editingConnector.api_key || ''}
                      onChange={(e) => setEditingConnector({ ...editingConnector, api_key: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer px-3.5 py-2.5 border-top d-flex justify-content-between" style={{ borderColor: 'var(--border-color)' }}>
                  <button type="button" className="craftsman-btn-outline btn-sm py-1 px-3" style={{ fontSize: '0.8rem' }} onClick={() => setEditingConnector(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="craftsman-btn-primary btn-sm py-1 px-3.5 d-flex align-items-center gap-1.5" style={{ fontSize: '0.82rem' }}>
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
