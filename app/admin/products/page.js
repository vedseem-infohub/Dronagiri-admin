"use client";

import { useState, useEffect } from "react";
import { CATEGORIES } from "../lib/mockData";
import Modal from "../components/Modal";
import ProductForm from "../components/ProductForm";
import Icon from "../components/Icon";
import { adminFetch } from "../lib/auth";

const BACKEND_URL = `${process.env.NEXT_PUBLIC_API_BACKEND_URL || process.env.NEXT_API_BACKEND_URL || "http://localhost:8000"}/api/products`;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [addModal, setAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await adminFetch(`${BACKEND_URL}?includeInactive=true`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        let errMsg = `Failed to fetch products: Server returned ${res.status}`;
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch {
          try {
            const text = await res.text();
            const match = text.match(/<pre>([\s\S]*?)<\/pre>/) || text.match(/<title>([\s\S]*?)<\/title>/);
            errMsg = match ? match[1].trim() : text.slice(0, 150) || errMsg;
          } catch {}
        }
        console.error(errMsg);
        alert(errMsg);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      alert(`Error connecting to backend: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.nameHindi && p.nameHindi.toLowerCase().includes(q));
    const matchCat = categoryFilter === "All" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  async function handleAdd(data) {
    try {
      const res = await adminFetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const newProduct = await res.json();
        setProducts(prev => [newProduct, ...prev]);
        setAddModal(false);
      } else {
        let errMsg = "Failed to add product";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch {
          try {
            const text = await res.text();
            const match = text.match(/<pre>([\s\S]*?)<\/pre>/) || text.match(/<title>([\s\S]*?)<\/title>/);
            errMsg = match ? match[1].trim() : text.slice(0, 150) || errMsg;
          } catch {}
        }
        alert(errMsg);
      }
    } catch (err) {
      console.error("Add product error:", err);
      alert(`Error connecting to backend: ${err.message}`);
    }
  }

  async function handleEdit(data) {
    try {
      const res = await adminFetch(`${BACKEND_URL}/${editProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updatedProduct = await res.json();
        setProducts(prev => prev.map(p => p.id === editProduct.id ? updatedProduct : p));
        setEditProduct(null);
      } else {
        let errMsg = "Failed to save product";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch {
          try {
            const text = await res.text();
            const match = text.match(/<pre>([\s\S]*?)<\/pre>/) || text.match(/<title>([\s\S]*?)<\/title>/);
            errMsg = match ? match[1].trim() : text.slice(0, 150) || errMsg;
          } catch {}
        }
        alert(errMsg);
      }
    } catch (err) {
      console.error("Edit product error:", err);
      alert(`Error connecting to backend: ${err.message}`);
    }
  }

  async function handleDelete() {
    try {
      const res = await adminFetch(`${BACKEND_URL}/${deleteProduct.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== deleteProduct.id));
        setDeleteProduct(null);
      } else {
        let errMsg = "Failed to delete product";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch {
          try {
            const text = await res.text();
            const match = text.match(/<pre>([\s\S]*?)<\/pre>/) || text.match(/<title>([\s\S]*?)<\/title>/);
            errMsg = match ? match[1].trim() : text.slice(0, 150) || errMsg;
          } catch {}
        }
        alert(errMsg);
      }
    } catch (err) {
      console.error("Delete product error:", err);
      alert(`Error connecting to backend: ${err.message}`);
    }
  }

  async function toggleActive(id) {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    try {
      const res = await adminFetch(`${BACKEND_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !prod.active })
      });
      if (res.ok) {
        const updatedProduct = await res.json();
        setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      } else {
        console.error("Failed to toggle status:", res.statusText);
      }
    } catch (err) {
      console.error("Toggle active error:", err);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 15, color: "var(--text-muted)" }}>{products.length} products total</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setAddModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New Product
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 320 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }}>
            <path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>
          </svg>
          <input className="admin-input" style={{ paddingLeft: 34 }} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          className="admin-input admin-select"
          style={{ flex: "0 0 180px" }}
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="admin-card animate-fadeInUp" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Variants</th>
                <th>Stock</th>
                <th>Sold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>No products found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 9,
                        background: "rgba(22,163,74,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, flexShrink: 0,
                        overflow: "hidden",
                        border: "1.5px solid var(--border)",
                      }}>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : p.image === "🌿" ? (
                          <Icon name="sprout" size={20} className="text-green-600" />
                        ) : (
                          <span>{p.image}</span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text)" }}>{p.name}</div>
                        {p.nameHindi && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.nameHindi}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-gray">{p.category}</span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    {p.variants.map(v => `${v.size} / ₹${v.price}`).join(", ")}
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: p.stock <= 5 ? "#e11d48" : p.stock <= 15 ? "#d97706" : "#059669",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4
                    }}>
                      <span>{p.stock}</span>
                      {p.stock <= 5 && <Icon name="alert-triangle" size={14} className="shrink-0" />}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{p.sold}</td>
                  <td>
                    <button
                      onClick={() => toggleActive(p.id)}
                      className={`badge ${p.active ? "badge-green" : "badge-red"}`}
                      style={{ border: "none", cursor: "pointer" }}
                    >
                      {p.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-icon btn-secondary"
                        title="Edit"
                        onClick={() => setEditProduct(p)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        className="btn btn-icon btn-danger"
                        title="Delete"
                        onClick={() => setDeleteProduct(p)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add New Product" maxWidth={600}>
        <ProductForm onSave={handleAdd} onCancel={() => setAddModal(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title={`Edit: ${editProduct?.name}`} maxWidth={600}>
        <ProductForm initial={editProduct} onSave={handleEdit} onCancel={() => setEditProduct(null)} />
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteProduct} onClose={() => setDeleteProduct(null)} title="Delete Product" maxWidth={400}>
        {deleteProduct && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="trash-2" size={24} className="text-red-600" />
              </div>
              <div>
                <p style={{ color: "var(--text)", fontWeight: 600 }}>Delete "{deleteProduct.name}"?</p>
                <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>This action cannot be undone. The product will be permanently removed.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setDeleteProduct(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete Product</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
