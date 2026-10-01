"use client";

import { useState, useEffect, useMemo } from "react";
import Modal from "../components/Modal";
import Icon from "../components/Icon";
import { adminFetch, safeJson } from "../lib/auth";

const SHIPMENT_FILTERS = [
  "All",
  "Pending",
  "Shipment Failed",
  "AWB Assigned",
  "Pickup Pending",
  "Picked Up",
  "In Transit",
  "Out for Delivery",
  "Delivered",
  "NDR",
  "RTO",
  "Cancelled",
];

const statusBadge = {
  Pending: "badge-amber",
  Confirmed: "badge-blue",
  Shipped: "badge-purple",
  Delivered: "badge-green",
  Cancelled: "badge-red",
};

function getLogisticsBadge(status = "") {
  const s = String(status || "").toLowerCase();
  if (s.includes("delivered") || s === "dl") return "badge-green";
  if (s.includes("out for delivery") || s.includes("ofd")) return "badge-blue";
  if (s.includes("transit") || s.includes("picked up") || s.includes("assigned") || s.includes("manifest")) return "badge-purple";
  if (s.includes("cancel") || s.includes("rto") || s.includes("failed")) return "badge-red";
  if (s.includes("ndr") || s.includes("pending") || s.includes("unfulfilled")) return "badge-amber";
  return "badge-gray";
}

function formatAdminDate(val, full = false) {
  if (!val) return "-";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "-";
    return full
      ? d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })
      : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch (e) {
    return "-";
  }
}

function formatAdminDateTime(val) {
  if (!val) return "-";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "-";
  }
}

