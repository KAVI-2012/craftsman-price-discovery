import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { PriceHistoryResponse } from '../../types';
import { TrendingUp, TrendingDown, Minus, Clock, Calendar, BarChart3 } from 'lucide-react';

interface PriceHistoryChartProps {
  historyData: PriceHistoryResponse | null;
  partNumber: string;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ historyData, partNumber }) => {
  if (!historyData || !historyData.has_history) {
    return (
      <div className="craftsman-card text-center py-5">
        <Clock size={36} className="text-muted mb-2 opacity-40" />
        <h6 className="fw-semibold text-secondary">No Historical Price Movements Recorded Yet</h6>
        <p className="text-muted small mb-0" style={{ maxWidth: 480, margin: '0 auto' }}>
          Historical price trends are accumulated across recurring research runs for part <strong className="mono text-info">{partNumber}</strong>.
        </p>
      </div>
    );
  }

  // Format data for Recharts: group by recorded_at date
  const dateMap: Record<string, any> = {};
  const supplierColors = ['#10B981', '#3B82F6', '#06B6D4', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'];
  const suppliers = Array.from(new Set(historyData.data_points.map((p) => p.supplier_name)));

  historyData.data_points.forEach((p) => {
    if (!dateMap[p.recorded_at]) {
      dateMap[p.recorded_at] = { date: p.recorded_at.split(' ')[0] };
    }
    dateMap[p.recorded_at][p.supplier_name] = p.normalized_price_inr;
  });

  const chartPoints = Object.values(dateMap);

  return (
    <div className="craftsman-card mb-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2.5 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <h6 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
            Historical Price Movement & Volatility Trend (60 Days)
          </h6>
          <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>
            Part Code: <strong className="mono text-info">{partNumber}</strong>
          </span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary p-1.5 px-2.5 rounded-pill" style={{ fontSize: '0.72rem' }}>
            {historyData.total_records} Data Observations
          </span>
        </div>
      </div>

      {/* Supplier Trends Badges */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {historyData.supplier_trends.map((t, idx) => (
          <div
            key={idx}
            className="p-2 px-2.5 rounded-2 border small d-flex align-items-center gap-2"
            style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', fontSize: '0.78rem' }}
          >
            <span className="fw-semibold" style={{ color: supplierColors[idx % supplierColors.length] }}>
              {t.supplier_name.split(' ')[0]}:
            </span>
            <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>
              ₹{t.current_price?.toLocaleString('en-IN')}
            </span>
            {t.trend === 'INCREASED' ? (
              <span className="text-danger small d-flex align-items-center fw-semibold">
                <TrendingUp size={12} className="me-0.5" /> +{t.percentage_change}%
              </span>
            ) : t.trend === 'DECREASED' ? (
              <span className="text-success small d-flex align-items-center fw-semibold">
                <TrendingDown size={12} className="me-0.5" /> {t.percentage_change}%
              </span>
            ) : (
              <span className="text-muted small d-flex align-items-center">
                <Minus size={12} className="me-0.5" /> Stable
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 270 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartPoints} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={11}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: '#0F172A', borderColor: '#334155', color: '#FFFFFF', fontSize: '0.8rem', borderRadius: 8 }}
            />
            <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 10 }} />
            {suppliers.map((s, idx) => (
              <Line
                key={s}
                type="monotone"
                dataKey={s}
                name={s.split(' ')[0]}
                stroke={supplierColors[idx % supplierColors.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
