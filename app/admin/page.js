"use client";

import { useRouter } from "next/navigation";
import StatsCard from "./components/StatsCard";
import { useState, useEffect } from "react";
import { ORDERS, CUSTOMERS, DAILY_SALES } from "./lib/mockData";
import Icon from "./components/Icon";
import { adminFetch } from "./lib/auth";

const BACKEND_URL = "http://localhost:8000/api/products";

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const prodRes = await adminFetch("http://localhost:8000/api/products?includeInactive=true");
        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data);
        }

        const ordRes = await adminFetch("http://localhost:8000/api/orders/all");
        if (ordRes.ok) {
          const data = await ordRes.json();
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
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalRevenue = orders.filter(o => o.status === "Delivered").reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === "Pending" || o.status === "Confirmed").length;
  const lowStock = products.filter(p => p.stock <= 10).length;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayRevenue = orders
    .filter(o => o.status === "Delivered" && o.date === todayStr)
    .reduce((sum, o) => sum + o.total, 0);

  const recentOrders = orders.slice(0, 6);

  const statusColor = { Pending: "amber", Confirmed: "blue", Shipped: "purple", Delivered: "green", Cancelled: "red" };
  const statusBadge = { Pending: "badge-amber", Confirmed: "badge-blue", Shipped: "badge-purple", Delivered: "badge-green", Cancelled: "badge-red" };
  const amtColor = "#15803d";

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
        <div style={{ width: 40, height: 40, border: "4px solid #22c55e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Harvesting dashboard insights...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7 stagger">
        <StatsCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} sub="From delivered orders" accent="green" icon={<Icon name="dollar-sign" />} trend={12} />
        <StatsCard label="Today's Revenue" value={`₹${todayRevenue.toLocaleString("en-IN")}`} sub="Sun, 1 Jun" accent="amber" icon={<Icon name="trending-up" />} trend={8} />
        <StatsCard label="Pending Orders" value={pendingOrders} sub="Needs attention" accent="blue" icon={<Icon name="shopping-cart" />} />
        <StatsCard label="Low Stock Items" value={lowStock} sub="Items below 10 units" accent="red" icon={<Icon name="alert-triangle" />} trend={-5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">

        {/* Recent Orders */}
        <div className="admin-card animate-fadeInUp overflow-hidden p-0">
          <div className="px-6 py-5 flex items-center justify-between border-b border-border">
            <div>
              <h2 className="text-base font-bold text-text">Recent Orders</h2>
              <p className="text-xs text-text-muted mt-0.5">Latest {recentOrders.length} orders</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push("/admin/orders")}>View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td className="font-semibold text-text font-mono text-xs">{order.id}</td>
                    <td className="text-text">{order.customer}</td>
                    <td className="font-bold text-green-700">₹{order.total.toLocaleString("en-IN")}</td>
                    <td><span className={`badge ${statusBadge[order.status]}`}>{order.status}</span></td>
                    <td className="text-text-muted text-xs">{new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Quick Actions */}
          <div className="admin-card animate-fadeInUp p-5">
            <h2 className="text-sm font-bold text-text mb-3.5">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              {[
                { label: "Add New Product", href: "/admin/products", icon: "plus" },
                { label: "View All Orders", href: "/admin/orders", icon: "package" },
                { label: "Sales Report", href: "/admin/sales", icon: "file-text" },
                { label: "Stock Overview", href: "/admin/stock", icon: "database" },
              ].map(a => (
                <button
                  key={a.href}
                  className="btn btn-secondary justify-start gap-2.5 py-2.5 px-3.5 w-full"
                  onClick={() => router.push(a.href)}
                >
                  <Icon name={a.icon} size={16} className="text-text-muted" />
                  <span className="text-xs">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="admin-card animate-fadeInUp p-5">
            <h2 className="text-sm font-bold text-text mb-3.5">Top Products</h2>
            <div className="flex flex-col gap-2.5">
              {products.slice().sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex items-center gap-2.5">
                  <span className={`w-5.5 h-5.5 rounded-md flex items-center justify-center text-[11px] font-bold ${i === 0 ? "bg-amber-100 text-amber-800" : "bg-surface-2 text-text-muted"}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-xs text-text truncate">{p.name}</span>
                  <span className="text-xs text-text-muted font-semibold whitespace-nowrap">{(p.sold || 0)} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
