import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/api';
import { ComparisonMatrixResponse, SearchHistoryItem } from '../types';
import { PriceCharts } from '../components/comparison/PriceCharts';
import { ComparisonTable } from '../components/comparison/ComparisonTable';
import { Scale, FileSpreadsheet, FileText, ArrowRight, Layers, ShieldCheck } from 'lucide-react';

export const ComparisonPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchIdParam = searchParams.get('search_id');

  const [historyList, setHistoryList] = useState<SearchHistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<number>(searchIdParam ? parseInt(searchIdParam, 10) : 1);
  const [data, setData] = useState<ComparisonMatrixResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadComparison(selectedId);
    }
  }, [selectedId]);

  const loadHistory = async () => {
    try {
      const items = await apiClient.getSearchHistory(50);
      setHistoryList(items);
      if (!searchIdParam && items.length > 0) {
        setSelectedId(items[0].id);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  };

  const loadComparison = async (id: number) => {
    try {
      setLoading(true);
      const res = await apiClient.getSearchResults(id);
      setData(res);
      setSearchParams({ search_id: String(id) });
    } catch (e) {
      console.error('Failed to load comparison:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Supplier Price Comparison & Benchmarking Matrix
          </h4>
          <p className="text-secondary small mb-0">
            Multi-source industrial price benchmarking matrix with specification verification across 7 portals.
          </p>
        </div>

        {/* Search Selector & Export */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          <select
            className="form-select craftsman-input w-auto"
            style={{ fontSize: '0.84rem' }}
            value={selectedId}
            onChange={(e) => setSelectedId(parseInt(e.target.value, 10))}
          >
            {historyList.map((h) => (
              <option key={h.id} value={h.id}>
                #{h.id}: {h.part_number || h.query_text} ({new Date(h.created_at).toLocaleDateString()})
              </option>
            ))}
          </select>

          {data && (
            <>
              <a
                href={apiClient.getExcelExportUrl(data.search_id)}
                className="craftsman-btn-outline text-decoration-none"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                download
              >
                <FileSpreadsheet size={15} className="text-success" />
                <span>Export Excel</span>
              </a>
              <a
                href={apiClient.getPdfExportUrl(data.search_id)}
                className="craftsman-btn-outline text-decoration-none"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                download
              >
                <FileText size={15} className="text-danger" />
                <span>Export PDF</span>
              </a>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="craftsman-card text-center py-5">
          <div className="spinner-border text-primary me-2" role="status"></div>
          <span className="text-muted">Loading supplier comparison matrix...</span>
        </div>
      ) : data ? (
        <div>
          <PriceCharts data={data} />
          <ComparisonTable items={data.items} currency={data.currency} />
        </div>
      ) : (
        <div className="craftsman-card text-center py-5 text-muted">
          Select a search record above to view the price comparison matrix.
        </div>
      )}
    </div>
  );
};
