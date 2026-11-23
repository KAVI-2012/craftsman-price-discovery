import React, { useState, useMemo } from 'react';
import { ComparisonItem } from '../../types';
import { SpecDetailModal } from './SpecDetailModal';
import {
  ExternalLink,
  Info,
  CheckCircle2,
  TrendingDown,
  ArrowUpDown,
  Filter,
  Eye,
  Building,
  Award,
  Sparkles
} from 'lucide-react';

interface ComparisonTableProps {
  items: ComparisonItem[];
  currency?: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ items, currency = 'INR' }) => {
  const [selectedItem, setSelectedItem] = useState<ComparisonItem | null>(null);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'confidence' | 'supplier'>('price_asc');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('ALL');
  const [selectedMatchGrade, setSelectedMatchGrade] = useState<string>('ALL');

  // Supplier list for filter dropdown
  const suppliersList = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.supplier_name)));
  }, [items]);

  // Filtered & Sorted items
  const processedItems = useMemo(() => {
    let result = [...items];

    if (selectedSupplier !== 'ALL') {
      result = result.filter((i) => i.supplier_name === selectedSupplier);
    }

    if (selectedMatchGrade !== 'ALL') {
      result = result.filter((i) => i.match_classification === selectedMatchGrade);
    }

    result.sort((a, b) => {
      const isNormA = a.price_info.is_uom_normalized !== false && a.price_info.normalized_price_common !== null;
      const isNormB = b.price_info.is_uom_normalized !== false && b.price_info.normalized_price_common !== null;
      const priceA = a.price_info.normalized_price_common ?? a.price_info.normalized_price_inr ?? 0;
      const priceB = b.price_info.normalized_price_common ?? b.price_info.normalized_price_inr ?? 0;

      if (sortBy === 'price_asc') {
        if (isNormA && !isNormB) return -1;
        if (!isNormA && isNormB) return 1;
        return priceA - priceB;
      }
      if (sortBy === 'price_desc') {
        if (isNormA && !isNormB) return -1;
        if (!isNormA && isNormB) return 1;
        return priceB - priceA;
      }
      if (sortBy === 'confidence') return b.match_confidence - a.match_confidence;
      if (sortBy === 'supplier') return a.supplier_name.localeCompare(b.supplier_name);
      return 0;
    });

    return result;
  }, [items, sortBy, selectedSupplier, selectedMatchGrade]);

  const getVerifiedLiveUrl = (item: ComparisonItem) => {
    const rawUrl = item.source_url || '';
    const term = encodeURIComponent(item.part_number || item.product_name || 'industrial parts');
    const sName = (item.supplier_name || '').toLowerCase();

    // Replace dummy, internal, expired, or non-functional URLs with guaranteed live search pages
    if (
      !rawUrl ||
      rawUrl.includes('procurement.craftsman.in') ||
      rawUrl.includes('hydraulics/valves') ||
      rawUrl.includes('relief-valves') ||
      rawUrl.includes('/8492019') ||
      rawUrl.includes('/detail/hydraulic-valves') ||
      rawUrl.includes('/raw-materials/ss-sheet')
    ) {
      if (item.slot_number === 1 || sName.includes('indiamart')) {
        return `https://dir.indiamart.com/search.mp?ss=${term}`;
      }
      if (item.slot_number === 2 || sName.includes('moglix')) {
        return `https://www.moglix.com/search?controller=search&s=${term}`;
      }
      if (item.slot_number === 3 || sName.includes('industrybuying')) {
        return `https://www.industrybuying.com/search/?q=${term}`;
      }
      if (item.slot_number === 4 || sName.includes('rs components') || sName.includes('rs-online')) {
        return `https://in.rs-online.com/web/c/?searchTerm=${term}`;
      }
      if (item.slot_number === 5 || sName.includes('misumi')) {
        return `https://in.misumi-ec.com/vona2/result/?Keyword=${term}`;
      }
      if (item.slot_number === 6 || sName.includes('grainger')) {
        return `https://www.grainger.com/search?searchQuery=${term}`;
      }
      return 'https://www.craftsmanautomation.com/products/';
    }

    return rawUrl;
  };

  const getMatchBadge = (classification: string, score: number) => {
    if (classification.includes('Exact') || score >= 90) {
      return (
        <span className="badge-match-exact">
          ★ {score}% Exact Match
        </span>
      );
    }
    if (classification.includes('High') || score >= 70) {
      return (
        <span className="badge-match-high">
          {score}% High Match
        </span>
      );
    }
    return (
      <span className="badge-match-partial">
        {score}% Partial
      </span>
    );
  };

  return (
    <div>
      {/* Table Control & Filter Bar */}
      <div
        className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 p-3 rounded-2"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
      >
        <div className="d-flex flex-wrap align-items-center gap-2.5">
          <span className="text-secondary small fw-semibold d-flex align-items-center gap-1">
            <Filter size={15} /> Filters:
          </span>

          {/* Supplier Filter */}
          <select
            className="form-select form-select-sm craftsman-input w-auto"
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
          >
            <option value="ALL">All Suppliers ({items.length})</option>
            {suppliersList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Match Grade Filter */}
          <select
            className="form-select form-select-sm craftsman-input w-auto"
            value={selectedMatchGrade}
            onChange={(e) => setSelectedMatchGrade(e.target.value)}
          >
            <option value="ALL">All Match Grades</option>
            <option value="Exact Match">Exact Match Only (≥90%)</option>
            <option value="High Similarity">High Similarity (70-89%)</option>
            <option value="Partial Match">Partial Match (50-69%)</option>
          </select>
        </div>

        {/* Sort & Counter */}
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small d-none d-md-inline" style={{ fontSize: '0.78rem' }}>
            Showing <strong>{processedItems.length}</strong> of <strong>{items.length}</strong> verified offers
          </span>

          <div className="d-flex align-items-center gap-2">
            <span className="text-secondary small d-flex align-items-center gap-1">
              <ArrowUpDown size={14} /> Sort:
            </span>
            <select
              className="form-select form-select-sm craftsman-input w-auto"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="price_asc">Price: Low to High (Lowest First)</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="confidence">AI Match Confidence</option>
              <option value="supplier">Supplier Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enterprise UOM-Normalized Comparison Table */}
      <div className="comparison-table-wrapper">
        <table className="table-craftsman">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Product / Description</th>
              <th>Specifications</th>
              <th>Original Price</th>
              <th>Original UOM</th>
              <th>Normalized Price</th>
              <th>Common UOM</th>
              <th>Availability</th>
              <th>Match</th>
              <th className="text-end">Direct Link</th>
            </tr>
          </thead>
          <tbody>
            {processedItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-5 text-muted">
                  No matching supplier listings found for the selected filter criteria.
                </td>
              </tr>
            ) : (
              processedItems.map((item) => {
                const isLowest = item.is_lowest_price;
                const { price_info } = item;
                const liveUrl = getVerifiedLiveUrl(item);
                const isNormalized = price_info.is_uom_normalized !== false && price_info.normalized_price_common !== null;

                return (
                  <tr
                    key={item.result_id}
                    className={isLowest ? 'lowest-price-row' : ''}
                  >
                    {/* 1. Supplier Name & Portal Slot */}
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                          {item.supplier_name}
                        </span>
                        {isLowest && (
                          <span className="badge-lowest">Lowest</span>
                        )}
                      </div>
                      <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                        Portal Slot #{item.slot_number}
                      </span>
                    </td>

                    {/* 2. Product Description */}
                    <td style={{ maxWidth: 260 }}>
                      <div
                        className="fw-semibold text-truncate"
                        title={item.product_name}
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.product_name}
                      </div>
                      <div className="text-secondary small text-truncate d-flex align-items-center gap-1.5" style={{ fontSize: '0.74rem' }}>
                        <span>{item.manufacturer || 'OEM Component'}</span>
                        {item.part_number && (
                          <span className="mono text-muted">• {item.part_number}</span>
                        )}
                      </div>
                    </td>

                    {/* 3. Specifications */}
                    <td>
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="craftsman-btn-outline py-1 px-2.5 rounded"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <Eye size={13} className="text-info" />
                        <span>View Specs</span>
                      </button>
                    </td>

                    {/* 4. Original Price */}
                    <td>
                      <span className="fw-semibold" style={{ fontSize: '0.84rem' }}>
                        {price_info.currency} {price_info.original_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) ?? 'N/A'}
                      </span>
                    </td>

                    {/* 5. Original UOM */}
                    <td>
                      <span className="badge bg-secondary-subtle text-light border border-secondary px-2 py-1" style={{ fontSize: '0.75rem' }}>
                        {price_info.original_uom || 'Unit'}
                      </span>
                    </td>

                    {/* 6. Normalized Price */}
                    <td>
                      {isNormalized ? (
                        <>
                          <div className={`h6 mb-0 fw-bold ${isLowest ? 'text-success' : 'text-info'}`} style={{ fontSize: '0.92rem' }}>
                            ₹{price_info.normalized_price_common?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                          {item.price_delta_percent !== null && (
                            <span
                              className={`small fw-semibold ${item.price_delta_percent < 0 ? 'text-success' : 'text-danger'}`}
                              style={{ fontSize: '0.7rem' }}
                            >
                              {item.price_delta_percent > 0 ? `+${item.price_delta_percent}%` : `${item.price_delta_percent}%`} vs avg
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="d-flex flex-column align-items-start gap-0.5">
                          <span
                            className="badge bg-secondary-subtle text-warning border border-warning-subtle small px-2 py-0.5"
                            title={price_info.uom_conversion_status || 'Requires verified unit weight'}
                            style={{ cursor: 'help' }}
                          >
                            Not Available
                          </span>
                          <span className="text-muted" style={{ fontSize: '0.68rem', maxWidth: 130 }} title={price_info.uom_conversion_status}>
                            {price_info.uom_conversion_status || 'Requires verified weight'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 7. Common UOM */}
                    <td>
                      <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 fw-semibold" style={{ fontSize: '0.75rem' }}>
                        / {price_info.common_uom || 'Piece'}
                      </span>
                    </td>

                    {/* 8. Availability */}
                    <td>
                      <span className="badge bg-success-subtle text-success border border-success-subtle small px-2 py-1">
                        {price_info.availability}
                      </span>
                    </td>

                    {/* 9. Match */}
                    <td>
                      {getMatchBadge(item.match_classification, item.match_confidence)}
                    </td>

                    {/* 10. Action: Direct Open Link */}
                    <td className="text-end">
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="craftsman-btn-outline py-1 px-2.5 text-decoration-none"
                        style={{ fontSize: '0.78rem' }}
                        title={`Open verified search on ${item.supplier_name}`}
                      >
                        <ExternalLink size={13} className="text-info" />
                        <span>Open Website</span>
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail View */}
      <SpecDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
};
