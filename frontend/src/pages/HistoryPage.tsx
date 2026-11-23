import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { SearchHistoryItem } from '../types';
import { useNavigate } from 'react-router-dom';
import { History, Search, ArrowRight, Clock, User as UserIcon, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getSearchHistory(100);
      setHistoryItems(data);
    } catch (e) {
      console.error('Failed to load search history:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = historyItems.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.query_text.toLowerCase().includes(q) ||
      (item.part_number && item.part_number.toLowerCase().includes(q)) ||
      (item.user_email && item.user_email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Search History & Price Discovery Audit Trail
          </h4>
          <p className="text-secondary small mb-0">
            Chronological audit log of all market price inquiries across Craftsman Automation procurement operations.
          </p>
        </div>

        {/* Filter Input */}
        <div className="w-auto" style={{ minWidth: 280 }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
              <Search size={15} />
            </span>
            <input
              type="text"
              className="form-control craftsman-input border-start-0"
              placeholder="Filter by part number, query, or buyer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* History Table Card */}
      <div className="craftsman-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table-craftsman">
            <thead>
              <tr>
                <th>ID</th>
                <th>Search Query / Item</th>
                <th>Part Number</th>
                <th>Category</th>
                <th>Execution Date & Time</th>
                <th>Buyer / User</th>
                <th>Suppliers</th>
                <th>Lowest Price (INR)</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-5 text-muted">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    Loading search audit logs...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-5 text-muted">
                    No matching search history records found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="mono text-muted small" style={{ fontSize: '0.78rem' }}>#{item.id}</td>
                    <td>
                      <div className="fw-semibold text-truncate" style={{ maxWidth: 220, color: 'var(--text-primary)' }}>
                        {item.query_text}
                      </div>
                    </td>
                    <td>
                      <span className="mono fw-semibold px-2 py-0.5 rounded small" style={{ background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.78rem' }}>
                        {item.part_number || 'N/A'}
                      </span>
                    </td>
                    <td className="small text-secondary">{item.category || 'General Industrial'}</td>
                    <td className="mono small text-muted" style={{ fontSize: '0.75rem' }}>
                      {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1.5 small text-secondary">
                        <UserIcon size={13} className="text-muted" />
                        <span>{item.user_email || 'Procurement User'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary px-2 py-1 small">
                        {item.suppliers_succeeded_count} / 7
                      </span>
                    </td>
                    <td>
                      <div className="h6 mb-0 fw-bold text-success" style={{ fontSize: '0.88rem' }}>
                        ₹{item.lowest_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success border border-success-subtle small px-2 py-0.5">
                        {item.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => navigate(`/discovery?search_id=${item.id}`)}
                        className="craftsman-btn-primary py-1 px-2.5 text-decoration-none"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <span>Open Matrix</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
