import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Shield, CheckCircle, XCircle, Lock, Mail, Building, Plus, X } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'procurement',
    department: 'Direct Material Sourcing'
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.listUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (userId: number) => {
    try {
      const updated = await apiClient.toggleUserActive(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Cannot update user status');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const created = await apiClient.createUser(newUser);
      setUsers((prev) => [...prev, created]);
      setShowAddModal(false);
      setNewUser({ email: '', full_name: '', password: '', role: 'procurement', department: 'Direct Material Sourcing' });
    } catch (e: any) {
      setErrorMsg(e.response?.data?.detail || 'Failed to create user account');
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            User Management & Role-Based Access Control
          </h4>
          <p className="text-secondary small mb-0">
            Manage procurement buyers and administrative credentials for Craftsman Automation.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="craftsman-btn-primary btn-sm">
          <UserPlus size={15} />
          <span>Add Procurement Buyer</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="craftsman-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table-craftsman">
            <thead>
              <tr>
                <th>User / Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Department</th>
                <th>Account Status</th>
                <th>Created Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                    Loading users...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2.5">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold small shadow-sm"
                          style={{
                            width: 32,
                            height: 32,
                            background: u.role === 'admin' ? 'linear-gradient(135deg, #EF4444, #B91C1C)' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                            fontSize: '0.8rem'
                          }}
                        >
                          {u.full_name ? u.full_name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="fw-semibold" style={{ color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                          {u.full_name}
                        </div>
                      </div>
                    </td>
                    <td className="small text-secondary">{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-primary'} p-1 px-2 small`} style={{ fontSize: '0.66rem' }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="small text-secondary">{u.department || 'Procurement'}</td>
                    <td>
                      {u.is_active ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle small px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
                          Active
                        </span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle small px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="mono small text-muted" style={{ fontSize: '0.74rem' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      {currentUser?.id !== u.id && (
                        <button
                          onClick={() => handleToggle(u.id)}
                          className={`craftsman-btn-outline py-0.5 px-2.5 ${u.is_active ? 'hover-border-danger text-danger' : 'hover-border-success text-success'}`}
                          style={{ fontSize: '0.74rem' }}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1050, backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content craftsman-card p-0" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="modal-header p-3.5 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                <h6 className="modal-title fw-bold" style={{ color: 'var(--text-primary)' }}>
                  Add Procurement User
                </h6>
                <button type="button" className="btn text-secondary p-1" onClick={() => setShowAddModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate}>
                <div className="modal-body p-3.5">
                  {errorMsg && (
                    <div className="alert alert-danger small py-1.5 mb-3">{errorMsg}</div>
                  )}

                  <div className="mb-2.5">
                    <label className="form-label small text-secondary">Full Name</label>
                    <input
                      type="text"
                      required
                      className="form-control craftsman-input"
                      placeholder="e.g. Anand Murthy"
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    />
                  </div>

                  <div className="mb-2.5">
                    <label className="form-label small text-secondary">Email Address</label>
                    <input
                      type="email"
                      required
                      className="form-control craftsman-input"
                      placeholder="e.g. anand@craftsman.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>

                  <div className="mb-2.5">
                    <label className="form-label small text-secondary">Password</label>
                    <input
                      type="password"
                      required
                      className="form-control craftsman-input"
                      placeholder="Minimum 8 characters"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Role</label>
                      <select
                        className="form-select craftsman-input"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      >
                        <option value="procurement">Procurement Buyer</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small text-secondary">Department</label>
                      <input
                        type="text"
                        className="form-control craftsman-input"
                        value={newUser.department}
                        onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer p-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
                  <button type="button" className="craftsman-btn-outline btn-sm" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="craftsman-btn-primary btn-sm">
                    Create User Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
