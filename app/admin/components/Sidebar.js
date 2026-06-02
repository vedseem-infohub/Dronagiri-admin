"use client";

import { usePathname, useRouter } from "next/navigation";
import { logout } from "../lib/auth";
import Icon from "./Icon";
import Image from "next/image";

const navLinks = [
  { href: "/admin",           label: "Dashboard",       icon: "grid" },
  { href: "/admin/sales",     label: "Sales Tracking",  icon: "trending-up" },
  { href: "/admin/orders",    label: "Orders",          icon: "shopping-bag" },
  { href: "/admin/products",  label: "Products",        icon: "package" },
  { href: "/admin/stock",     label: "Stock",           icon: "layers" },
  { href: "/admin/customers", label: "Customers",       icon: "users" },
  { href: "/admin/admins",    label: "Admin Users",     icon: "shield" },
  { href: "/admin/settings",  label: "Settings",        icon: "settings" },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  const isActive = (href) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {open && <div className="sidebar-overlay md:hidden" onClick={onClose} />}

      <aside className={`w-[256px] bg-gradient-to-b from-[#1a3c2a] via-[#14532d] to-[#1e4a35] flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-[280ms] ease-in-out overflow-y-auto shadow-[4px_0_24px_rgba(0,0,0,0.12)] md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>

        {/* Logo */}
        <div className="pt-[22px] pb-[18px] px-[18px] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* <div className="w-[38px] h-[38px] bg-gradient-to-br from-primary to-lime-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-[0_4px_12px_rgba(22,163,74,0.4)]">
              <Icon name="sprout" size={20} />
            </div> */}
            <div>
              <div className="font-bold text-[15px] text-white leading-tight">
                <Image
                className="invert"
                  src="/logo2.png"
                  alt="Dronagiri Farm Logo"
                  width={200}
                  height={150}
                  loading="eager"
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
              <div className="text-[11px] text-white/50 mt-0.5">Admin Panel</div>
            </div>
          </div>
          <button className="btn btn-icon md:hidden bg-white/8 text-white/70 border-none hover:bg-white/15" onClick={onClose}>
            <Icon name="x" size={15} />
          </button>
        </div>

        {/* View site link */}
        <div className="pt-3 pb-1 px-3.5">
          <a
            href="https://customer-frontend-gilt.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/6 border border-white/10 text-white/60 text-xs font-medium no-underline transition-all duration-200 hover:bg-white/10 hover:text-white/90"
          >
            <Icon name="external" size={12} />
            View Customer Site
          </a>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 px-2.5">
          <div className="mb-1.5 py-1 px-2">
            <span className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Navigation</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`nav-item ${isActive(link.href) ? "active" : ""}`}
                onClick={e => { e.preventDefault(); router.push(link.href); onClose?.(); }}
              >
                <Icon name={link.icon} size={17} />
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* Bottom */}
        <div className="py-3.5 px-2.5 border-t border-white/8">
          <div className="flex items-center gap-2.5 p-2.5 mb-1.5 bg-white/6 rounded-xl border border-white/8">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-lime-600 flex items-center justify-center text-xs font-bold text-white shrink-0">A</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">Admin</div>
              <div className="text-[10px] text-white/45 truncate">admin@dronagiri.com</div>
            </div>
          </div>
          <button className="nav-item text-red-300 hover:text-red-200 hover:bg-white/8 text-[13px]" onClick={handleLogout}>
            <Icon name="log-out" size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
