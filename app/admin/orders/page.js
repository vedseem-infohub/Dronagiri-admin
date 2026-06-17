"use client";

import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { adminFetch } from "../lib/auth";

const ALL_STATUSES = ["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const statusBadge = {
  Pending: "badge-amber", Confirmed: "badge-blue",
  Shipped: "badge-purple", Delivered: "badge-green", Cancelled: "badge-red",
};

const nextStatus = {
  Pending: "Confirmed", Confirmed: "Shipped",
  Shipped: "Delivered", Delivered: null, Cancelled: null,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("http://localhost:8000/api/orders/all");
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(o => ({
          id: o.orderId,
          customer: o.customer?.name || "Anonymous",
          phone: o.customer?.phone || "",
          address: o.customer?.address || "",
          items: (o.items || []).map(item => ({
            name: item.name,
            variant: item.quantity,
            qty: item.count,
            price: item.price,
            imageUrl: item.imageUrl || ""
          })),
          total: o.total,
          status: o.status === "Order Sent to Admin" ? "Pending" : o.status,
          date: o.createdAt ? o.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
          payment: o.paymentMethod ? o.paymentMethod.toUpperCase() : "COD"
        }));
        setOrders(mapped);
      } else {
        console.error("Failed to fetch orders:", res.statusText);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter(o => {
    const matchStatus = filter === "All" || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  async function updateStatus(orderId, status) {
    const backendStatus = status === "Pending" ? "Order Sent to Admin" : status;
    try {
      const res = await adminFetch(`http://localhost:8000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: backendStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status }));
      } else {
        alert("Failed to update status on server");
      }
    } catch (err) {
      console.error("Update status error:", err);
      alert("Error updating order status: " + err.message);
    }
  }

  function cancelOrder(orderId) {
    updateStatus(orderId, "Cancelled");
  }

  const counts = ALL_STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      {/* Status filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {ALL_STATUSES.map(s => {
          const cnt = s === "All" ? orders.length : counts[s];
          return (
            <button
              key={s}
              className="btn btn-sm"
              onClick={() => setFilter(s)}
              style={{
                background: filter === s ? "rgba(22,163,74,0.15)" : "var(--surface-2)",
                color: filter === s ? "#4ade80" : "var(--text-muted)",
                border: `1px solid ${filter === s ? "rgba(22,163,74,0.3)" : "var(--border)"}`,
              }}
            >
              {s} <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.7 }}>({cnt})</span>
            </button>
          );
        })}
      </div>

      <div className="admin-card animate-fadeInUp" style={{ padding: 0, overflow: "hidden" }}>
        {/* Search */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }}>
              <path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>
            </svg>
            <input
              className="admin-input"
              style={{ paddingLeft: 34, margin: 0 }}
              placeholder="Search order ID or customer…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{filtered.length} orders</span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>Loading orders...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>No orders found</td></tr>
              ) : filtered.map(order => (
                <tr key={order.id}>
                  <td>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#60a5fa", fontFamily: "monospace", fontSize: 13, fontWeight: 600 }}
                    >{order.id}</button>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: "var(--text)" }}>{order.customer}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{order.phone}</div>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{order.items.length} item{order.items.length > 1 ? "s" : ""}</td>
                  <td style={{ fontWeight: 700, color: "#15803d" }}>₹{order.total.toLocaleString("en-IN")}</td>
                  <td>
                    <span className={`badge ${order.payment === "UPI" ? "badge-blue" : "badge-gray"}`}>{order.payment}</span>
                  </td>
                  <td><span className={`badge ${statusBadge[order.status]}`}>{order.status}</span></td>
                  <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {nextStatus[order.status] && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => updateStatus(order.id, nextStatus[order.status])}
                          style={{ padding: "4px 10px", fontSize: 11 }}
                        >
                          → {nextStatus[order.status]}
                        </button>
                      )}
                      {order.status !== "Delivered" && order.status !== "Cancelled" && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => cancelOrder(order.id)}
                          style={{ padding: "4px 10px", fontSize: 11 }}
                        >
                          Cancel
                        </button>
                      )}
                      <button className="btn btn-sm btn-secondary" onClick={() => setSelectedOrder(order)} style={{ padding: "4px 10px", fontSize: 11 }}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.id}`} maxWidth={580}>
        {selectedOrder && (
          <div>
            {/* Status */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span className={`badge ${statusBadge[selectedOrder.status]}`} style={{ fontSize: 13 }}>{selectedOrder.status}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(selectedOrder.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</span>
            </div>

            {/* Customer Info */}
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Customer</div>
              <div style={{ fontWeight: 600, color: "var(--text)" }}>{selectedOrder.customer}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{selectedOrder.phone}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="map-pin" size={13} className="shrink-0 text-text-dim" />
                <span>{selectedOrder.address}</span>
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Items</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--surface-2)", borderRadius: 10 }}>
                    <div>
                      <div style={{ fontWeight: 500, color: "var(--text)", fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.variant} × {item.qty}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: "#4ade80" }}>₹{(item.price * item.qty).toLocaleString("en-IN")}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Payment: </span>
                <span className={`badge ${selectedOrder.payment === "UPI" ? "badge-blue" : "badge-gray"}`}>{selectedOrder.payment}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#15803d" }}>₹{selectedOrder.total.toLocaleString("en-IN")}</div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              {nextStatus[selectedOrder.status] && (
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => { updateStatus(selectedOrder.id, nextStatus[selectedOrder.status]); }}
                >
                  Mark as {nextStatus[selectedOrder.status]}
                </button>
              )}
              {selectedOrder.status !== "Delivered" && selectedOrder.status !== "Cancelled" && (
                <button className="btn btn-danger" onClick={() => { cancelOrder(selectedOrder.id); }}>Cancel Order</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
