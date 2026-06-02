"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../lib/auth";
import Icon from "../components/Icon";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = login(email, password);
    setLoading(false);
    if (ok) {
      router.push("/admin");
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen bg-bg flex relative overflow-hidden">
      {/* Left panel — brand green (matches site's about section) */}
      <div className="hidden md:flex w-[45%] bg-gradient-to-br from-[#14532d] via-[#166534] to-[#1e4a35] flex-col justify-center px-14 py-15 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/4 pointer-events-none" />
        <div className="absolute -bottom-15 -right-15 w-70 h-70 rounded-full bg-lime-600/12 pointer-events-none" />
        <div className="absolute top-[40%] -right-10 w-40 h-40 rounded-full bg-amber-600/8 pointer-events-none" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-primary to-lime-600 flex items-center justify-center shadow-[0_6px_20px_rgba(22,163,74,0.4)]">
              <Icon name="sprout" size={28} className="text-white" />
            </div>
            <div>
              <div className="font-extrabold text-xl text-white">Dronagiri Farm</div>
              <div className="text-[13px] text-white/55">Admin Portal</div>
            </div>
          </div>

          <h2 className="text-[34px] font-black text-white leading-tight mb-4">
            Manage your<br/>
            <span className="text-green-300">farm business</span>
          </h2>
          <p className="text-sm text-white/60 leading-relaxed mb-10 max-w-[320px]">
            Track orders, manage products, monitor sales, and keep stock up-to-date — all in one place.
          </p>

          {/* Feature pills */}
          {[
            { icon: "package", text: "Product & Stock Management" },
            { icon: "shopping-cart", text: "Order Tracking & Updates" },
            { icon: "trending-up", text: "Sales Analytics & Reports" },
            { icon: "users", text: "Customer Management" },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-2.5 mb-3 p-3 bg-white/8 rounded-xl border border-white/10">
              <Icon name={f.icon} size={16} className="text-green-300" />
              <span className="text-[13px] text-white/80 font-medium">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="animate-fadeInUp w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 md:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-lime-600 flex items-center justify-center">
              <Icon name="sprout" size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-base text-text">Dronagiri Farm</div>
              <div className="text-[11px] text-text-muted">Admin Portal</div>
            </div>
          </div>

          <h1 className="text-2xl font-black text-text mb-1.5">Welcome back</h1>
          <p className="text-sm text-text-muted mb-7">Sign in to your admin account</p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-text mb-1.5">Email address</label>
              <input
                className="admin-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="admin@dronagiri.com"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-text mb-1.5">Password</label>
              <div className="relative">
                <input
                  className="admin-input pr-11"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted p-1 hover:text-text"
                >
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3.5 bg-red-100 border border-red-200 rounded-xl text-[13px] text-red-600 flex items-center gap-2">
                <Icon name="alert-triangle" size={16} className="text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full justify-center p-3 text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Signing in…
                </>
              ) : "Sign In →"}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center justify-center gap-2">
            <Icon name="sprout" size={14} className="text-green-600 shrink-0" />
            <span>Demo: <strong>admin@dronagiri.com</strong> / <strong>admin123</strong></span>
          </div>

          <p className="text-center mt-4 text-xs text-text-dim">
            Dronagiri Farm © {new Date().getFullYear()} · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
