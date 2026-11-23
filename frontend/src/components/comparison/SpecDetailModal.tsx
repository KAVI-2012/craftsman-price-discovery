import React from 'react';
import { ComparisonItem } from '../../types';
import { X, ExternalLink, ShieldCheck, Tag, Box, MapPin, Truck, CheckCircle2, Award } from 'lucide-react';

interface SpecDetailModalProps {
  item: ComparisonItem | null;
  onClose: () => void;
}

export const SpecDetailModal: React.FC<SpecDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const { price_info } = item;

  const getVerifiedLiveUrl = () => {
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

  const liveUrl = getVerifiedLiveUrl();

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1050, backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content craftsman-card p-0 overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          {/* Header */}
          <div className="modal-header border-bottom p-3.5" style={{ borderColor: 'var(--border-color)' }}>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-primary p-1 px-2.5" style={{ fontSize: '0.7rem' }}>
                  Slot #{item.slot_number} • {item.supplier_name}
                </span>
                {item.is_lowest_price && (
                  <span className="badge-lowest">Lowest Market Price</span>
                )}
                <span className="badge-match-exact">
                  ★ {item.match_confidence}% Confidence
                </span>
              </div>
              <h5 className="modal-title fw-bold" style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                {item.product_name}
              </h5>
            </div>
            <button type="button" className="btn text-secondary p-1" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            <div className="row g-4">
              {/* Left Column: Specs */}
              <div className="col-12 col-md-7">
                <h6 className="fw-bold text-uppercase text-muted small mb-2.5" style={{ fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                  Technical Specifications
                </h6>
                <div className="table-responsive rounded-2 border" style={{ borderColor: 'var(--border-color)' }}>
                  <table className="table table-sm mb-0" style={{ color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                    <tbody>
                      <tr>
                        <td className="text-secondary fw-medium px-3 py-2" style={{ width: '40%', background: 'var(--bg-card)' }}>Part Number</td>
                        <td className="mono fw-bold px-3 py-2" style={{ background: 'var(--bg-secondary)' }}>{item.part_number || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="text-secondary fw-medium px-3 py-2" style={{ background: 'var(--bg-card)' }}>Manufacturer</td>
                        <td className="px-3 py-2" style={{ background: 'var(--bg-secondary)' }}>{item.manufacturer || 'OEM / Certified Partner'}</td>
                      </tr>
                      {item.specifications && Object.entries(item.specifications).map(([key, val]) => (
                        <tr key={key}>
                          <td className="text-secondary fw-medium px-3 py-2" style={{ background: 'var(--bg-card)' }}>{key}</td>
                          <td className="px-3 py-2" style={{ background: 'var(--bg-secondary)' }}>{String(val)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {item.description && (
                  <div className="mt-3">
                    <h6 className="fw-bold text-uppercase text-muted small mb-1" style={{ fontSize: '0.72rem' }}>
                      Product Overview
                    </h6>
                    <p className="text-secondary small mb-0" style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                      {item.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Commercial Terms & UOM Normalization */}
              <div className="col-12 col-md-5">
                <h6 className="fw-bold text-uppercase text-muted small mb-2.5" style={{ fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                  UOM Normalization & Pricing
                </h6>

                <div className="p-3 rounded-2 border mb-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="text-muted small">Standard Comparison Price</span>
                    <span className="badge bg-info-subtle text-info fw-semibold" style={{ fontSize: '0.7rem' }}>
                      / {price_info.common_uom || 'Unit'}
                    </span>
                  </div>
                  {price_info.is_uom_normalized !== false && price_info.normalized_price_common !== null ? (
                    <div className="h3 fw-bold text-success mb-1">
                      ₹{price_info.normalized_price_common?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  ) : (
                    <div className="badge bg-secondary-subtle text-warning border border-warning-subtle py-1.5 px-2.5 my-1">
                      Conversion Not Available
                    </div>
                  )}
                  <div className="text-secondary small mt-1.5 pt-1.5 border-top" style={{ borderColor: 'var(--border-color)' }}>
                    Original Supplier Rate: <strong>{price_info.currency} {price_info.original_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / {price_info.original_uom || 'Unit'}</strong>
                  </div>
                  <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                    Status: <span className="text-info">{price_info.uom_conversion_status || 'Exact UOM Match'}</span>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2 text-secondary small" style={{ fontSize: '0.8rem' }}>
                  <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Minimum Order (MOQ):</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{price_info.moq}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Stock Availability:</span>
                    <strong className="text-success">{price_info.availability}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Tax Included (GST):</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{price_info.tax_included ? `Yes (${price_info.tax_rate}%)` : 'Excluded'}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Shipping Charges:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{price_info.shipping_charges === 0 ? 'Free Standard Delivery' : `₹${price_info.shipping_charges}`}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Supplier Hub:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{price_info.supplier_location || 'Pan-India Distribution'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-top p-3 d-flex justify-content-between" style={{ borderColor: 'var(--border-color)' }}>
            <button type="button" className="craftsman-btn-outline" onClick={onClose}>
              Close Preview
            </button>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="craftsman-btn-primary"
            >
              <ExternalLink size={15} />
              <span>Open Direct Page on {item.supplier_name}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
