import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Cpu, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@craftsman.com');
  const [password, setPassword] = useState('CraftsmanAdmin#2026');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (role: 'admin' | 'procurement') => {
    if (role === 'admin') {
      setEmail('admin@craftsman.com');
      setPassword('CraftsmanAdmin#2026');
    } else {
      setEmail('procurement@craftsman.com');
      setPassword('Procurement#2026');
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 p-3"
      style={{
        background: 'radial-gradient(ellipse at top, #111D4A 0%, #0A0F1D 70%)'
      }}
    >
      <div className="craftsman-card p-4 p-md-5 shadow-lg" style={{ maxWidth: 440, width: '100%', background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        {/* Brand */}
        <div className="text-center mb-4">
          <div
            className="rounded-3 d-inline-flex align-items-center justify-content-center text-white mb-2.5 shadow"
            style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #1E40AF 0%, #06B6D4 100%)' }}
          >
            <Cpu size={26} />
          </div>
          <h4 className="fw-bold mb-0 text-white tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            CRAFTSMAN AUTOMATION
          </h4>
          <div className="text-info small fw-semibold" style={{ letterSpacing: '0.07em', fontSize: '0.74rem' }}>
            MARKET PRICE DISCOVERY PLATFORM
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3">
            <AlertCircle size={16} />
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small text-secondary">Work Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                className="form-control craftsman-input border-start-0"
                placeholder="name@craftsman.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small text-secondary">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                className="form-control craftsman-input border-start-0"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="craftsman-btn-primary w-100 justify-content-center py-2.5"
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div className="mt-4 pt-3 border-top text-center" style={{ borderColor: 'var(--border-color)' }}>
          <div className="text-muted small mb-2" style={{ fontSize: '0.74rem' }}>
            1-Click Demo Roles:
          </div>
          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="craftsman-btn-outline py-1 px-2.5"
              style={{ fontSize: '0.74rem' }}
            >
              Administrator
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('procurement')}
              className="craftsman-btn-outline py-1 px-2.5"
              style={{ fontSize: '0.74rem' }}
            >
              Senior Buyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
