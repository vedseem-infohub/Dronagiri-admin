"use client";

import { useState } from "react";
import Icon from "../components/Icon";

const SECTIONS = ["Store Info", "Shipping", "Notifications", "Admin Account"];

export default function SettingsPage() {
  const [active, setActive] = useState("Store Info");
  const [saved, setSaved] = useState(false);

  const [store, setStore] = useState({
    name: "Dronagiri Farm",
    tagline: "Pure Farm-Fresh Organic Products",
    email: "hello@dronagiri.com",
    phone: "+91 99999 99999",
    whatsapp: "+91 99999 99999",
    address: "Dronagiri Village, Pune District, Maharashtra - 412311",
    website: "https://customer-frontend-gilt.vercel.app",
  });

  const [shipping, setShipping] = useState({
    freeAbove: "500",
    flatRate: "80",
    estimatedDays: "3-7",
    codAvailable: true,
  });

  const [notif, setNotif] = useState({
    newOrder: true,
    lowStock: true,
    dailyReport: false,
  });

  const [pwd, setPwd] = useState({ current: "", newPwd: "", confirm: "" });
  const [pwdError, setPwdError] = useState("");

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handlePwdSave(e) {
    e.preventDefault();
    if (pwd.current !== "admin123") { setPwdError("Current password is incorrect"); return; }
    if (pwd.newPwd.length < 6) { setPwdError("New password must be at least 6 characters"); return; }
    if (pwd.newPwd !== pwd.confirm) { setPwdError("Passwords do not match"); return; }
    setPwdError("");
    setPwd({ current: "", newPwd: "", confirm: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const Label = ({ text }) => (
    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">{text}</label>
  );

  return (
    <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
      {/* Tab list */}
      <div className="admin-card animate-fadeInUp p-3">
        {SECTIONS.map(s => (
          <button
            key={s}
            className={`nav-item-light text-xs ${active === s ? "active" : ""}`}
            onClick={() => setActive(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="admin-card animate-fadeInUp">
        {/* Store Info */}
        {active === "Store Info" && (
          <form onSubmit={handleSave}>
            <h2 className="text-[17px] font-bold text-text mb-5">Store Information</h2>
            <div className="grid grid-cols-2 gap-x-4">
              {[
                { label: "Store Name", key: "name" },
                { label: "Tagline", key: "tagline" },
                { label: "Email", key: "email" },
                { label: "Phone", key: "phone" },
                { label: "WhatsApp", key: "whatsapp" },
                { label: "Website", key: "website" },
              ].map(f => (
                <div key={f.key} className="mb-4">
                  <Label text={f.label} />
                  <input className="admin-input" value={store[f.key]} onChange={e => setStore(s => ({ ...s, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="mb-5">
              <Label text="Full Address" />
              <textarea className="admin-input resize-y" rows={2} value={store.address} onChange={e => setStore(s => ({ ...s, address: e.target.value }))} />
            </div>
            <SaveBtn saved={saved} />
          </form>
        )}

        {/* Shipping */}
        {active === "Shipping" && (
          <form onSubmit={handleSave}>
            <h2 className="text-[17px] font-bold text-text mb-5">Shipping Settings</h2>
            <div className="grid grid-cols-2 gap-x-4">
              <div className="mb-4">
                <Label text="Free Shipping Above (₹)" />
                <input className="admin-input" type="number" value={shipping.freeAbove} onChange={e => setShipping(s => ({ ...s, freeAbove: e.target.value }))} />
              </div>
              <div className="mb-4">
                <Label text="Flat Shipping Rate (₹)" />
                <input className="admin-input" type="number" value={shipping.flatRate} onChange={e => setShipping(s => ({ ...s, flatRate: e.target.value }))} />
              </div>
              <div className="mb-4">
                <Label text="Estimated Delivery (days)" />
                <input className="admin-input" value={shipping.estimatedDays} onChange={e => setShipping(s => ({ ...s, estimatedDays: e.target.value }))} placeholder="e.g. 3-7" />
              </div>
              <div className="mb-5">
                <Label text="Cash on Delivery" />
                <div className="flex gap-2">
                  {[true, false].map(v => (
                    <button
                      key={String(v)}
                      type="button"
                      className={`btn btn-sm flex-1 ${
                        shipping.codAvailable === v
                          ? v
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-red-100 text-red-600 border border-red-300"
                          : "bg-surface-2 text-text-muted border border-border"
                      }`}
                      onClick={() => setShipping(s => ({ ...s, codAvailable: v }))}
                    >{v ? "Enabled" : "Disabled"}</button>
                  ))}
                </div>
              </div>
            </div>
            <SaveBtn saved={saved} />
          </form>
        )}

        {/* Notifications */}
        {active === "Notifications" && (
          <form onSubmit={handleSave}>
            <h2 className="text-[17px] font-bold text-text mb-5">Notification Preferences</h2>
            <div className="flex flex-col gap-4 mb-6">
              {[
                { key: "newOrder", label: "New Order Alerts", desc: "Get notified when a new order is placed" },
                { key: "lowStock", label: "Low Stock Alerts", desc: "Alert when any product stock drops below 10 units" },
                { key: "dailyReport", label: "Daily Sales Report", desc: "Receive a daily summary of sales activity" },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between py-3.5 px-4 bg-surface-2 rounded-2xl border border-border">
                  <div>
                    <div className="font-semibold text-text text-sm">{n.label}</div>
                    <div className="text-xs text-text-muted mt-0.5">{n.desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotif(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                    className={`w-11 h-6 rounded-full border-none cursor-pointer relative transition-colors duration-200 shrink-0 ${
                      notif[n.key] ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <span className={`absolute top-[2px] w-5 h-5 rounded-full bg-white transition-all duration-200 ${
                      notif[n.key] ? "left-[22px]" : "left-[2px]"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
            <SaveBtn saved={saved} />
          </form>
        )}

        {/* Admin Account */}
        {active === "Admin Account" && (
          <form onSubmit={handlePwdSave}>
            <h2 className="text-[17px] font-bold text-text mb-5">Change Password</h2>
            <div className="max-w-[360px]">
              {[
                { label: "Current Password", key: "current" },
                { label: "New Password", key: "newPwd" },
                { label: "Confirm New Password", key: "confirm" },
              ].map(f => (
                <div key={f.key} className="mb-3.5">
                  <Label text={f.label} />
                  <input className="admin-input" type="password" value={pwd[f.key]} onChange={e => { setPwd(p => ({ ...p, [f.key]: e.target.value })); setPwdError(""); }} />
                </div>
              ))}
              {pwdError && <div className="mb-3 text-[13px] text-red-500">{pwdError}</div>}
              {saved && !pwdError && (
                <div className="mb-3 text-[13px] text-green-600 flex items-center gap-1.5 font-medium">
                  <Icon name="check" size={14} className="text-green-600 shrink-0" />
                  <span>Password updated successfully!</span>
                </div>
              )}
              <button type="submit" className="btn btn-primary">Update Password</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SaveBtn({ saved }) {
  return (
    <div className="flex items-center gap-3">
      <button type="submit" className="btn btn-primary">Save Changes</button>
      {saved && (
        <span className="text-[13px] text-green-600 font-medium flex items-center gap-1.5 animate-fadeIn">
          <Icon name="check" size={14} className="text-green-600 shrink-0" />
          <span>Saved successfully!</span>
        </span>
      )}
    </div>
  );
}
