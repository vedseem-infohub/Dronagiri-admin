"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Icon from "./components/Icon";
import { isAuthenticated } from "./lib/auth";

const pageTitles = {
  "/admin": "Dashboard",
  "/admin/sales": "Sales Tracking",
  "/admin/orders": "Orders",
  "/admin/products": "Products",
  "/admin/stock": "Stock Management",
  "/admin/customers": "Customers",
  "/admin/admins": "Admin Users",
  "/admin/settings": "Settings",
};

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setReady(true);
      return;
    }
    if (!isAuthenticated()) {
      router.replace("/admin/login");
    } else {
      setReady(true);
    }
  }, [pathname, isLoginPage, router]);

  // Login page — render without shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-green-500 flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Icon name="sprout" size={24} className="animate-pulse" />
          </div>
          <div className="text-text-muted text-sm">Loading admin panel…</div>
        </div>
      </div>
    );
  }

  const titleKey = Object.keys(pageTitles).find(k => k === pathname) || "/admin";
  const title = pageTitles[titleKey] || "Admin";

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content shifts right on desktop */}
      <div className="flex-1 min-w-0 md:ml-[256px]">
        <Navbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-7 min-h-[calc(100vh-62px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
