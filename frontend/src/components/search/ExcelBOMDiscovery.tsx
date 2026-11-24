import React, { useState, useRef } from 'react';
import { apiClient } from '../../services/api';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Sparkles,
  TrendingDown,
  Layers,
  Building2,
  ArrowRight
} from 'lucide-react';

interface ParsedBOMItem {
  row_number: number;
  item_code: string;
  raw_description: string;
  clean_query: string;
  extracted_part_number: string;
}

interface BatchResultItem {
  item_code: string;
  raw_description: string;
  clean_query: string;
  part_number: string;
  search_id: number | null;
  status: string;
  lowest_price: number | null;
  average_price: number | null;
  highest_price: number | null;
  potential_savings_amount: number;
  potential_savings_percentage: number;
  common_uom: string;
  best_supplier: string;
  suppliers_succeeded: number;
  direct_link: string;
  match_classification: string;
  match_confidence: number;
}

interface ExcelBOMDiscoveryProps {
  onSelectSearchId?: (searchId: number) => void;
}

export const ExcelBOMDiscovery: React.FC<ExcelBOMDiscoveryProps> = ({ onSelectSearchId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedBOMItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [batchResults, setBatchResults] = useState<BatchResultItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
      setErrorMsg('Please upload a valid Excel file (.xlsx, .xls) or CSV (.csv).');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setErrorMsg(null);
    setBatchResults([]);

    try {
      const resp = await apiClient.uploadExcelBOM(file);
      if (resp.items && resp.items.length > 0) {
        setParsedItems(resp.items);
      } else {
        setErrorMsg('The uploaded Excel file did not contain any data rows under ITEM_CODE and ITEM_DESC.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to parse Excel file. Please ensure columns ITEM_CODE and ITEM_DESC exist.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunBatchDiscovery = async () => {
    if (parsedItems.length === 0) return;

    setIsProcessingBatch(true);
    setErrorMsg(null);
    setProgressIndex(0);

    try {
      const resp = await apiClient.runBatchSearch(parsedItems);
      setBatchResults(resp.results || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Batch discovery encountered an error. Please try again.');
    } finally {
      setIsProcessingBatch(false);
      setProgressIndex(parsedItems.length);
    }
  };

  const handleExportExcel = async () => {
    if (batchResults.length === 0) return;
    setIsExporting(true);
    try {
      const blob = await apiClient.exportBatchExcel(batchResults);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Craftsman_BOM_Price_Comparison_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export batch Excel:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // KPI Calculations
  const totalItems = batchResults.length;
  const completedItems = batchResults.filter((r) => r.status === 'COMPLETED' && r.lowest_price !== null);
  const totalLowestSpend = completedItems.reduce((acc, curr) => acc + (curr.lowest_price || 0), 0);
  const totalAvgSpend = completedItems.reduce((acc, curr) => acc + (curr.average_price || 0), 0);
  const totalSavings = Math.max(0, totalAvgSpend - totalLowestSpend);
  const overallSavingsPct = totalAvgSpend > 0 ? ((totalSavings / totalAvgSpend) * 100).toFixed(1) : '0.0';

  return (
    <div className="craftsman-card p-4 mb-4 shadow-sm" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3" style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 small fw-bold">
              BOM BATCH DISCOVERY
            </span>
            <span className="text-secondary small">Supports Craftsman SAP/ERP Master Material Excel Sheets</span>
          </div>
          <h5 className="fw-bold mb-0 mt-1" style={{ color: 'var(--text-primary)' }}>
            Bulk Excel Upload: Multi-Item Market Price Discovery
          </h5>
        </div>

        {batchResults.length > 0 && (
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExporting}
              className="craftsman-btn-outline py-1.5 px-3 d-flex align-items-center gap-1.5 text-success border-success-subtle"
              style={{ fontSize: '0.82rem' }}
              title="Download consolidated Excel report of discovered market prices"
            >
              <Download size={14} />
              <span>{isExporting ? 'Generating Report...' : 'Export Consolidated Report (.XLSX)'}</span>
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2.5 mb-3 small">
          <AlertCircle size={16} className="flex-shrink-0" />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Upload Drop Zone */}
      {parsedItems.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="text-center rounded-3 border-2 border-dashed d-flex flex-column align-items-center justify-content-center cursor-pointer transition-all"
          style={{
            borderColor: 'var(--border-color)',
            background: 'var(--bg-primary)',
            padding: '36px 24px 48px 24px',
            minHeight: 250,
            cursor: 'pointer'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
          />
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-primary mb-3 shadow-sm"
            style={{ width: 56, height: 56, background: 'rgba(30, 64, 175, 0.12)' }}
          >
            <UploadCloud size={28} />
          </div>
          <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Drag and Drop your BOM Excel sheet here, or browse
          </h6>
          <p className="text-secondary small mb-3" style={{ maxWidth: 460 }}>
            Supports <code>.xlsx</code>, <code>.xls</code>, and <code>.csv</code> files containing columns <strong>ITEM_CODE</strong> and <strong>ITEM_DESC</strong>.
          </p>
          <button
            type="button"
            className="craftsman-btn-primary py-2 px-4 d-inline-flex align-items-center gap-2 shadow-sm"
            disabled={isUploading}
            style={{ marginBottom: '4px' }}
          >
            {isUploading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Parsing Excel Rows...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet size={16} />
                <span>Select Excel File</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Parsed Items Preview & Actions */}
      {parsedItems.length > 0 && (
        <div>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 rounded-3 mb-3" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center gap-2.5">
              <FileSpreadsheet size={22} className="text-success" />
              <div>
                <span className="fw-bold text-primary">{uploadedFile?.name || 'Craftsman_BOM_Uploaded.xlsx'}</span>
                <span className="text-secondary small ms-2">({parsedItems.length} items parsed successfully)</span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setParsedItems([]);
                  setBatchResults([]);
                  setUploadedFile(null);
                }}
                className="craftsman-btn-outline py-1.5 px-3 text-secondary"
                style={{ fontSize: '0.82rem' }}
                disabled={isProcessingBatch}
              >
                Clear / Re-upload
              </button>

              <button
                type="button"
                onClick={handleRunBatchDiscovery}
                disabled={isProcessingBatch}
                className="craftsman-btn-primary py-1.5 px-3.5 d-flex align-items-center gap-1.5 shadow"
                style={{ fontSize: '0.84rem' }}
              >
                {isProcessingBatch ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Discovering Across 7 Portals...</span>
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-current" />
                    <span>Start Multi-Portal Discovery ({parsedItems.length} Items)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {isProcessingBatch && (
            <div className="p-3 mb-3 rounded-3" style={{ background: 'rgba(30, 64, 175, 0.08)', border: '1px solid rgba(30, 64, 175, 0.2)' }}>
              <div className="d-flex justify-content-between small mb-1.5 text-primary fw-semibold">
                <span>Parallel Supplier Search in Progress (IndiaMART, Moglix, Industrybuying, RS, Misumi, Grainger, Craftsman OEM)...</span>
                <span>Connecting 7 Portals</span>
              </div>
              <div className="progress" style={{ height: 6 }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                  role="progressbar"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          )}

          {/* KPI Cards when results are ready */}
          {batchResults.length > 0 && (
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-3">
                <div className="p-3 rounded-3 h-100" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                  <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
                    <Layers size={14} className="text-primary" />
                    <span>Total BOM Items Processed</span>
                  </div>
                  <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{totalItems} Products</h4>
                  <span className="text-success small" style={{ fontSize: '0.72rem' }}>100% Multi-Portal Scanned</span>
                </div>
              </div>

              <div className="col-12 col-md-3">
                <div className="p-3 rounded-3 h-100" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                  <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
                    <Building2 size={14} className="text-success" />
                    <span>Optimized Market Spend</span>
                  </div>
                  <h4 className="fw-bold mb-0 text-success">
                    ₹{totalLowestSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h4>
                  <span className="text-secondary small" style={{ fontSize: '0.72rem' }}>Sum of lowest supplier offers</span>
                </div>
              </div>

              <div className="col-12 col-md-3">
                <div className="p-3 rounded-3 h-100" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                  <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
                    <TrendingDown size={14} className="text-info" />
                    <span>Average Market Spend</span>
                  </div>
                  <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                    ₹{totalAvgSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h4>
                  <span className="text-secondary small" style={{ fontSize: '0.72rem' }}>Market weighted baseline</span>
                </div>
              </div>

              <div className="col-12 col-md-3">
                <div className="p-3 rounded-3 h-100" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <div className="d-flex align-items-center gap-2 text-success small mb-1">
                    <Sparkles size={14} />
                    <span>Total Potential Savings</span>
                  </div>
                  <h4 className="fw-bold mb-0 text-success">
                    ₹{totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h4>
                  <span className="badge bg-success-subtle text-success border border-success-subtle small px-2 py-0.5 mt-1" style={{ fontSize: '0.72rem' }}>
                    {overallSavingsPct}% Procurement Advantage
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Export Action Bar */}
          {batchResults.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Batch Price Discovery Results</h6>
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={isExporting}
                className="craftsman-btn-outline py-1.5 px-3 d-flex align-items-center gap-1.5 text-success border-success-subtle"
                style={{ fontSize: '0.82rem' }}
              >
                <Download size={14} />
                <span>{isExporting ? 'Generating Report...' : 'Export Consolidated Report (.XLSX)'}</span>
              </button>
            </div>
          )}

          {/* Items Table */}
          <div className="table-responsive rounded-3 border" style={{ borderColor: 'var(--border-color)' }}>
            <table className="table table-hover mb-0 craftsman-table align-middle" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th style={{ width: 140 }}>ITEM_CODE</th>
                  <th>ITEM_DESC (Uploaded)</th>
                  <th>Cleaned Search Query</th>
                  {batchResults.length > 0 ? (
                    <>
                      <th>Best Market Price</th>
                      <th>Best Supplier Portal</th>
                      <th>Avg Market Price</th>
                      <th>Savings</th>
                      <th className="text-end">Verification & Action</th>
                    </>
                  ) : (
                    <th>Extracted Part Code</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {parsedItems.map((item, idx) => {
                  const result = batchResults[idx];
                  return (
                    <tr key={item.row_number || idx}>
                      <td className="text-secondary">{idx + 1}</td>
                      <td>
                        <span className="badge bg-secondary-subtle text-secondary border mono px-2 py-1">
                          {item.item_code}
                        </span>
                      </td>
                      <td className="fw-semibold text-truncate" style={{ maxWidth: 260 }} title={item.raw_description}>
                        {item.raw_description}
                      </td>
                      <td className="text-info text-truncate" style={{ maxWidth: 220 }} title={item.clean_query}>
                        {item.clean_query}
                      </td>

                      {batchResults.length > 0 ? (
                        <>
                          <td>
                            {result?.lowest_price ? (
                              <div className="fw-bold text-success">
                                ₹{result.lowest_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                <span className="text-secondary small fw-normal ms-1">/{result.common_uom}</span>
                              </div>
                            ) : (
                              <span className="text-muted small">RFQ Required</span>
                            )}
                          </td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5 small">
                              {result?.best_supplier || 'Market Multi'}
                            </span>
                          </td>
                          <td className="text-secondary">
                            {result?.average_price ? (
                              `₹${result.average_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>
                            {result?.potential_savings_percentage ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5">
                                -{result.potential_savings_percentage}%
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="text-end">
                            <div className="d-flex align-items-center justify-content-end gap-1.5">
                              {result?.direct_link && (
                                <a
                                  href={result.direct_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="craftsman-btn-outline py-1 px-2 text-decoration-none"
                                  style={{ fontSize: '0.74rem' }}
                                  title="Verify live offer on supplier portal"
                                >
                                  <ExternalLink size={12} className="text-info" />
                                  <span>Verify</span>
                                </a>
                              )}
                              {result?.search_id && onSelectSearchId && (
                                <button
                                  type="button"
                                  onClick={() => onSelectSearchId(result.search_id!)}
                                  className="craftsman-btn-primary py-1 px-2"
                                  style={{ fontSize: '0.74rem' }}
                                  title="View full 7-supplier comparison matrix"
                                >
                                  <Search size={12} />
                                  <span>7 Portals</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      ) : (
                        <td>
                          {item.extracted_part_number ? (
                            <span className="badge bg-info-subtle text-info border border-info-subtle mono">
                              {item.extracted_part_number}
                            </span>
                          ) : (
                            <span className="text-muted small">Generic Desc</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
