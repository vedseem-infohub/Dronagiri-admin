"use client";

import Icon from "./Icon";

export default function Navbar({ title, onMenuClick }) {
  return (
    <header className="h-[62px] bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          className="btn btn-icon btn-secondary md:hidden"
          onClick={onMenuClick}
        >
          <Icon name="menu" size={18} />
        </button>
        <div>
          <h1 className="text-[17px] font-bold text-text leading-none">{title}</h1>
          <p className="text-[11px] text-text-muted mt-0.5">Dronagiri Farm Admin</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 py-1 px-3 bg-green-100 border border-green-200 rounded-full">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-dot" />
          <span className="text-xs text-green-700 font-semibold">Live</span>
        </div>

        {/* Date */}
        <div className="py-1 px-3 bg-surface-2 border border-border rounded-full text-xs text-text-muted font-medium">
          {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>
    </header>
  );
}
