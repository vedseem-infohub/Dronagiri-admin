"use client";

import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { adminFetch } from "../lib/auth";

// ── Role definitions ─────────────────────────────────────────────
const ROLES = [
  {
    id: "super_admin",
    label: "Super Admin",
    color: "#7c3aed",
    bg: "#f3e8ff",
    border: "#d8b4fe",
    description: "Full access to all features including admin management",
    permissions: ["Dashboard", "Sales", "Orders", "Products", "Stock", "Customers", "Admin Users", "Settings"],
  },
  {
    id: "store_manager",
    label: "Store Manager",
    color: "#15803d",
    bg: "#dcfce7",
    border: "#86efac",
    description: "Manage orders, products, and stock. Cannot manage admins or settings.",
    permissions: ["Dashboard", "Sales", "Orders", "Products", "Stock", "Customers"],
  },
  {
    id: "inventory_manager",
    label: "Inventory Manager",
    color: "#b45309",
    bg: "#fef3c7",
    border: "#fde68a",
    description: "Manage products and stock levels only.",
    permissions: ["Dashboard", "Products", "Stock"],
  },
  {
    id: "sales_viewer",
    label: "Sales Viewer",
    color: "#1d4ed8",
    bg: "#dbeafe",
    border: "#93c5fd",
    description: "Read-only access to sales analytics and dashboard.",
    permissions: ["Dashboard", "Sales"],
  },
  {
    id: "support",
    label: "Support",
    color: "#0e7490",
    bg: "#cffafe",
    border: "#67e8f9",
    description: "View and manage orders and customers only.",
    permissions: ["Dashboard", "Orders", "Customers"],
  },
];

// ── Initial mock admins ──────────────────────────────────────────
const INITIAL_ADMINS = [
  {
    id: 1,
    name: "Ramesh Patil",
    email: "ramesh@dronagiri.com",
    role: "super_admin",
    status: "active",
    added: "2025-08-15",
    lastLogin: "2026-06-01",
    avatar: "R",
  },
  {
    id: 2,
    name: "Sneha Kulkarni",
    email: "sneha@dronagiri.com",
    role: "store_manager",
    status: "active",
    added: "2025-10-20",
    lastLogin: "2026-05-30",
    avatar: "S",
  },
  {
    id: 3,
    name: "Aakash Sharma",
    email: "aakash@dronagiri.com",
    role: "inventory_manager",
    status: "active",
    added: "2025-11-05",
    lastLogin: "2026-05-28",
    avatar: "A",
  },
  {
    id: 4,
    name: "Priti Desai",
    email: "priti@dronagiri.com",
    role: "sales_viewer",
    status: "inactive",
    added: "2026-01-12",
    lastLogin: "2026-03-10",
    avatar: "P",
  },
];

const AVATAR_COLORS = ["#15803d", "#1d4ed8", "#7c3aed", "#b45309", "#0e7490", "#be185d"];

function getRoleConfig(id) {
  return ROLES.find(r => r.id === id) || ROLES[0];
}

function RoleBadge({ roleId }) {
  const r = getRoleConfig(roleId);
  return (
    <span
      className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold"
      style={{ backgroundColor: r.bg, color: r.color, border: `1px solid ${r.border}` }}
    >
      <Icon name="shield" size={13} />
      <span>{r.label}</span>
    </span>
  );
}