const nextStatus = {
  Pending: "Confirmed",
  Confirmed: "Shipped",
  Shipped: "Delivered",
  Delivered: null,
  Cancelled: null,
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Tracking Modal State
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [adminTrackingData, setAdminTrackingData] = useState(null);
  const [adminTrackingLoading, setAdminTrackingLoading] = useState(false);
  const [activeTrackingAwb, setActiveTrackingAwb] = useState("");

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BACKEND_URL ||
    process.env.NEXT_API_BACKEND_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://dronagiri-backend-e4ja.onrender.com");

  // 1. Fetch Orders from Backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminFetch(`${API_BASE}/api/orders/all`);
      const data = await safeJson(res);
      if (res.ok && Array.isArray(data)) {
        const mapped = data.map((o) => ({
          id: o.orderId,
          customer: o.customer?.name || "Anonymous",
          phone: o.customer?.phone || "",
          email: o.customer?.email || "",
          address: o.customer?.address || "",
          items: (o.items || []).map((item) => ({
            name: item.name,
            variant: item.quantity,
            qty: item.count,
            price: item.price,
            imageUrl: item.imageUrl || "",
          })),
          total: o.total,
          subtotal: o.subtotal,
          discountAmount: o.discountAmount || 0,
          promoCode: o.promoCode || "",
          shippingCost: o.shippingCost || 0,
          status: o.status === "Order Sent to Admin" ? "Pending" : o.status,
          internalStatus: o.internalStatus || (o.waybill ? "AWB_ASSIGNED" : "ORDER_CREATED"),
          date: o.createdAt ? o.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
          payment: o.paymentMethod ? (o.paymentMethod === "online" ? "ONLINE" : o.paymentMethod.toUpperCase()) : "COD",
          paymentStatus: o.paymentStatus || (o.paymentMethod === "online" ? "Paid" : "Pending"),
          waybill: o.waybill || o.shipping?.waybill || "",
          shippingStatus: o.shipping?.status || (o.waybill ? "Manifested" : "Unfulfilled"),
          currentLocation: o.shipping?.currentLocation || "",
          expectedDeliveryDate: o.shipping?.expectedDeliveryDate || null,
          lastTrackedAt: o.shipping?.lastTrackedAt || null,
          shippingDetails: o.shipping || null,
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

  // 2. Filter & Search Logic
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      // Status Filter
      let matchFilter = true;
      const istat = String(o.internalStatus || "").toUpperCase();
      const sstat = String(o.shippingStatus || "").toLowerCase();

      if (filter === "Pending") {
        matchFilter = !o.waybill || istat === "ORDER_CREATED" || o.status === "Pending";
      } else if (filter === "Shipment Failed") {
        matchFilter = istat === "SHIPMENT_FAILED";
      } else if (filter === "AWB Assigned") {
        matchFilter = istat === "AWB_ASSIGNED" || istat === "SHIPMENT_CREATED" || sstat.includes("manifest");
      } else if (filter === "Pickup Pending") {
        matchFilter = istat === "PICKUP_REQUESTED" || istat === "PICKUP_SCHEDULED";
      } else if (filter === "Picked Up") {
        matchFilter = istat === "PICKED_UP" || sstat.includes("picked");
      } else if (filter === "In Transit") {
        matchFilter = istat === "IN_TRANSIT" || sstat.includes("transit");
      } else if (filter === "Out for Delivery") {
        matchFilter = istat === "OUT_FOR_DELIVERY" || sstat.includes("out for delivery");
      } else if (filter === "Delivered") {
        matchFilter = istat === "DELIVERED" || o.status === "Delivered" || sstat.includes("deliver");
      } else if (filter === "NDR") {
        matchFilter = istat === "NDR" || sstat.includes("ndr") || sstat.includes("door");
      } else if (filter === "RTO") {
        matchFilter = istat.startsWith("RTO") || sstat.includes("rto");
      } else if (filter === "Cancelled") {
        matchFilter = istat === "CANCELLED" || o.status === "Cancelled";
      }

      if (!matchFilter) return false;

      // Search matching
      const q = search.trim().toLowerCase();
      if (!q) return true;

      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        (o.email && o.email.toLowerCase().includes(q)) ||
        (o.waybill && o.waybill.toLowerCase().includes(q))
      );
    });
  }, [orders, filter, search]);

  // Status count counters for filter tabs
  const filterCounts = useMemo(() => {
    const counts = { All: orders.length };
    for (const f of SHIPMENT_FILTERS.slice(1)) {
      counts[f] = orders.filter((o) => {
        const istat = String(o.internalStatus || "").toUpperCase();
        const sstat = String(o.shippingStatus || "").toLowerCase();
        if (f === "Pending") return !o.waybill || istat === "ORDER_CREATED" || o.status === "Pending";
        if (f === "Shipment Failed") return istat === "SHIPMENT_FAILED";
        if (f === "AWB Assigned") return istat === "AWB_ASSIGNED" || istat === "SHIPMENT_CREATED" || sstat.includes("manifest");
        if (f === "Pickup Pending") return istat === "PICKUP_REQUESTED" || istat === "PICKUP_SCHEDULED";
        if (f === "Picked Up") return istat === "PICKED_UP" || sstat.includes("picked");
        if (f === "In Transit") return istat === "IN_TRANSIT" || sstat.includes("transit");
        if (f === "Out for Delivery") return istat === "OUT_FOR_DELIVERY" || sstat.includes("out for delivery");
        if (f === "Delivered") return istat === "DELIVERED" || o.status === "Delivered" || sstat.includes("deliver");
        if (f === "NDR") return istat === "NDR" || sstat.includes("ndr");
        if (f === "RTO") return istat.startsWith("RTO") || sstat.includes("rto");
        if (f === "Cancelled") return istat === "CANCELLED" || o.status === "Cancelled";
        return true;
      }).length;
    }
    return counts;
  }, [orders]);

  // 3. Update Order Lifecycle Status
  async function updateStatus(orderId, status) {
    const backendStatus = status === "Pending" ? "Order Sent to Admin" : status;
    try {
      setActionLoadingId(orderId);
      const res = await adminFetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: backendStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
        if (selectedOrder?.id === orderId) setSelectedOrder((prev) => ({ ...prev, status }));
      } else {
        const errData = await safeJson(res);
        alert("Failed to update status on server: " + (errData?.error || errData?.message || res.statusText));
      }
    } catch (err) {
      console.error("Update status error:", err);
      alert("Error updating order status: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  // 4. Create Shipment / Generate Waybill with Delhivery
  async function createDelhiveryShipment(orderId) {
    try {
      setActionLoadingId(`ship_${orderId}`);
      const res = await adminFetch(`${API_BASE}/api/shipping/shipments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await safeJson(res);
      if (res.ok && data?.success) {
        const newAwb = data.data?.waybill || data.waybill;
        alert(`Shipment manifested successfully with Delhivery! AWB: ${newAwb}`);
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => ({
            ...prev,
            waybill: newAwb,
            shippingStatus: "Manifested",
            internalStatus: "AWB_ASSIGNED",
            status: "Shipped",
          }));
        }
      } else {
        alert("Failed to create shipment: " + (data?.error || data?.message || "Ensure backend is running"));
      }
    } catch (err) {
      console.error("Create shipment error:", err);
      alert("Error generating shipment: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  // 5. Download Delhivery PDF Shipping Label
  async function downloadLabel(waybill) {
    if (!waybill) return;
    try {
      setActionLoadingId(`label_${waybill}`);
      const res = await adminFetch(`${API_BASE}/api/shipping/label/${waybill}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `delhivery-label-${waybill}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const errData = await safeJson(res);
        alert("Could not download label: " + (errData?.error || errData?.message || res.statusText));
      }
    } catch (err) {
      console.error("Download label error:", err);
      alert("Error downloading label: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  // 6. Download Official Tax Invoice PDF
  async function downloadInvoice(orderId) {
    try {
      setActionLoadingId(`inv_${orderId}`);
      const res = await adminFetch(`${API_BASE}/api/orders/${orderId}/invoice`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const errData = await safeJson(res);
        alert("Could not download invoice: " + (errData?.error || errData?.message || res.statusText));
      }
    } catch (err) {
      console.error("Download invoice error:", err);
      alert("Error downloading invoice: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  // 7. View Live Tracking in Modal
  async function viewLiveTracking(waybill, refresh = false) {
    if (!waybill) return;
    try {
      setActiveTrackingAwb(waybill);
      setAdminTrackingLoading(true);
      setTrackingModalOpen(true);
      if (!refresh) setAdminTrackingData(null);

      const query = refresh ? "?refresh=true" : "";
      const res = await adminFetch(`${API_BASE}/api/shipping/track/${waybill}${query}`);
      const data = await safeJson(res);
      if (res.ok && data?.success) {
        setAdminTrackingData(data.data);
      } else {
        setAdminTrackingData({ error: data?.error || data?.message || "No tracking events available yet." });
      }
    } catch (err) {
      console.error("Tracking error:", err);
      setAdminTrackingData({ error: "Failed to connect to tracking service: " + err.message });
    } finally {
      setAdminTrackingLoading(false);
    }
  }

  // 8. Cancel Shipment with Delhivery (Destructive confirmation dialog)
  async function cancelShipmentAWB(waybill, orderId) {
    const confirmed = window.confirm(
      `CONFIRMATION REQUIRED:\n\nAre you sure you want to CANCEL Delhivery shipment AWB ${waybill}?\n\nThis will revoke the manifest with Delhivery.`
    );
    if (!confirmed) return;

    try {
      setActionLoadingId(`cancel_${waybill}`);
      const res = await adminFetch(`${API_BASE}/api/shipping/shipments/${waybill}/cancel`, {
        method: "POST",
      });
      const data = await safeJson(res);
      if (res.ok && data?.success) {
        alert("Shipment cancelled successfully with Delhivery!");
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => ({
            ...prev,
            shippingStatus: "Cancelled",
            internalStatus: "CANCELLED",
            status: "Cancelled",
          }));
        }
      } else {
        alert("Failed to cancel shipment: " + (data?.error || data?.message || "Cancellation failed"));
      }
    } catch (err) {
      console.error("Cancel shipment error:", err);
      alert("Error cancelling shipment: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div>
      {/* Mobile Status Filter Dropdown */}
      <div className="block md:hidden mb-3">
        <div className="relative w-full">
          <select
            id="mobile-order-status-dropdown"
            className="admin-input admin-select w-full"
            style={{ height: 42, cursor: "pointer", fontSize: 13, fontWeight: 500 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter Orders by Status"
          >
            {SHIPMENT_FILTERS.map((s) => (
              <option key={s} value={s}>
                Filter: {s} ({filterCounts[s] || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Shipment Status Filter Tabs - Scrollable on tablet/desktop & mobile */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-2 mb-4"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {SHIPMENT_FILTERS.map((s) => {
          const cnt = filterCounts[s] || 0;
          const isActive = filter === s;
          return (
            <button
              key={s}
              className="btn btn-sm shrink-0"
              onClick={() => setFilter(s)}
              style={{
                background: isActive ? "rgba(22,163,74,0.15)" : "var(--surface-2)",
                color: isActive ? "#4ade80" : "var(--text-muted)",
                border: `1px solid ${isActive ? "rgba(22,163,74,0.3)" : "var(--border)"}`,
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {s} <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.75 }}>({cnt})</span>
            </button>
          );
        })}
      </div>

      <div className="admin-card animate-fadeInUp" style={{ padding: 0, overflow: "hidden" }}>
        {/* Search Header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 380 }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-dim)",
              }}
            >
              <path d="m21 21-4.34-4.34" />
              <circle cx="11" cy="11" r="8" />
            </svg>
            <input
              className="admin-input"
              style={{ paddingLeft: 34, margin: 0, width: "100%" }}
              placeholder="Search by Order ID, AWB, customer, or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, width: "100%", maxWidth: "fit-content" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {filtered.length} of {orders.length} orders
            </span>
            <button
              onClick={fetchOrders}
              className="btn btn-sm btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px" }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Desktop & Tablet Orders Table */}
        <div className="hidden md:block" style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Delhivery AWB</th>
                <th>Shipment Status</th>
                <th>Current Hub</th>
                <th>Expected Delivery</th>
                <th>Date</th>
                <th>Logistics Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
                    Loading orders & logistics status...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
                    No orders matching filter &ldquo;{filter}&rdquo;
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const isProcessing = Boolean(actionLoadingId);

                  return (
                    <tr key={order.id}>
                      {/* Order ID */}
                      <td>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#60a5fa",
                            fontFamily: "monospace",
                            fontSize: 13,
                            fontWeight: 600,
                            textAlign: "left",
                          }}
                        >
                          {order.id}
                        </button>
                        <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                          {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? "s" : ""}
                        </div>
                      </td>

                      {/* Customer */}
                      <td>
                        <div style={{ fontWeight: 500, color: "var(--text)" }}>{order.customer}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{order.phone}</div>
                      </td>

                      {/* Payment */}
                      <td>
                        <span
                          className={`badge ${
                            order.paymentStatus === "Paid"
                              ? "badge-green"
                              : order.paymentStatus === "Failed"
                              ? "badge-red"
                              : "badge-amber"
                          }`}
                        >
                          {order.payment} ({order.paymentStatus || "Pending"})
                        </span>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", marginTop: 2 }}>
                          ₹{(Number(order.total) || 0).toLocaleString("en-IN")}
                        </div>
                      </td>

                      {/* AWB Number */}
                      <td>
                        {order.waybill ? (
                          <div>
                            <button
                              onClick={() => viewLiveTracking(order.waybill)}
                              title="Click to track live on Delhivery"
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                            >
                              <span className="badge badge-purple" style={{ fontFamily: "monospace", fontSize: 11 }}>
                                {order.waybill}
                              </span>
                            </button>
                            <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>
                              Delhivery Express
                            </div>
                          </div>
                        ) : (
                          <span className="badge badge-gray" style={{ fontSize: 10 }}>
                            Unfulfilled
                          </span>
                        )}
                      </td>

                      {/* Shipment Status */}
                      <td>
                        <span className={`badge ${getLogisticsBadge(order.internalStatus || order.shippingStatus)}`}>
                          {order.internalStatus?.replace(/_/g, " ") || order.shippingStatus}
                        </span>
                        {order.lastTrackedAt && (
                          <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>
                            Synced: {formatAdminDateTime(order.lastTrackedAt)}
                          </div>
                        )}
                      </td>

                      {/* Current Location */}
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {order.currentLocation || "Orchha Origin"}
                      </td>

                      {/* Expected Delivery */}
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {order.expectedDeliveryDate ? formatAdminDate(order.expectedDeliveryDate) : "2-4 Days"}
                      </td>

                      {/* Date */}
                      <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                        {formatAdminDate(order.date)}
                      </td>

                      {/* Logistics Actions */}
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {!order.waybill ? (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => createDelhiveryShipment(order.id)}
                              disabled={isProcessing}
                              style={{ padding: "4px 8px", fontSize: 11 }}
                            >
                              {actionLoadingId === `ship_${order.id}` ? "..." : "📦 Ship"}
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => downloadLabel(order.waybill)}
                                title="Download Delhivery Shipping Label PDF"
                                className="btn btn-sm btn-secondary"
                                disabled={isProcessing}
                                style={{ padding: "4px 8px", fontSize: 11 }}
                              >
                                {actionLoadingId === `label_${order.waybill}` ? "..." : "🏷️ Label"}
                              </button>

                              <button
                                onClick={() => viewLiveTracking(order.waybill)}
                                title="View live carrier tracking scans"
                                className="btn btn-sm btn-secondary"
                                disabled={isProcessing}
                                style={{ padding: "4px 8px", fontSize: 11 }}
                              >
                                🚚 Track
                              </button>
                            </>
                          )}

                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => downloadInvoice(order.id)}
                            title="Download Official Tax Invoice PDF"
                            disabled={isProcessing}
                            style={{ padding: "4px 8px", fontSize: 11 }}
                          >
                            {actionLoadingId === `inv_${order.id}` ? "..." : "📄 Bill"}
                          </button>

                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setSelectedOrder(order)}
                            style={{ padding: "4px 8px", fontSize: 11 }}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Order Cards View (<md) */}
        <div className="block md:hidden p-3 space-y-3">
          {loading ? (
            <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)", fontSize: 13 }}>
              Loading orders & logistics status...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)", fontSize: 13 }}>
              No orders matching filter &ldquo;{filter}&rdquo;
            </div>
          ) : (
            filtered.map((order) => {
              const isProcessing = Boolean(actionLoadingId);

              return (
                <div
                  key={order.id}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {/* Card Header: Order ID & Status Badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#60a5fa",
                          fontFamily: "monospace",
                          fontSize: 14,
                          fontWeight: 700,
                          textAlign: "left",
                          padding: 0,
                        }}
                      >
                        {order.id}
                      </button>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {formatAdminDate(order.date)} &bull; {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? "s" : ""}
                      </div>
                    </div>

                    <span className={`badge ${getLogisticsBadge(order.internalStatus || order.shippingStatus)}`} style={{ fontSize: 11 }}>
                      {order.internalStatus?.replace(/_/g, " ") || order.shippingStatus}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: "8px 10px", fontSize: 12 }}>
                    <div style={{ fontWeight: 600, color: "var(--text)" }}>{order.customer}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 1 }}>{order.phone || "No phone"}</div>
                  </div>

                  {/* Logistics & Payment Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
                    <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Delhivery AWB</div>
                      {order.waybill ? (
                        <button
                          onClick={() => viewLiveTracking(order.waybill)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            fontFamily: "monospace",
                            fontWeight: 700,
                            color: "#c084fc",
                            cursor: "pointer",
                            fontSize: 11,
                            textAlign: "left",
                            marginTop: 2,
                          }}
                        >
                          {order.waybill}
                        </button>
                      ) : (
                        <div style={{ color: "var(--text-dim)", marginTop: 2 }}>Pending Manifest</div>
                      )}
                    </div>

                    <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Total & Payment</div>
                      <div style={{ fontWeight: 800, color: "#16a34a", fontSize: 12, marginTop: 2 }}>
                        ₹{(Number(order.total) || 0).toLocaleString("en-IN")}{" "}
                        <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.8 }}>({order.payment})</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 6, paddingTop: 4 }}>
                    {!order.waybill ? (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => createDelhiveryShipment(order.id)}
                        disabled={isProcessing}
                        style={{ padding: "6px 10px", fontSize: 11, justifyContent: "center" }}
                      >
                        {actionLoadingId === `ship_${order.id}` ? "..." : "📦 Ship"}
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => downloadLabel(order.waybill)}
                          disabled={isProcessing}
                          style={{ padding: "6px 8px", fontSize: 11, justifyContent: "center" }}
                        >
                          {actionLoadingId === `label_${order.waybill}` ? "..." : "🏷️ Label"}
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => viewLiveTracking(order.waybill)}
                          disabled={isProcessing}
                          style={{ padding: "6px 8px", fontSize: 11, justifyContent: "center" }}
                        >
                          🚚 Track
                        </button>
                      </>
                    )}
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => downloadInvoice(order.id)}
                      disabled={isProcessing}
                      style={{ padding: "6px 8px", fontSize: 11, justifyContent: "center" }}
                    >
                      {actionLoadingId === `inv_${order.id}` ? "..." : "📄 Bill"}
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setSelectedOrder(order)}
                      style={{ padding: "6px 8px", fontSize: 11, justifyContent: "center" }}
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Order Detail Drawer / Modal */}
      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order ${selectedOrder?.id}`}
        maxWidth={620}
      >
        {selectedOrder && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span className={`badge ${statusBadge[selectedOrder.status] || "badge-gray"}`}>
                  Order: {selectedOrder.status}
                </span>
                <span className={`badge ${getLogisticsBadge(selectedOrder.internalStatus)}`}>
                  Logistics: {selectedOrder.internalStatus?.replace(/_/g, " ")}
                </span>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {formatAdminDate(selectedOrder.date, true)}
              </span>
            </div>

            {/* Customer Info Card */}
            <div
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}
              >
                Customer & Delivery Address
              </div>
              <div style={{ fontWeight: 600, color: "var(--text)" }}>
                {selectedOrder.customer || "Anonymous"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                Phone: {selectedOrder.phone || "-"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
                Address: {selectedOrder.address || "-"}
              </div>
            </div>

            {/* Delhivery Logistics Control Card */}
            <div
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Delhivery Logistics Controls
                </div>
                {selectedOrder.waybill && (
                  <span className="badge badge-purple" style={{ fontFamily: "monospace", fontSize: 11 }}>
                    AWB: {selectedOrder.waybill}
                  </span>
                )}
              </div>

              {selectedOrder.waybill ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: "var(--text-muted)" }}>Courier Partner:</span>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>Delhivery Surface / Express</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: "var(--text-muted)" }}>Carrier Status:</span>
                    <span className="badge badge-blue">{selectedOrder.shippingStatus}</span>
                  </div>
                  {selectedOrder.currentLocation && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: "var(--text-muted)" }}>Current Location:</span>
                      <span style={{ color: "var(--text)" }}>{selectedOrder.currentLocation}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => downloadLabel(selectedOrder.waybill)}
                      disabled={Boolean(actionLoadingId)}
                      style={{ flex: 1, minWidth: 140, justifyContent: "center" }}
                    >
                      🏷️ Download Label PDF
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => viewLiveTracking(selectedOrder.waybill)}
                      disabled={Boolean(actionLoadingId)}
                      style={{ flex: 1, minWidth: 110, justifyContent: "center" }}
                    >
                      🚚 Track Live
                    </button>
                    {selectedOrder.status !== "Delivered" && selectedOrder.status !== "Cancelled" && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => cancelShipmentAWB(selectedOrder.waybill, selectedOrder.id)}
                        disabled={Boolean(actionLoadingId)}
                        style={{ justifyContent: "center" }}
                      >
                        ✕ Cancel AWB
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
                    No shipment manifest created yet. Click below to book courier pickup & generate Delhivery AWB.
                  </p>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => createDelhiveryShipment(selectedOrder.id)}
                    disabled={Boolean(actionLoadingId)}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {actionLoadingId === `ship_${selectedOrder.id}` ? "Generating AWB..." : "📦 Ship with Delhivery"}
                  </button>
                </div>
              )}
            </div>

            {/* Items */}
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                Ordered Items
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(selectedOrder.items || []).map((item, i) => {
                  const itemQty = Number(item.qty || 1);
                  const itemPrice = Number(item.price || 0);
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 12px",
                        background: "var(--surface-2)",
                        borderRadius: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, color: "var(--text)", fontSize: 13 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {item.variant} × {itemQty}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: "#16a34a", fontSize: 13 }}>
                        ₹{(itemPrice * itemQty).toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Summary */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "14px 16px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              {selectedOrder.subtotal !== undefined && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)" }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>
                    ₹{(Number(selectedOrder.subtotal) || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {Boolean(selectedOrder.discountAmount > 0 || selectedOrder.promoCode) && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#15803d" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>Coupon Discount</span>
                    {selectedOrder.promoCode && (
                      <span className="badge badge-green" style={{ fontFamily: "monospace", fontSize: 10, padding: "2px 6px" }}>
                        {selectedOrder.promoCode}
                      </span>
                    )}
                  </span>
                  <span style={{ fontWeight: 700, color: "#16a34a" }}>
                    -₹{(Number(selectedOrder.discountAmount) || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {selectedOrder.shippingCost !== undefined && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)" }}>
                  <span>Delivery Shipping</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>
                    {selectedOrder.shippingCost === 0 ? "FREE" : `₹${selectedOrder.shippingCost}`}
                  </span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid #bbf7d0",
                  paddingTop: 8,
                  marginTop: 2,
                }}
              >
                <div>
                  <span style={{ fontSize: 12, color: "#166534" }}>Payment: </span>
                  <span className="badge badge-green" style={{ fontSize: 11 }}>
                    {selectedOrder.payment} ({selectedOrder.paymentStatus})
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#15803d" }}>
                  ₹{(Number(selectedOrder.total) || 0).toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, minWidth: 140, justifyContent: "center" }}
                onClick={() => downloadInvoice(selectedOrder.id)}
              >
                📄 Download Invoice
              </button>
              {nextStatus[selectedOrder.status] && (
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, minWidth: 140, justifyContent: "center" }}
                  onClick={() => updateStatus(selectedOrder.id, nextStatus[selectedOrder.status])}
                >
                  Mark as {nextStatus[selectedOrder.status]}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Live Delhivery Tracking Modal for Admin */}
      <Modal
        open={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        title="Delhivery Live Logistics Tracking"
        maxWidth={540}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>AWB Waybill: </span>
            <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--text)" }}>
              {activeTrackingAwb}
            </span>
          </div>
          <button
            onClick={() => viewLiveTracking(activeTrackingAwb, true)}
            disabled={adminTrackingLoading}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: 11 }}
          >
            {adminTrackingLoading ? "Refreshing..." : "🔄 Refresh Scan"}
          </button>
        </div>

        {adminTrackingLoading ? (
          <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
            Querying live scans from Delhivery API network...
          </div>
        ) : adminTrackingData?.error ? (
          <div style={{ textAlign: "center", padding: 20, color: "#ef4444", fontSize: 13 }}>
            {adminTrackingData.error}
          </div>
        ) : adminTrackingData ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--surface-2)",
                padding: "10px 14px",
                borderRadius: 10,
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Status</div>
                <div style={{ fontWeight: 700, color: "var(--text)" }}>
                  {adminTrackingData.displayLabel || adminTrackingData.carrierStatus || "In Transit"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Current Location</div>
                <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 12 }}>
                  {adminTrackingData.currentLocation || "En Route"}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>
              Carrier Scan History ({(adminTrackingData.scans || []).length} scans)
            </div>

            <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {(adminTrackingData.scans || []).length === 0 ? (
                <div style={{ padding: 16, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                  Package manifest created. Awaiting first scan at pickup hub.
                </div>
              ) : (
                adminTrackingData.scans.map((scan, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "8px 12px",
                      background: i === 0 ? "rgba(22,163,74,0.08)" : "var(--surface-2)",
                      border: i === 0 ? "1px solid rgba(22,163,74,0.3)" : "1px solid var(--border)",
                      borderRadius: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12, color: i === 0 ? "#4ade80" : "var(--text)" }}>
                        {scan.status || scan.instructions || "Scanned"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                        {scan.location || "Logistics Hub"}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace" }}>
                      {formatAdminDateTime(scan.statusDateTime || scan.scan_time)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: 14, textAlign: "center" }}>
              <a
                href={`https://www.delhivery.com/track/package/${activeTrackingAwb}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "#60a5fa", textDecoration: "underline" }}
              >
                Open official Delhivery Portal for AWB {activeTrackingAwb} ↗
              </a>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
