"use client";

import { useState } from "react";
import { DAILY_SALES, MONTHLY_SALES, CATEGORY_SALES, PRODUCTS, ORDERS } from "../lib/mockData";
import StatsCard from "../components/StatsCard";
import Icon from "../components/Icon";

const SEG_COLORS = ["#22c55e", "#d97706", "#3b82f6", "#a855f7", "#f43f5e", "#06b6d4", "#f59e0b", "#84cc16"];

export default function SalesPage() {
  const [period, setPeriod] = useState("weekly");
  const data = period === "monthly" ? MONTHLY_SALES : DAILY_SALES;
  const maxRev = Math.max(...data.map(d => d.revenue));
  const totalRev = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);
  const avgOrder = totalOrders ? Math.round(totalRev / totalOrders) : 0;
  const topProduct = [...PRODUCTS].sort((a, b) => b.sold - a.sold)[0];

  // SVG donut
  const donutR = 60, donutCX = 80, donutCY = 80, donutCirc = 2 * Math.PI * donutR;
  let offset = 0;
  const segments = CATEGORY_SALES.map((cat, i) => {
    const dash = (cat.pct / 100) * donutCirc;
    const seg = { ...cat, dash, offset, color: SEG_COLORS[i] };
    offset += dash;
    return seg;
  });

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7 stagger">
        <StatsCard label="Period Revenue" value={`₹${totalRev.toLocaleString("en-IN")}`} accent="green" icon={<Icon name="dollar-sign" />} trend={14} />
        <StatsCard label="Period Orders" value={totalOrders} accent="amber" icon={<Icon name="shopping-cart" />} trend={9} />
        <StatsCard label="Avg Order Value" value={`₹${avgOrder.toLocaleString("en-IN")}`} accent="blue" icon={<Icon name="file-text" />} />
        <StatsCard label="Best Seller" value={topProduct.name} sub={`${topProduct.sold} units sold`} accent="purple" icon={<Icon name="star" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">

        {/* Revenue Chart */}
        <div className="admin-card animate-fadeInUp py-5 px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-text">Revenue Chart</h2>
              <p className="text-xs text-text-muted mt-0.5">₹{totalRev.toLocaleString("en-IN")} total</p>
            </div>
            <div className="flex gap-1.5">
              {["weekly", "monthly"].map(p => (
                <button
                  key={p}
                  className={`btn btn-sm capitalize ${
                    period === p
                      ? "bg-green-600/12 text-green-700 border border-green-600/30"
                      : "bg-surface-2 text-text-muted border border-border"
                  }`}
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-2 h-[200px] pb-6 relative">
            {/* Y grid lines */}
            {[0, 25, 50, 75, 100].map(pct => (
              <div key={pct} className="absolute left-0 right-0 border-t border-dashed border-border-light z-0" style={{ bottom: 24 + (pct / 100) * 176 }}>
                <span className="absolute left-0 -top-2 text-[10px] text-text-dim">
                  ₹{Math.round((pct / 100) * maxRev / 1000)}k
                </span>
              </div>
            ))}

            {data.map((d, i) => {
              const h = maxRev ? Math.max(4, (d.revenue / maxRev) * 176) : 4;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 z-10">
                  <div
                    className="chart-bar w-full"
                    data-value={`₹${(d.revenue / 1000).toFixed(1)}k`}
                    style={{ height: h }}
                  />
                  <span className="text-[11px] text-text-muted whitespace-nowrap">{d.label}</span>
                </div>
              );
            })}
          </div>

          {/* Orders line summary */}
          <div className="flex gap-4 mt-2 pt-3 border-t border-border">
            {data.map((d, i) => (
              <div key={i} className="flex-1 text-center">
                <span className="text-[10px] text-text-dim mb-0.5">{d.label}</span>
                <div className="text-xs font-bold text-amber-800">{d.orders}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-text-dim mt-1 text-center">Orders per period</p>
        </div>

        {/* Category breakdown */}
        <div className="flex flex-col gap-4">
          <div className="admin-card animate-fadeInUp p-5">
            <h2 className="text-sm font-bold text-text mb-4">Sales by Category</h2>

            {/* Donut chart */}
            <div className="flex justify-center mb-5">
              <svg width={160} height={160} viewBox="0 0 160 160">
                <circle cx={donutCX} cy={donutCY} r={donutR} fill="none" stroke="var(--color-border)" strokeWidth={22} />
                {segments.map((seg, i) => (
                  <circle
                    key={i}
                    cx={donutCX} cy={donutCY} r={donutR}
                    fill="none" stroke={seg.color} strokeWidth={22}
                    strokeDasharray={`${seg.dash} ${donutCirc - seg.dash}`}
                    strokeDashoffset={donutCirc / 4 - seg.offset}
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                  />
                ))}
                <text x={donutCX} y={donutCY - 6} textAnchor="middle" fill="var(--color-text)" fontSize={13} fontWeight={700}>Total</text>
                <text x={donutCX} y={donutCY + 10} textAnchor="middle" fill="#15803d" fontSize={11}>₹{(CATEGORY_SALES.reduce((s, c) => s + c.revenue, 0) / 1000).toFixed(0)}k</text>
              </svg>
            </div>

            <div className="flex flex-col gap-2">
              {CATEGORY_SALES.map((cat, i) => (
                <div key={cat.category} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: SEG_COLORS[i] }} />
                  <span className="flex-1 text-xs text-text truncate">{cat.category}</span>
                  <span className="text-[11px] text-text-muted">{cat.pct}%</span>
                  <span className="text-[11px] text-text-dim min-w-[50px] text-right">₹{(cat.revenue / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top products */}
          <div className="admin-card animate-fadeInUp p-5">
            <h2 className="text-sm font-bold text-text mb-3.5">Top Sellers</h2>
            <div className="flex flex-col gap-2.5">
              {[...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 5).map((p, i) => (
                <div key={p.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-text">{p.name}</span>
                    <span className="text-xs text-text-muted">{p.sold} sold</span>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-600 ease-out" style={{
                      width: `${(p.sold / PRODUCTS[0].sold) * 100}%`,
                      background: `linear-gradient(90deg, ${SEG_COLORS[i]}, ${SEG_COLORS[i]}aa)`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
