'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole } from '../../../types';

interface ManagedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CONTRACTOR' | 'CLIENT';
  createdAt: string;
  _count: { invoices: number; expenses: number; timesheets: number };
}

const ROLE_META = {
  ADMIN: { label: 'Admin', color: '#818cf8', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)' },
  CONTRACTOR: { label: 'Contractor', color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)' },
  CLIENT: { label: 'Client', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)' },
};

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', role: 'CONTRACTOR' as ManagedUser['role'] };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<ManagedUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<ManagedUser | null>(null);

  // Forms
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', role: 'CONTRACTOR' as ManagedUser['role'] });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setUsers(data.users);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Guard: only admin can access
  if (currentUser?.role !== UserRole.ADMIN) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <p style={{ color: 'rgba(226,232,240,0.4)', fontSize: 15 }}>Access restricted to administrators.</p>
      </div>
    );
  }

  // ── CREATE ──────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      setUsers(prev => [...prev, data.user]);
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      if (data.warning) {
        alert(data.warning);
      }
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── EDIT ─────────────────────────────────────────────────────────────────
  const openEdit = (u: ManagedUser) => {
    setEditUser(u);
    setEditForm({ firstName: u.firstName, lastName: u.lastName, role: u.role });
    setFormError('');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(`/api/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');
      setUsers(prev => prev.map(u => u.id === editUser.id ? data.user : u));
      setEditUser(null);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteUser) return;
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(`/api/users/${deleteUser.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
      setDeleteUser(null);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const card: React.CSSProperties = {
    background: '#0e0e1c',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(226,232,240,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>User Management</h1>
          <p style={{ fontSize: 14, color: 'rgba(226,232,240,0.45)', margin: 0 }}>
            Create and manage team members &amp; their access roles
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setFormError(''); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', fontSize: 14, fontWeight: 600,
            boxShadow: '0 0 20px rgba(99,102,241,0.35)',
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New User
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#fca5a5', fontSize: 14, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 24 }}>
        {(['ADMIN', 'CONTRACTOR', 'CLIENT'] as const).map(role => {
          const count = users.filter(u => u.role === role).length;
          const meta = ROLE_META[role];
          return (
            <div key={role} style={{ ...card, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0, textAlign: 'center' }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: meta.color, lineHeight: 1 }}>{count}</span>
              <p style={{ fontSize: 12, fontWeight: 600, color: meta.color, margin: 0 }}>{meta.label}s</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div style={card}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'rgba(226,232,240,0.35)', fontSize: 14 }}>Loading users…</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'rgba(226,232,240,0.35)', fontSize: 14 }}>No users found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['User', 'Role', 'Activity', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(226,232,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const meta = ROLE_META[u.role];
                  const isMe = u.id === currentUser?.id;
                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: i < users.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* User */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, color: 'white',
                          }}>
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>
                              {u.firstName} {u.lastName}
                              {isMe && <span style={{ marginLeft: 8, fontSize: 11, color: '#818cf8', background: 'rgba(99,102,241,0.15)', padding: '2px 7px', borderRadius: 20, fontWeight: 500 }}>You</span>}
                            </p>
                            <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.4)', margin: 0 }}>{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                          color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`,
                        }}>
                          {meta.label}
                        </span>
                      </td>

                      {/* Activity */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                          {[
                            { icon: '📄', count: u._count.invoices, label: 'invoices' },
                            { icon: '💸', count: u._count.expenses, label: 'expenses' },
                            { icon: '⏱', count: u._count.timesheets, label: 'timesheets' },
                          ].map(({ icon, count, label }) => (
                            <span key={label} title={`${count} ${label}`} style={{ fontSize: 12, color: 'rgba(226,232,240,0.45)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              {icon} {count}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Joined */}
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgba(226,232,240,0.45)', whiteSpace: 'nowrap' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => openEdit(u)}
                            style={{
                              padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)',
                              background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                              fontSize: 12, fontWeight: 500, cursor: 'pointer',
                            }}
                          >
                            Edit
                          </button>
                          {!isMe && (
                            <button
                              onClick={() => { setDeleteUser(u); setFormError(''); }}
                              style={{
                                padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)',
                                background: 'rgba(239,68,68,0.08)', color: '#f87171',
                                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── CREATE MODAL ─────────────────────────────────────────────────── */}
      {showCreate && (
        <Modal title="Create New User" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  style={inputStyle} required autoFocus
                  value={createForm.firstName}
                  onChange={e => setCreateForm(f => ({ ...f, firstName: e.target.value }))}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  style={inputStyle} required
                  value={createForm.lastName}
                  onChange={e => setCreateForm(f => ({ ...f, lastName: e.target.value }))}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email" style={inputStyle} required
                value={createForm.email}
                onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                onFocus={e => (e.target.style.borderColor = '#6366f1')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password" style={inputStyle} required minLength={8}
                placeholder="Min. 8 characters"
                value={createForm.password}
                onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                onFocus={e => (e.target.style.borderColor = '#6366f1')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={createForm.role}
                onChange={e => setCreateForm(f => ({ ...f, role: e.target.value as ManagedUser['role'] }))}
              >
                <option value="CONTRACTOR">Contractor</option>
                <option value="ADMIN">Admin</option>
                <option value="CLIENT">Client</option>
              </select>
            </div>

            {formError && (
              <p style={{ margin: 0, fontSize: 13, color: '#fca5a5', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: 8 }}>{formError}</p>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button type="button" onClick={() => setShowCreate(false)} style={secondaryBtn}>Cancel</button>
              <button type="submit" disabled={submitting} style={primaryBtn}>
                {submitting ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── EDIT MODAL ───────────────────────────────────────────────────── */}
      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}>
          <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  style={inputStyle} required autoFocus
                  value={editForm.firstName}
                  onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  style={inputStyle} required
                  value={editForm.lastName}
                  onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
                value={editUser.email} disabled
              />
            </div>

            <div>
              <label style={labelStyle}>Role</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={editForm.role}
                onChange={e => setEditForm(f => ({ ...f, role: e.target.value as ManagedUser['role'] }))}
              >
                <option value="CONTRACTOR">Contractor</option>
                <option value="ADMIN">Admin</option>
                <option value="CLIENT">Client</option>
              </select>
            </div>

            {formError && (
              <p style={{ margin: 0, fontSize: 13, color: '#fca5a5', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: 8 }}>{formError}</p>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button type="button" onClick={() => setEditUser(null)} style={secondaryBtn}>Cancel</button>
              <button type="submit" disabled={submitting} style={primaryBtn}>
                {submitting ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── DELETE CONFIRM ───────────────────────────────────────────────── */}
      {deleteUser && (
        <Modal title="Delete User" onClose={() => setDeleteUser(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="20" height="20" fill="none" stroke="#f87171" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', margin: '0 0 4px' }}>
                  Delete {deleteUser.firstName} {deleteUser.lastName}?
                </p>
                <p style={{ fontSize: 13, color: 'rgba(226,232,240,0.45)', margin: 0 }}>
                  This will permanently delete the account and all associated data. This action cannot be undone.
                </p>
              </div>
            </div>

            {formError && (
              <p style={{ margin: 0, fontSize: 13, color: '#fca5a5', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: 8 }}>{formError}</p>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteUser(null)} style={secondaryBtn}>Cancel</button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white', fontSize: 14, fontWeight: 600,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Deleting…' : 'Delete User'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Shared modal shell ───────────────────────────────────────────────────────
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#0e0e1c',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 18,
        padding: 28,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(226,232,240,0.4)', padding: 4 }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  color: 'white', fontSize: 14, fontWeight: 600,
  boxShadow: '0 0 16px rgba(99,102,241,0.3)',
};

const secondaryBtn: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(226,232,240,0.7)', fontSize: 14, fontWeight: 500,
};
