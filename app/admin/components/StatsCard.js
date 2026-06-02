"use client";

export default function StatsCard({ label, value, sub, accent = "green", icon, trend }) {
  const configs = {
    green:  { border: "border-l-[3px] border-l-green-600", iconBg: "bg-green-100", iconColor: "text-green-800", trendPos: "text-green-800", trendBg: "bg-green-100" },
    amber:  { border: "border-l-[3px] border-l-amber-600", iconBg: "bg-amber-100", iconColor: "text-amber-800", trendPos: "text-amber-800", trendBg: "bg-amber-100" },
    blue:   { border: "border-l-[3px] border-l-blue-600", iconBg: "bg-blue-100", iconColor: "text-blue-700", trendPos: "text-blue-700", trendBg: "bg-blue-100" },
    purple: { border: "border-l-[3px] border-l-purple-600", iconBg: "bg-purple-100", iconColor: "text-purple-700", trendPos: "text-purple-700", trendBg: "bg-purple-100" },
    red:    { border: "border-l-[3px] border-l-red-600", iconBg: "bg-red-100", iconColor: "text-red-600", trendPos: "text-red-600", trendBg: "bg-red-100" },
  };
  const c = configs[accent] || configs.green;
  const isPositive = trend >= 0;

  return (
    <div className={`admin-card animate-fadeInUp ${c.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider mb-2">{label}</p>
          <p className="text-2xl font-extrabold text-text leading-none truncate">{value}</p>
          {sub && <p className="text-xs text-text-muted mt-1.5">{sub}</p>}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-[11px] font-bold py-0.5 px-2 rounded-full ${isPositive ? `${c.trendPos} ${c.trendBg}` : "text-red-600 bg-red-100"}`}>
                {isPositive ? "▲" : "▼"} {Math.abs(trend)}%
              </span>
              <span className="text-[11px] text-text-dim">vs last week</span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[22px] shrink-0 ${c.iconBg} ${c.iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
