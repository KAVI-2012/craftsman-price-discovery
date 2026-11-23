import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Globe, Cpu, Search, Check, Layers } from 'lucide-react';

interface SearchProgressProps {
  query: string;
  partNumber?: string;
  isCompleted: boolean;
}

export const SearchProgress: React.FC<SearchProgressProps> = ({ query, partNumber, isCompleted }) => {
  const steps = [
    { title: 'Understanding product requirements', desc: `Tokenizing specifications for ${partNumber || query}` },
    { title: 'Discovering 7 supplier portals', desc: 'IndiaMART, Moglix, Industrybuying, RS Components, Misumi, Grainger, Craftsman OEM' },
    { title: 'Analysing manufacturer websites', desc: 'Validating OEM catalog entries, datasheets, and model variations' },
    { title: 'Querying supplier portals in parallel', desc: 'Asynchronous fetch across 7 active connectors with bounded timeouts' },
    { title: 'Extracting product information & prices', desc: 'Parsing published prices, tax rates, MOQs, and lead times' },
    { title: 'Validating specifications & AI matching', desc: 'Checking HP, pressure, grade, and computing match confidence scores' },
    { title: 'Normalizing currencies & pricing units', desc: 'Converting foreign currencies (USD/EUR) to INR equivalent' },
    { title: 'Preparing comparison dashboard', desc: 'Highlighting lowest price and calculating potential cost savings' }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [analyzedCount, setAnalyzedCount] = useState(0);

  useEffect(() => {
    if (isCompleted) {
      setCurrentStep(steps.length);
      setDiscoveredCount(7);
      setAnalyzedCount(7);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          const next = prev + 1;
          setDiscoveredCount(Math.min(7, Math.floor((next / (steps.length - 1)) * 7)));
          setAnalyzedCount(Math.max(0, Math.min(7, Math.floor(((next - 1) / (steps.length - 1)) * 7))));
          return next;
        }
        return prev;
      });
    }, 550);

    return () => clearInterval(interval);
  }, [isCompleted]);

  const percentComplete = isCompleted ? 100 : Math.round((currentStep / steps.length) * 100);

  return (
    <div className="craftsman-card mb-4 border-primary" style={{ background: 'var(--bg-card)' }}>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-2.5 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
        <div className="d-flex align-items-center gap-2.5">
          <Loader2 size={20} className="text-primary animate-spin" />
          <div>
            <h6 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
              AI Market Price Discovery in Progress
            </h6>
            <span className="text-muted small" style={{ fontSize: '0.74rem' }}>
              Querying 7 industrial supplier networks in parallel
            </span>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 small">
          <span className="badge bg-secondary p-1.5 px-2.5">
            Discovered: <strong className="text-white">{isCompleted ? 7 : discoveredCount}</strong> / 7 Portals
          </span>
          <span className="badge bg-success p-1.5 px-2.5">
            Analyzed: <strong className="text-white">{isCompleted ? 7 : analyzedCount}</strong> / 7 Portals
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress mb-3" style={{ height: 6, background: 'var(--bg-secondary)' }}>
        <div
          className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
          style={{ width: `${percentComplete}%`, transition: 'width 0.4s ease' }}
        ></div>
      </div>

      {/* Steps Grid */}
      <div className="row g-2">
        {steps.map((step, idx) => {
          const isDone = isCompleted || idx < currentStep;
          const isCurrent = !isCompleted && idx === currentStep;

          return (
            <div key={idx} className="col-12 col-md-6">
              <div
                className="p-2.5 rounded-2 d-flex align-items-start gap-2.5 transition-all"
                style={{
                  background: isCurrent ? 'rgba(59, 130, 246, 0.08)' : (isDone ? 'rgba(16, 185, 129, 0.04)' : 'transparent'),
                  border: isCurrent ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent'
                }}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 size={16} className="text-success" />
                  ) : isCurrent ? (
                    <Loader2 size={16} className="text-primary animate-spin" />
                  ) : (
                    <div
                      className="rounded-circle border d-flex align-items-center justify-content-center text-muted"
                      style={{ width: 16, height: 16, fontSize: '0.65rem', borderColor: 'var(--border-color)' }}
                    >
                      {idx + 1}
                    </div>
                  )}
                </div>
                <div style={{ lineHeight: 1.25 }}>
                  <div
                    className="fw-semibold small"
                    style={{
                      color: isDone ? 'var(--text-primary)' : (isCurrent ? 'var(--accent-blue)' : 'var(--text-muted)'),
                      fontSize: '0.82rem'
                    }}
                  >
                    {step.title}
                  </div>
                  <div className="text-muted small mt-0.5" style={{ fontSize: '0.72rem' }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
