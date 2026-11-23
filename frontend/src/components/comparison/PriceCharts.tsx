import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { ComparisonMatrixResponse } from '../../types';
import { TrendingDown, Award, DollarSign, Percent, ShieldCheck, Zap } from 'lucide-react';

interface PriceChartsProps {
  data: ComparisonMatrixResponse;
}

export const PriceCharts: React.FC<PriceChartsProps> = ({ data }) => {
  const chartData = data.items
    .filter((item) => item.price_info.is_uom_normalized !== false && item.price_info.normalized_price_common !== null)
    .map((item) => ({
      name: item.supplier_name.split(' ')[0], // short name
      fullName: item.supplier_name,
      price: item.price_info.normalized_price_common ?? item.price_info.normalized_price_inr ?? 0,
      originalPrice: item.price_info.original_price,
      originalUom: item.price_info.original_uom || 'Unit',
      currency: item.price_info.currency,
      commonUom: data.common_uom || 'Piece',
      isLowest: item.is_lowest_price,
      confidence: item.match_confidence
    }));

  const lowestItem = data.items.find((i) => i.is_lowest_price);
  const highestPrice = data.highest_price || 0;
  const lowestPrice = data.lowest_price || 0;
  const savings = Math.max(0, highestPrice - lowestPrice);
  const savingsPct = highestPrice > 0 ? ((savings / highestPrice) * 100).toFixed(1) : '0.0';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div
          className="p-3 rounded-2 shadow-lg"
          style={{ background: '#0F172A', border: '1px solid #334155', color: '#FFFFFF', fontSize: '0.8rem', minWidth: 200 }}
        >
          <div className="fw-bold mb-1" style={{ color: '#F8FAFC' }}>{p.fullName}</div>
          <div className="text-info fw-semibold">
            Normalized: ₹{p.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / {p.commonUom}
          </div>
          <div className="text-muted small">
            Original: {p.currency} {p.originalPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / {p.originalUom}
          </div>
          <div className="text-secondary small mt-1">AI Match Confidence: {p.confidence}%</div>
          {p.isLowest && (
            <div className="badge bg-success mt-1.5 d-inline-flex align-items-center gap-1">
              ★ Lowest Benchmark Price
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-4">
      {/* 4 Distinct KPI Stat Cards */}
      <div className="row g-3 mb-4">
        {/* Lowest Available Price */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="craftsman-card kpi-card green h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-semibold text-uppercase d-flex align-items-center gap-1.5" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  <span>Lowest Market Price</span>
                  <span className="badge bg-success-subtle text-success py-0 px-1 font-monospace" style={{ fontSize: '0.65rem' }}>
                    /{data.common_uom || 'Unit'}
                  </span>
                </div>
                <div className="h4 mb-0 fw-bold mt-1 text-success">
                  ₹{data.lowest_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || 'N/A'}
                </div>
                <div className="text-secondary small mt-1 text-truncate" style={{ fontSize: '0.74rem' }}>
                  Via {lowestItem ? lowestItem.supplier_name : 'Verified Supplier'}
                </div>
              </div>
              <div className="rounded-3 p-2.5 bg-success-subtle text-success">
                <Award size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Average Market Price */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="craftsman-card kpi-card h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-semibold text-uppercase d-flex align-items-center gap-1.5" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  <span>Average Market Price</span>
                  <span className="badge bg-primary-subtle text-primary py-0 px-1 font-monospace" style={{ fontSize: '0.65rem' }}>
                    /{data.common_uom || 'Unit'}
                  </span>
                </div>
                <div className="h4 mb-0 fw-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  ₹{data.average_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || 'N/A'}
                </div>
                <div className="text-secondary small mt-1" style={{ fontSize: '0.74rem' }}>
                  Across {data.items.length} supplier portals
                </div>
              </div>
              <div className="rounded-3 p-2.5 bg-primary-subtle text-primary">
                <DollarSign size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Highest Quoted Price */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="craftsman-card kpi-card amber h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-semibold text-uppercase d-flex align-items-center gap-1.5" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  <span>Highest Quoted Price</span>
                  <span className="badge bg-warning-subtle text-warning py-0 px-1 font-monospace" style={{ fontSize: '0.65rem' }}>
                    /{data.common_uom || 'Unit'}
                  </span>
                </div>
                <div className="h4 mb-0 fw-bold mt-1" style={{ color: 'var(--accent-amber)' }}>
                  ₹{data.highest_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || 'N/A'}
                </div>
                <div className="text-secondary small mt-1" style={{ fontSize: '0.74rem' }}>
                  Market upper-bound benchmark
                </div>
              </div>
              <div className="rounded-3 p-2.5 bg-warning-subtle text-warning">
                <TrendingDown size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Potential Cost Savings */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="craftsman-card kpi-card cyan h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-semibold text-uppercase d-flex align-items-center gap-1.5" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  <span>Potential Cost Savings</span>
                  <span className="badge bg-info-subtle text-info py-0 px-1 font-monospace" style={{ fontSize: '0.65rem' }}>
                    /{data.common_uom || 'Unit'}
                  </span>
                </div>
                <div className="h4 mb-0 fw-bold mt-1 text-info">
                  ₹{savings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-success small fw-semibold mt-1" style={{ fontSize: '0.74rem' }}>
                  {savingsPct}% procurement variance
                </div>
              </div>
              <div className="rounded-3 p-2.5 bg-info-subtle text-info">
                <Percent size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Chart Card */}
      <div className="craftsman-card">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h6 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
              Supplier Price Benchmarking Variance (INR)
            </h6>
            <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>
              Normalized direct comparison across 7 supplier portals
            </span>
          </div>

          <div className="d-flex align-items-center gap-3 small">
            <div className="d-flex align-items-center gap-1.5">
              <span className="d-inline-block rounded-circle" style={{ width: 10, height: 10, background: '#10B981' }}></span>
              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Lowest Price</span>
            </div>
            <div className="d-flex align-items-center gap-1.5">
              <span className="d-inline-block rounded-circle" style={{ width: 10, height: 10, background: '#2563EB' }}></span>
              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Supplier Quote</span>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="var(--text-muted)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isLowest ? '#10B981' : '#2563EB'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
