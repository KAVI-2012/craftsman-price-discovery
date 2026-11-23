import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/api';
import { ComparisonMatrixResponse, PriceHistoryResponse } from '../types';
import { SearchForm } from '../components/search/SearchForm';
import { SearchProgress } from '../components/search/SearchProgress';
import { PriceCharts } from '../components/comparison/PriceCharts';
import { ComparisonTable } from '../components/comparison/ComparisonTable';
import { PriceHistoryChart } from '../components/history/PriceHistoryChart';
import { FileSpreadsheet, FileText, History, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Search } from 'lucide-react';

export const DiscoveryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchIdParam = searchParams.get('search_id');

  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentPartNumber, setCurrentPartNumber] = useState('');
  const [comparisonData, setComparisonData] = useState<ComparisonMatrixResponse | null>(null);
  const [historyData, setHistoryData] = useState<PriceHistoryResponse | null>(null);
  const [showHistoryTab, setShowHistoryTab] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (searchIdParam) {
      loadExistingSearch(parseInt(searchIdParam, 10));
    } else {
      // Load baseline benchmark search #1 by default so the page displays rich data
      loadExistingSearch(1);
    }
  }, [searchIdParam]);

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
            Market Price Discovery & Multi-Portal Research
          </h4>
          <p className="text-secondary small mb-0">
            Real-time multi-website research engine across 7 industrial supplier portals.
          </p>
        </div>

        {comparisonData && (
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

      {/* Prominent Search Form */}
      <SearchForm onSearch={handleInitiateSearch} isLoading={isLoading} />

      {/* Error Alert */}
      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertTriangle size={18} />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Live Research Progress Tracker */}
      {isLoading && (
        <SearchProgress
          query={currentQuery}
          partNumber={currentPartNumber}
          isCompleted={!isLoading && !!comparisonData}
        />
      )}

      {/* Results Workspace */}
      {comparisonData && !isLoading && (
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
