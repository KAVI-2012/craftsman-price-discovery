import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/api';
import { ComparisonMatrixResponse, PriceHistoryResponse } from '../types';
import { SearchForm } from '../components/search/SearchForm';
import { SearchProgress } from '../components/search/SearchProgress';
import { ExcelBOMDiscovery } from '../components/search/ExcelBOMDiscovery';
import { PriceCharts } from '../components/comparison/PriceCharts';
import { ComparisonTable } from '../components/comparison/ComparisonTable';
import { PriceHistoryChart } from '../components/history/PriceHistoryChart';
import { FileSpreadsheet, FileText, History, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Search, UploadCloud, ArrowLeft } from 'lucide-react';

export const DiscoveryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchIdParam = searchParams.get('search_id');
  const modeParam = searchParams.get('mode');

  const [activeMode, setActiveMode] = useState<'single' | 'excel'>(modeParam === 'excel' ? 'excel' : 'single');
  const [bulkItemDetail, setBulkItemDetail] = useState<number | null>(null);

  useEffect(() => {
    if (modeParam === 'excel') {
      setActiveMode('excel');
    }
  }, [modeParam]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentPartNumber, setCurrentPartNumber] = useState('');
  const [comparisonData, setComparisonData] = useState<ComparisonMatrixResponse | null>(null);
  const [historyData, setHistoryData] = useState<PriceHistoryResponse | null>(null);
  const [showHistoryTab, setShowHistoryTab] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const qParam = searchParams.get('q');
    const partParam = searchParams.get('part');
    if (qParam || partParam) {
      handleInitiateSearch({
        query: qParam || partParam || '',
        part_number: partParam || undefined,
        target_currency: searchParams.get('currency') || 'INR'
      });
    } else if (searchIdParam) {
      loadExistingSearch(parseInt(searchIdParam, 10));
    }
  }, [searchParams]);

  const loadExistingSearch = async (id: number) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const data = await apiClient.getSearchResults(id);
      setComparisonData(data);
      setCurrentQuery(data.query_text);
      if (data.part_number) {
        setCurrentPartNumber(data.part_number);
        loadPartHistory(data.part_number);
      }
    } catch (e: any) {
      console.error('Failed to load search results:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPartHistory = async (partNo: string) => {
    try {
      const hist = await apiClient.getPartPriceHistory(partNo);
      setHistoryData(hist);
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  };

  const handleInitiateSearch = async (payload: {
    query: string;
    part_number?: string;
    category?: string;
    target_currency?: string;
    manufacturer?: string;
    specifications?: Record<string, any>;
  }) => {
    setIsLoading(true);
    setErrorMsg(null);
    setCurrentQuery(payload.query);
    setCurrentPartNumber(payload.part_number || '');

    try {
      const res = await apiClient.searchProduct(payload);
      setComparisonData(res);
      if (res.part_number) {
        loadPartHistory(res.part_number);
      }
    } catch (e: any) {
      setErrorMsg(e.response?.data?.detail || 'Failed to complete multi-portal search. Please verify network or connector configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Page Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Price Discovery Engine — Multi-Portal Market Research
          </h4>
          <p className="text-secondary small mb-0">
            Real-time multi-website research engine across 7 industrial supplier portals.
          </p>
        </div>

        {comparisonData && ((activeMode === 'single' && !bulkItemDetail) || bulkItemDetail) && (
          <div className="d-flex align-items-center gap-2">
            <a
              href={apiClient.getExcelExportUrl(comparisonData.search_id)}
              className="craftsman-btn-outline text-decoration-none"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
              download
            >
              <FileSpreadsheet size={15} className="text-success" />
              <span>Export Excel</span>
            </a>
            <a
              href={apiClient.getPdfExportUrl(comparisonData.search_id)}
              className="craftsman-btn-outline text-decoration-none"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
              download
            >
              <FileText size={15} className="text-danger" />
              <span>Export PDF</span>
            </a>
          </div>
        )}
      </div>

      {/* Mode Switcher Tabs - Hidden when viewing an item's 7-portal detail from bulk upload */}
      {!bulkItemDetail && (
        <div className="d-flex align-items-center gap-2 mb-4 p-1.5 rounded-3 d-inline-flex" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => setActiveMode('single')}
            className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-1.5 fw-semibold ${activeMode === 'single' ? 'craftsman-btn-primary' : 'text-secondary border-0 bg-transparent'}`}
            style={{ fontSize: '0.84rem' }}
          >
            <Search size={15} />
            <span>Single Item Search</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('excel')}
            className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-1.5 fw-semibold ${activeMode === 'excel' ? 'craftsman-btn-primary' : 'text-secondary border-0 bg-transparent'}`}
            style={{ fontSize: '0.84rem' }}
          >
            <UploadCloud size={15} />
            <span>Bulk Excel BOM Upload</span>
            <span className="badge bg-success-subtle text-success border border-success-subtle ms-1" style={{ fontSize: '0.68rem' }}>
              ITEM_CODE & DESC
            </span>
          </button>
        </div>
      )}

      {/* Bulk Item Inspection Return Bar - Allows user to easily go back to all bulk upload items */}
      {bulkItemDetail && (
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 p-3 rounded-3 shadow-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => setBulkItemDetail(null)}
            className="craftsman-btn-primary d-inline-flex align-items-center gap-2 py-2 px-3.5 shadow"
            style={{ fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Bulk BOM Upload Results</span>
          </button>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 small fw-semibold">
              7-Portal Market Comparison Status
            </span>
            <span className="text-secondary small d-none d-md-inline">
              Comparing IndiaMART, Moglix, Industrybuying, RS, Misumi, Grainger & Craftsman OEM
            </span>
          </div>
        </div>
      )}

      {/* Excel BOM Mode - Kept mounted in background so uploaded files & results are NEVER lost */}
      <div style={{ display: activeMode === 'excel' && !bulkItemDetail ? 'block' : 'none' }}>
        <ExcelBOMDiscovery
          onSelectSearchId={(id) => {
            setBulkItemDetail(id);
            loadExistingSearch(id);
          }}
        />
      </div>

      {/* Single Search Mode - Only shown in single mode and NOT when inspecting a bulk item */}
      {activeMode === 'single' && !bulkItemDetail && (
        <SearchForm onSearch={handleInitiateSearch} isLoading={isLoading} />
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertTriangle size={18} />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Live Research Progress Tracker - Dedicated to Single Item Search */}
      {activeMode === 'single' && isLoading && (
        <SearchProgress
          query={currentQuery}
          partNumber={currentPartNumber}
          isCompleted={!isLoading && !!comparisonData}
        />
      )}

      {/* Ready State - Displayed before user initiates a search in single mode */}
      {activeMode === 'single' && !bulkItemDetail && !comparisonData && !isLoading && !errorMsg && (
        <div className="text-center py-5 px-3 rounded-3 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center text-primary mb-3 shadow-sm" style={{ width: 48, height: 48, background: 'rgba(37, 99, 235, 0.1)' }}>
            <Search size={22} />
          </div>
          <h6 className="fw-bold mb-1 text-white">Ready for Real-Time Price Discovery</h6>
          <p className="text-secondary small mb-0" style={{ maxWidth: 480, margin: '0 auto' }}>
            Enter an item description, part number, or click a benchmark part above to compare live prices across 7 industrial supplier portals.
          </p>
        </div>
      )}

      {/* Results Workspace - Shown in Single Search mode OR when inspecting a Bulk Item's 7-portal status */}
      {((activeMode === 'single' && !bulkItemDetail) || bulkItemDetail) && comparisonData && !isLoading && (
        <div>
          {/* Search Result Summary Header */}
          <div className="craftsman-card mb-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5 small fw-bold">
                    <CheckCircle2 size={13} className="me-1 inline" /> Search Completed
                  </span>
                  <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-0.5 small fw-bold">
                    Standard UOM: {comparisonData.common_uom || 'Piece'}
                  </span>
                  <span className="mono text-muted small" style={{ fontSize: '0.78rem' }}>
                    Latency: {comparisonData.execution_time_seconds}s
                  </span>
                </div>
                <h5 className="fw-bold mt-1.5 mb-0" style={{ color: 'var(--text-primary)' }}>
                  {comparisonData.query_text}
                </h5>
                {comparisonData.part_number && (
                  <div className="text-secondary small mt-0.5">
                    Manufacturer Part No: <strong className="mono text-info">{comparisonData.part_number}</strong>
                  </div>
                )}
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="text-end">
                  <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Suppliers Discovered</div>
                  <div className="h5 mb-0 fw-bold text-success">
                    {comparisonData.successful_suppliers_count} / {comparisonData.total_suppliers_queried} Portals
                  </div>
                </div>

                <div className="border-start ps-3" style={{ borderColor: 'var(--border-color)' }}>
                  <button
                    onClick={() => setShowHistoryTab(!showHistoryTab)}
                    className={`craftsman-btn-outline ${showHistoryTab ? 'bg-primary text-white border-primary' : ''}`}
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                  >
                    <History size={15} />
                    <span>{showHistoryTab ? 'Hide Price History' : 'Track Price History'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Price Chart (Collapsible / Toggleable) */}
          {showHistoryTab && (
            <PriceHistoryChart
              historyData={historyData}
              partNumber={comparisonData.part_number || comparisonData.query_text}
            />
          )}

          {/* Price Comparison Analytics & Charts */}
          <PriceCharts data={comparisonData} />

          {/* 11-Column Comprehensive Comparison Matrix */}
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2.5">
              <h5 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                Supplier Price Comparison Matrix (Standardized to /{comparisonData.common_uom || 'Piece'})
              </h5>
              <div className="small text-muted d-flex align-items-center gap-1.5" style={{ fontSize: '0.78rem' }}>
                <ShieldCheck size={15} className="text-success" />
                <span>Verified published prices with direct links</span>
              </div>
            </div>
            <ComparisonTable items={comparisonData.items} currency={comparisonData.currency} />
          </div>
        </div>
      )}
    </div>
  );
};
