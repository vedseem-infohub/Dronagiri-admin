"use client";

import { useState, useEffect } from "react";
import Icon from "../components/Icon";
import { adminFetch } from "../lib/auth";

export default function StockPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL || process.env.NEXT_API_BACKEND_URL || "http://localhost:8000"}/api/products?includeInactive=true`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Error fetching products for stock:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q);
    const matchFilter =
      filter === "all" ? true :
      filter === "low" ? p.stock <= 10 :
      filter === "out" ? p.stock === 0 :
      filter === "ok" ? p.stock > 10 : true;
    return matchSearch && matchFilter;
  });

  const lowCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outCount = products.filter(p => p.stock === 0).length;
  const okCount = products.filter(p => p.stock > 10).length;

  function startEdit(p) {
    setEditingId(p.id);
    setEditValue(String(p.stock));
  }

  async function saveEdit(id) {
    const val = parseInt(editValue, 10);
    if (!isNaN(val) && val >= 0) {
      try {
        const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL || process.env.NEXT_API_BACKEND_URL || "http://localhost:8000"}/api/products/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: val })
        });
        if (res.ok) {
          const updated = await res.json();
          setProducts(prev => prev.map(p => p.id === id ? updated : p));
        } else {
          alert("Failed to save stock in database");
        }
      } catch (err) {
        console.error("Save stock error:", err);
        alert("Error saving stock: " + err.message);
      }
    }
    setEditingId(null);
  }

  async function adjustStock(id, delta) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    const newVal = Math.max(0, p.stock + delta);
    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL || process.env.NEXT_API_BACKEND_URL || "http://localhost:8000"}/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newVal })
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(prev => prev.map(prod => prod.id === id ? updated : prod));
      } else {
        console.error("Failed to adjust stock on server");
      }
    } catch (err) {
      console.error("Adjust stock error:", err);
    }
  }

  const stockStatus = (s) => s === 0 ? ["badge-red", "Out of Stock"] : s <= 5 ? ["badge-red", "Critical"] : s <= 10 ? ["badge-amber", "Low Stock"] : ["badge-green", "In Stock"];

  const totalStock = products.reduce((s, p) => s + p.stock, 0);

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Stock",   value: totalStock + " units", color: "#15803d" },
          { label: "In Stock",    value: okCount  + " products", color: "#15803d" },
          { label: "Low Stock",   value: lowCount + " products", color: "#b45309" },
          { label: "Out of Stock",value: outCount + " products", color: "#dc2626" },
        ].map(s => (
          <div key={s.label} className="admin-card animate-fadeInUp py-4 px-4.5" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-1.5">{s.label}</div>
            <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 flex-wrap mb-5">
        <div className="relative flex-[1_1_220px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
          <input className="admin-input pl-9" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {[
            { key: "all", label: "All" },
            { key: "low", label: "Low", dot: "bg-amber-500" },
            { key: "out", label: "Out", dot: "bg-red-600" },
            { key: "ok", label: "OK", dot: "bg-green-600" },
          ].map(f => (
            <button
              key={f.key}
              className={`btn btn-sm flex items-center gap-1.5 ${
                filter === f.key
                  ? "bg-green-600/10 text-green-700 border border-green-600/30"
                  : "bg-surface-2 text-text-muted border border-border"
              }`}
              onClick={() => setFilter(f.key)}
            >
              {f.dot && <span className={`w-2 h-2 rounded-full ${f.dot}`} />}
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="admin-card animate-fadeInUp p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Stock Bar</th>
                <th>Adjust</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center text-text-muted p-10">Loading products stock...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-text-muted p-10">No products found</td></tr>
              ) : filtered.map(p => {
                const [badgeCls, statusLabel] = stockStatus(p.stock);
                const pct = Math.min(100, (p.stock / 100) * 100);
                const barColor = p.stock === 0 ? "#dc2626" : p.stock <= 5 ? "#dc2626" : p.stock <= 10 ? "#d97706" : "#16a34a";

                return (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-base overflow-hidden border border-border">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Icon name="sprout" size={16} className="text-green-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-text text-xs">{p.name}</div>
                          {p.nameHindi && <div className="text-[11px] text-text-muted">{p.nameHindi}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-gray text-[11px]">{p.category}</span></td>
                    <td>
                      {editingId === p.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            className="admin-input w-[70px] py-1 px-2 text-xs"
                            type="number"
                            min="0"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            autoFocus
                            onKeyDown={e => { if (e.key === "Enter") saveEdit(p.id); if (e.key === "Escape") setEditingId(null); }}
                          />
                          <button className="btn btn-sm btn-primary py-1 px-2 flex items-center justify-center" onClick={() => saveEdit(p.id)}>
                            <Icon name="check" size={11} />
                          </button>
                          <button className="btn btn-sm btn-secondary py-1 px-2 flex items-center justify-center" onClick={() => setEditingId(null)}>
                            <Icon name="x" size={11} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(p)}
                          className="bg-transparent border-none cursor-pointer font-bold text-sm"
                          style={{ color: barColor }}
                          title="Click to edit"
                        >
                          {p.stock}
                        </button>
                      )}
                    </td>
                    <td><span className={`badge ${badgeCls}`}>{statusLabel}</span></td>
                    <td className="min-w-[120px]">
                      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-400 ease-out" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                      </div>
                      <div className="text-[10px] text-text-dim mt-1">{p.stock} units</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          className="btn btn-icon btn-secondary p-1.5"
                          onClick={() => adjustStock(p.id, -1)}
                          disabled={p.stock === 0}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                        <button
                          className="btn btn-icon btn-secondary p-1.5"
                          onClick={() => adjustStock(p.id, 1)}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>
                        </button>
                        <button
                          className="btn btn-icon btn-secondary p-1.5"
                          title="Edit quantity"
                          onClick={() => startEdit(p)}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>
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
    </div>
  );
}
