"use client";

import { useState } from "react";
import { CUSTOMERS, ORDERS } from "../lib/mockData";

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  const filtered = CUSTOMERS.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const topCustomer = [...CUSTOMERS].sort((a, b) => b.totalSpent - a.totalSpent)[0];

  return (
    <div>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Customers", value: CUSTOMERS.length, color: "#15803d" },
          { label: "Total Revenue", value: `₹${CUSTOMERS.reduce((s, c) => s + c.totalSpent, 0).toLocaleString("en-IN")}`, color: "#b45309" },
          { label: "Avg Order Value", value: `₹${Math.round(CUSTOMERS.reduce((s, c) => s + c.totalSpent / c.orders, 0) / CUSTOMERS.length)}`, color: "#1d4ed8" },
          { label: "Top Spender", value: topCustomer.name.split(" ")[0], color: "#7c3aed" },
        ].map(s => (
          <div key={s.label} className="admin-card animate-fadeInUp" style={{ padding: "16px 18px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16, position: "relative", maxWidth: 320 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }}><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
        <input className="admin-input" style={{ paddingLeft: 34 }} placeholder="Search by name, email, phone…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="admin-card animate-fadeInUp" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>City</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Avg Order</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>No customers found</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: `hsl(${(c.id * 47) % 360}, 55%, 35%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0,
                      }}>
                        {c.name.charAt(0)}
                      </div>
                      <div style={{ fontWeight: 600, color: "var(--text)" }}>{c.name}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, color: "var(--text)" }}>{c.email}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.phone}</div>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{c.city}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: "#1d4ed8" }}>{c.orders}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: "#15803d" }}>₹{c.totalSpent.toLocaleString("en-IN")}</span>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>₹{Math.round(c.totalSpent / c.orders).toLocaleString("en-IN")}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{new Date(c.joined).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
