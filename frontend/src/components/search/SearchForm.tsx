import React, { useState } from 'react';
import { Search, Sparkles, Filter, SlidersHorizontal, ArrowRight, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';

interface SearchFormProps {
  onSearch: (payload: {
    query: string;
    part_number?: string;
    category?: string;
    target_currency?: string;
    manufacturer?: string;
    specifications?: Record<string, any>;
  }) => void;
  isLoading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [category, setCategory] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('INR');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [specsInput, setSpecsInput] = useState('');

  const sampleSearches = [
    { label: '12mm TMT Bars (Fe 550D)', part: 'TMT-12MM-FE550D', query: '12mm TMT Bars', cat: 'Raw Materials & Construction' },
    { label: 'RL-123 Relief Valve', part: 'RL-123_Z462H1712106', query: 'Hydraulic Pressure Relief Valve 350 Bar', cat: 'Hydraulics' },
    { label: 'Siemens 5 HP Motor', part: '1LE7501-1DB23-4AA4', query: '5 HP 3-Phase Induction Motor 1440 RPM', cat: 'Electric Motors' },
    { label: 'Stainless Steel Sheet 304', part: 'SS-304-2MM-CR', query: 'Stainless Steel Sheet 304 Grade 2mm', cat: 'Raw Materials' },
    { label: 'CNC Tool Holder BT40', part: 'BT40-ER32-70', query: 'BT40 Collet Chuck ER32 Tool Holder', cat: 'CNC Tooling' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !partNumber.trim()) return;

    let parsedSpecs: Record<string, any> = {};
    if (specsInput.trim()) {
      specsInput.split(',').forEach((item) => {
        const [k, v] = item.split(':');
        if (k && v) parsedSpecs[k.trim()] = v.trim();
      });
    }

    onSearch({
      query: query.trim() || partNumber.trim(),
      part_number: partNumber.trim() || undefined,
      category: category.trim() || undefined,
      target_currency: targetCurrency,
      manufacturer: manufacturer.trim() || undefined,
      specifications: Object.keys(parsedSpecs).length > 0 ? parsedSpecs : undefined
    });
  };

  const handleSelectSample = (sample: typeof sampleSearches[0]) => {
    setQuery(sample.query);
    setPartNumber(sample.part);
    setCategory(sample.cat);
  };

  const handleClear = () => {
    setQuery('');
    setPartNumber('');
    setCategory('');
    setManufacturer('');
    setSpecsInput('');
  };

  return (
    <div className="craftsman-card mb-4" style={{ background: 'var(--bg-card)' }}>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {/* Main Item Search */}
          <div className="col-12 col-lg-7">
            <label className="form-label small fw-semibold text-secondary d-flex justify-content-between align-items-center mb-1.5">
              <span>Item Description / Technical Keywords <span className="text-danger">*</span></span>
              {(query || partNumber) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="btn btn-link p-0 text-muted small text-decoration-none"
                  style={{ fontSize: '0.75rem' }}
                >
                  Clear all
                </button>
              )}
            </label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-control craftsman-input border-start-0 ps-0"
                placeholder="e.g. Hydraulic Relief Valve 350 Bar, Industrial Electric Motor 5 HP..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Part Number / Item Code */}
          <div className="col-12 col-md-8 col-lg-3">
            <label className="form-label small fw-semibold text-secondary mb-1.5">
              Part Number / OEM Code
            </label>
            <input
              type="text"
              className="form-control craftsman-input mono"
              placeholder="e.g. RL-123_Z462H1712106"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
            />
          </div>

          {/* Currency Selection */}
          <div className="col-12 col-md-4 col-lg-2">
            <label className="form-label small fw-semibold text-secondary mb-1.5">
              Target Currency
            </label>
            <select
              className="form-select craftsman-input"
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value)}
            >
              <option value="INR">INR (₹) Base</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        {/* Quick Sample Search Buttons */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 pt-2.5 border-top" style={{ borderColor: 'var(--border-color)' }}>
          <div className="d-flex flex-wrap align-items-center gap-1.5">
            <span className="text-muted small d-flex align-items-center gap-1 me-1" style={{ fontSize: '0.78rem' }}>
              <Sparkles size={14} className="text-warning" /> Benchmark Parts:
            </span>
            {sampleSearches.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(s)}
                className="badge btn p-1.5 px-2.5 text-secondary border rounded-pill transition-all"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  fontSize: '0.74rem',
                  fontWeight: 500
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Advanced Specs Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn btn-sm text-secondary d-flex align-items-center gap-1 p-0"
            style={{ fontSize: '0.8rem' }}
          >
            <SlidersHorizontal size={14} />
            <span>{showAdvanced ? 'Hide Advanced Filters' : 'Advanced Specs & Filters'}</span>
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvanced && (
          <div className="p-3 mt-3 rounded-2 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label small text-secondary mb-1">Item Category</label>
                <input
                  type="text"
                  className="form-control form-control-sm craftsman-input"
                  placeholder="e.g. Hydraulics, Motors, Bearings"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small text-secondary mb-1">Preferred Manufacturer</label>
                <input
                  type="text"
                  className="form-control form-control-sm craftsman-input"
                  placeholder="e.g. Bosch Rexroth, Siemens, SKF"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small text-secondary mb-1">Key-Value Specifications</label>
                <input
                  type="text"
                  className="form-control form-control-sm craftsman-input"
                  placeholder="Key:Value, e.g. Pressure:350 Bar, Flow:120 LPM"
                  value={specsInput}
                  onChange={(e) => setSpecsInput(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="d-flex justify-content-end mt-3 pt-2">
          <button
            type="submit"
            disabled={isLoading || (!query.trim() && !partNumber.trim())}
            className="craftsman-btn-primary px-4 py-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                <span>Orchestrating 7 Supplier Portals...</span>
              </>
            ) : (
              <>
                <Search size={17} />
                <span>Discover Market Prices Across 7 Portals</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