// ── Admin Form (Add / Edit) ──────────────────────────────────────
function AdminForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    name: "", email: "", role: "store_manager",
    password: "", confirmPassword: "", status: "active",
  });
  const [errors, setErrors] = useState({});

  function update(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    if (!initial) {
      if (!form.password || form.password.length < 6) e.password = "Minimum 6 characters";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  }

  const L = ({ text, req }) => (
    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
      {text}{req && <span className="text-danger ml-0.5">*</span>}
    </label>
  );
  const E = (k) => errors[k]
    ? <span className="text-[11px] text-danger block mt-1">{errors[k]}</span>
    : null;

  const selectedRole = getRoleConfig(form.role);

  return (
    <form onSubmit={handleSubmit}>
      {/* Name & Email */}
      <div className="grid grid-cols-2 gap-x-3.5">
        <div className="mb-3.5">
          <L text="Full Name" req />
          <input className="admin-input" value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Ramesh Patil" />
          {E("name")}
        </div>
        <div className="mb-3.5">
          <L text="Email Address" req />
          <input className="admin-input" type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="user@dronagiri.com" />
          {E("email")}
        </div>
      </div>

      {/* Role */}
      <div className="mb-3.5">
        <L text="Role" req />
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          {ROLES.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => update("role", r.id)}
              className="p-2.5 rounded-xl cursor-pointer text-left transition-all duration-150 border-2"
              style={{
                borderColor: form.role === r.id ? r.color : "var(--border)",
                backgroundColor: form.role === r.id ? r.bg : "var(--surface)"
              }}
            >
              <div className="text-xs font-bold" style={{ color: form.role === r.id ? r.color : "var(--text)" }}>{r.label}</div>
            </button>
          ))}
        </div>
        {/* Role description */}
        <div className="py-2.5 px-3.5 rounded-xl border" style={{ backgroundColor: selectedRole.bg, borderColor: selectedRole.border }}>
          <div className="flex items-center gap-1.5 font-bold mb-1 text-xs" style={{ color: selectedRole.color }}>
            <Icon name="shield" size={14} className="shrink-0" />
            <span>{selectedRole.label} — Access</span>
          </div>
          <p className="text-xs text-text-muted mb-1.5">{selectedRole.description}</p>
          <div className="flex flex-wrap gap-1">
            {selectedRole.permissions.map(p => (
              <span
                key={p}
                className="text-[11px] bg-white border rounded-full py-0.5 px-2.5 font-semibold"
                style={{ color: selectedRole.color, borderColor: selectedRole.border }}
              >
                ✓ {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Password — only for new admin */}
      {!initial && (
        <div className="grid grid-cols-2 gap-x-3.5">
          <div className="mb-3.5">
            <L text="Password" req />
            <input className="admin-input" type="password" value={form.password} onChange={e => update("password", e.target.value)} placeholder="Min 6 characters" />
            {E("password")}
          </div>
          <div className="mb-3.5">
            <L text="Confirm Password" req />
            <input className="admin-input" type="password" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} placeholder="Re-enter password" />
            {E("confirmPassword")}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="mb-5">
        <L text="Status" />
        <div className="flex gap-2">
          {["active", "inactive"].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => update("status", s)}
              className={`btn btn-sm flex-1 ${
                form.status === s
                  ? s === "active"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-red-100 text-red-600 border border-red-300"
                  : "bg-surface-2 text-text-muted border border-border"
              }`}
            >
              {s === "active" ? (
                <span className="flex items-center gap-1">
                  <Icon name="check" size={14} />
                  <span>Active</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Icon name="x" size={14} />
                  <span>Inactive</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2.5 justify-end pt-1 border-t border-border">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary gap-1.5">
          {initial ? (
            <>
              <Icon name="save" size={14} />
              <span>Save Changes</span>
            </>
          ) : (
            <>
              <Icon name="plus" size={14} />
              <span>Create Admin</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

const BACKEND_URL = "http://localhost:8000/api/admins";

// ── Main Page ────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [deleteAdmin, setDeleteAdmin] = useState(null);
  const [showRoles, setShowRoles] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await adminFetch(BACKEND_URL);
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      } else {
        console.error("Failed to fetch admins:", res.statusText);
      }
    } catch (err) {
      console.error("Fetch admins error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function handleAdd(data) {
    try {
      const res = await adminFetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const newAdmin = await res.json();
        setAdmins(prev => [newAdmin, ...prev]);
        setAddModal(false);
      } else {
        let errMsg = "Failed to add admin user";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch {}
        alert(errMsg);
      }
    } catch (err) {
      console.error("Add admin error:", err);
      alert(`Error connecting to backend: ${err.message}`);
    }
  }

  async function handleEdit(data) {
    try {
      const res = await adminFetch(`${BACKEND_URL}/${editAdmin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updatedAdmin = await res.json();
        setAdmins(prev => prev.map(a => a.id === editAdmin.id ? updatedAdmin : a));
        setEditAdmin(null);
      } else {
        let errMsg = "Failed to update admin user";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch {}
        alert(errMsg);
      }
    } catch (err) {
      console.error("Edit admin error:", err);
      alert(`Error connecting to backend: ${err.message}`);
    }
  }

  async function handleDelete() {
    try {
      const res = await adminFetch(`${BACKEND_URL}/${deleteAdmin.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setAdmins(prev => prev.filter(a => a.id !== deleteAdmin.id));
        setDeleteAdmin(null);
      } else {
        let errMsg = "Failed to delete admin user";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch {}
        alert(errMsg);
      }
    } catch (err) {
      console.error("Delete admin error:", err);
      alert(`Error connecting to backend: ${err.message}`);
    }
  }

  async function toggleStatus(id) {
    const admin = admins.find(a => a.id === id);
    if (!admin) return;
    const nextStatus = admin.status === "active" ? "inactive" : "active";
    try {
      const res = await adminFetch(`${BACKEND_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: admin.name,
          email: admin.email,
          role: admin.role,
          status: nextStatus
        })
      });
      if (res.ok) {
        const updatedAdmin = await res.json();
        setAdmins(prev => prev.map(a => a.id === id ? updatedAdmin : a));
      } else {
        let errMsg = "Failed to update admin status";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch {}
        alert(errMsg);
      }
    } catch (err) {
      console.error("Toggle admin status error:", err);
    }
  }

  const activeCount = admins.filter(a => a.status === "active").length;
  const roleCounts = ROLES.map(r => ({ ...r, count: admins.filter(a => a.role === r.id).length }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex gap-2">
          <button className="btn btn-secondary gap-1.5" onClick={() => setShowRoles(true)}>
            <Icon name="shield" size={14} />
            <span>View Roles</span>
          </button>
        </div>
        <button className="btn btn-primary" onClick={() => setAddModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 stagger">
        <div className="admin-card animate-fadeInUp py-3.5 px-4 border-l-[3px] border-l-green-600">
          <div className="text-[11px] text-text-muted font-bold uppercase tracking-wider mb-1.5">Total Admins</div>
          <div className="text-2xl font-extrabold text-green-700">{admins.length}</div>
        </div>
        <div className="admin-card animate-fadeInUp py-3.5 px-4 border-l-[3px] border-l-blue-700">
          <div className="text-[11px] text-text-muted font-bold uppercase tracking-wider mb-1.5">Active</div>
          <div className="text-2xl font-extrabold text-blue-700">{activeCount}</div>
        </div>
        {roleCounts.filter(r => r.count > 0).map(r => (
          <div key={r.id} className="admin-card animate-fadeInUp py-3.5 px-4" style={{ borderLeft: `3px solid ${r.color}` }}>
            <div className="text-[11px] text-text-muted font-bold uppercase tracking-wider mb-1.5">{r.label}</div>
            <div className="text-2xl font-extrabold" style={{ color: r.color }}>{r.count}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card animate-fadeInUp p-0 overflow-hidden">
        <div className="py-4 px-5 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-text">All Admins</h2>
          <span className="text-xs text-text-muted">{admins.length} accounts</span>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>Loading admin accounts...</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>No admins found</td></tr>
              ) : admins.map((admin, i) => {
                const role = getRoleConfig(admin.role);
                return (
                  <tr key={admin.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-bold text-white shrink-0"
                          style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                        >{admin.avatar}</div>
                        <div>
                          <div className="font-semibold text-text">{admin.name}</div>
                          <div className="text-xs text-text-muted">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><RoleBadge roleId={admin.role} /></td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[240px]">
                        {role.permissions.slice(0, 3).map(p => (
                          <span
                            key={p}
                            className="text-[10px] rounded-md py-0.5 px-1.5 font-semibold border"
                            style={{ backgroundColor: role.bg, color: role.color, borderColor: role.border }}
                          >
                            {p}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="text-[10px] bg-surface-2 text-text-muted rounded-md py-0.5 px-1.5 border border-border">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleStatus(admin.id)}
                        className={`badge cursor-pointer border-none ${admin.status === "active" ? "badge-green" : "badge-red"}`}
                        title="Click to toggle"
                      >
                        {admin.status === "active" ? "● Active" : "○ Inactive"}
                      </button>
                    </td>
                    <td className="text-xs text-text-muted">{admin.lastLogin}</td>
                    <td className="text-xs text-text-muted">
                      {new Date(admin.added).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <div className="flex gap-1.5">
                        <button
                          className="btn btn-icon btn-secondary"
                          title="Edit"
                          onClick={() => setEditAdmin(admin)}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          className="btn btn-icon btn-danger"
                          title="Delete"
                          onClick={() => setDeleteAdmin(admin)}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Roles Reference Modal ── */}
      <Modal open={showRoles} onClose={() => setShowRoles(false)} title="Role Definitions" maxWidth={580}>
        <div className="flex flex-col gap-3">
          {ROLES.map(r => (
            <div key={r.id} className="p-3.5 rounded-2xl border" style={{ backgroundColor: r.bg, borderColor: r.border }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: r.color }}>
                  <Icon name="shield" size={14} className="shrink-0" />
                  <span>{r.label}</span>
                </div>
                <span className="text-xs bg-white py-0.5 px-2 rounded-full border" style={{ color: r.color, borderColor: r.border }}>
                  {admins.filter(a => a.role === r.id).length} admin{admins.filter(a => a.role === r.id).length !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-xs text-text-muted mb-2">{r.description}</p>
              <div className="flex flex-wrap gap-1">
                {r.permissions.map(p => (
                  <span
                    key={p}
                    className="text-[11px] bg-white rounded-md py-0.5 px-2.5 font-semibold border"
                    style={{ color: r.color, borderColor: r.border }}
                  >
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* ── Add Modal ── */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Create New Admin" maxWidth={600}>
        <AdminForm onSave={handleAdd} onCancel={() => setAddModal(false)} />
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal open={!!editAdmin} onClose={() => setEditAdmin(null)} title={`Edit: ${editAdmin?.name}`} maxWidth={600}>
        <AdminForm initial={editAdmin} onSave={handleEdit} onCancel={() => setEditAdmin(null)} />
      </Modal>

      {/* ── Delete Confirm ── */}
      <Modal open={!!deleteAdmin} onClose={() => setDeleteAdmin(null)} title="Remove Admin" maxWidth={400}>
        {deleteAdmin && (
          <div>
            <div className="flex items-start gap-3.5 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-5">
              <Icon name="alert-triangle" size={24} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-text mb-1">Remove "{deleteAdmin.name}"?</p>
                <p className="text-xs text-text-muted">
                  This will revoke all access for <strong>{deleteAdmin.email}</strong>. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2.5 justify-end">
              <button className="btn btn-secondary" onClick={() => setDeleteAdmin(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Remove Admin</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
