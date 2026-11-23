import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { ComparisonMatrixResponse, SearchHistoryItem } from '../types';
import { FileSpreadsheet, FileText, Download, CheckCircle, ShieldCheck, TrendingDown, Building, Sparkles, Award } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [historyList, setHistoryList] = useState<SearchHistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [reportData, setReportData] = useState<ComparisonMatrixResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadReport(selectedId);
    }
  }, [selectedId]);

  const loadHistory = async () => {
    try {
      const items = await apiClient.getSearchHistory(50);
      setHistoryList(items);
      if (items.length > 0) setSelectedId(items[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const loadReport = async (id: number) => {
    try {
      setLoading(true);
      const res = await apiClient.getSearchResults(id);
      setReportData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const lowestItem = reportData?.items.find((i) => i.is_lowest_price);
  const highestItem = reportData?.items.reduce((max, item) => {
    const curP = item.price_info.normalized_price_inr || 0;
    const maxP = max ? (max.price_info.normalized_price_inr || 0) : 0;
    return curP > maxP ? item : max;
  }, reportData.items[0]);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Procurement Research Reports & Documentation
          </h4>
          <p className="text-secondary small mb-0">
            Generate and download enterprise audit-ready Excel workbooks and executive PDF reports.
          </p>
        </div>

        {/* Query Selector */}
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Select Inquired Part:</span>
          <select
            className="form-select craftsman-input w-auto"
            style={{ fontSize: '0.84rem' }}
            value={selectedId}
            onChange={(e) => setSelectedId(parseInt(e.target.value, 10))}
          >
            {historyList.map((h) => (
              <option key={h.id} value={h.id}>
                #{h.id}: {h.part_number || h.query_text}
              </option>
            ))}
          </select>
        </div>
      </div>

      {reportData && (
        <div className="row g-4">
          {/* Left Column: Download Cards */}
          <div className="col-12 col-lg-5">
            <div className="craftsman-card mb-4">
              <h6 className="fw-bold mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                Downloadable Report Formats
              </h6>

              {/* Excel Card */}
              <div
                className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between transition-all"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 rounded-2 bg-success-subtle text-success">
                    <FileSpreadsheet size={26} />
                  </div>
                  <div>
                    <div className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      Excel Comparison Workbook (.xlsx)
                    </div>
                    <div className="text-secondary small" style={{ fontSize: '0.74rem' }}>
                      Structured grid, lowest price highlight, active URL hyperlinks
                    </div>
                  </div>
                </div>

                <a
                  href={apiClient.getExcelExportUrl(reportData.search_id)}
                  className="craftsman-btn-primary btn-sm text-decoration-none py-1.5 px-3"
                  style={{ fontSize: '0.8rem' }}
                  download
                >
                  <Download size={14} />
                  Download
                </a>
              </div>

              {/* PDF Card */}
              <div
                className="p-3 rounded-3 d-flex align-items-center justify-content-between transition-all"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 rounded-2 bg-danger-subtle text-danger">
                    <FileText size={26} />
                  </div>
                  <div>
                    <div className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      Executive PDF Summary (.pdf)
                    </div>
                    <div className="text-secondary small" style={{ fontSize: '0.74rem' }}>
                      Formal procurement briefing report for management signoff
                    </div>
                  </div>
                </div>

                <a
                  href={apiClient.getPdfExportUrl(reportData.search_id)}
                  className="craftsman-btn-outline btn-sm text-decoration-none py-1.5 px-3"
                  style={{ fontSize: '0.8rem' }}
                  download
                >
                  <Download size={14} />
                  Download
                </a>
              </div>
            </div>

            {/* Verification & Compliance */}
            <div className="craftsman-card">
              <div className="d-flex align-items-center gap-2 text-success fw-bold small mb-2">
                <ShieldCheck size={18} />
                <span>Procurement Audit Compliance</span>
              </div>
              <p className="text-secondary small mb-2" style={{ lineHeight: 1.4 }}>
                All prices and technical specifications collected are directly attributed to verified public supplier listings. Timestamps, original URLs, and tax breakdowns are preserved for audit verification.
              </p>
              <div className="small text-muted mono" style={{ fontSize: '0.74rem' }}>
                Search ID: #{reportData.search_id} • Organization: Craftsman Automation
              </div>
            </div>
          </div>

          {/* Right Column: AI Executive Summary Preview */}
          <div className="col-12 col-lg-7">
            <div className="craftsman-card h-100">
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                <div className="d-flex align-items-center gap-2">
                  <Sparkles size={17} className="text-warning" />
                  <h6 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
                    AI Market Intelligence Summary
                  </h6>
                </div>
                <span className="badge bg-primary p-1 px-2 small" style={{ fontSize: '0.68rem' }}>Automated Analysis</span>
              </div>

              {/* Key Highlights */}
              <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="text-muted small" style={{ fontSize: '0.74rem' }}>Target Part Number:</div>
                    <div className="mono fw-bold text-info">{reportData.part_number || 'General Inquiry'}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted small" style={{ fontSize: '0.74rem' }}>Suppliers Analyzed:</div>
                    <div className="fw-bold" style={{ color: 'var(--text-primary)' }}>{reportData.successful_suppliers_count} Portals</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted small" style={{ fontSize: '0.74rem' }}>Lowest Market Price:</div>
                    <div className="fw-bold text-success h5 mb-0">
                      ₹{reportData.lowest_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      <span className="small text-muted fw-normal ms-1" style={{ fontSize: '0.72rem' }}>/{reportData.common_uom || 'Unit'}</span>
                    </div>
                    <div className="text-muted small" style={{ fontSize: '0.72rem' }}>{lowestItem?.supplier_name}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted small" style={{ fontSize: '0.74rem' }}>Max Sourcing Spread:</div>
                    <div className="fw-bold text-warning h5 mb-0">
                      ₹{reportData.potential_savings_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      <span className="small text-muted fw-normal ms-1" style={{ fontSize: '0.72rem' }}>/{reportData.common_uom || 'Unit'}</span>
                    </div>
                    <div className="text-info small" style={{ fontSize: '0.72rem' }}>{reportData.potential_savings_percentage}% potential savings</div>
                  </div>
                </div>
              </div>

              {/* AI Narrative */}
              <div className="mb-3">
                <h6 className="fw-bold text-uppercase text-muted small mb-1.5" style={{ fontSize: '0.72rem' }}>Executive Commentary</h6>
                <p className="text-secondary small leading-relaxed" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                  Market discovery for <strong>{reportData.query_text}</strong> ({reportData.part_number || 'Standard SKU'}) was executed across all 7 configured supplier networks with common UOM normalization (<strong>/{reportData.common_uom || 'Unit'}</strong>).
                  The lowest commercial benchmark was identified on <strong>{lowestItem?.supplier_name}</strong> at <strong>₹{reportData.lowest_price?.toLocaleString('en-IN')}</strong>, compared to the market high of <strong>₹{reportData.highest_price?.toLocaleString('en-IN')}</strong> on <strong>{highestItem?.supplier_name}</strong>.
                  Procuring from the lowest-priced verified supplier yields a direct cost reduction of <strong>₹{reportData.potential_savings_amount?.toLocaleString('en-IN')} ({reportData.potential_savings_percentage}%)</strong> per {reportData.common_uom || 'Unit'}.
                </p>
              </div>

              {/* Suppliers List In Report */}
              <div>
                <h6 className="fw-bold text-uppercase text-muted small mb-2" style={{ fontSize: '0.72rem' }}>Discovered Sourcing Options (UOM Normalized)</h6>
                <div className="d-flex flex-column gap-1.5">
                  {reportData.items.map((item) => (
                    <div
                      key={item.result_id}
                      className="p-2 px-2.5 rounded border d-flex align-items-center justify-content-between small"
                      style={{
                        borderColor: 'var(--border-color)',
                        background: item.is_lowest_price ? 'var(--lowest-price-bg)' : 'transparent',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div>
                        <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{item.supplier_name}</span>
                        {' — '}<span className="text-secondary">{item.product_name.slice(0, 40)}...</span>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                          Listed: {item.price_info.currency} {item.price_info.original_price?.toLocaleString('en-IN')} / {item.price_info.original_uom || 'Unit'}
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {item.price_info.is_uom_normalized !== false && item.price_info.normalized_price_common !== null ? (
                          <span className={`fw-bold ${item.is_lowest_price ? 'text-success' : 'text-info'}`}>
                            ₹{item.price_info.normalized_price_common?.toLocaleString('en-IN')} /{item.price_info.common_uom || 'Unit'}
                          </span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-warning border border-warning-subtle small px-2 py-0.5">
                            Not Available
                          </span>
                        )}
                        {item.is_lowest_price && <span className="badge-lowest" style={{ fontSize: '0.62rem' }}>LOWEST</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
