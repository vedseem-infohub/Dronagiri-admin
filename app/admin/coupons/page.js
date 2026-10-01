"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import StatsCard from "../components/StatsCard";
import { adminFetch, safeJson } from "../lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BACKEND_URL ||
  process.env.NEXT_API_BACKEND_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://dronagiri-backend-e4ja.onrender.com");

export default function CouponManagementPage() {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, inactive: 0, totalUsage: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'active' | 'expired' | 'inactive'
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal State
  const [modalMode, setModalMode] = useState(null); // null | 'add' | 'edit'
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // Feedback Notification
  const [notification, setNotification] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    expiresAt: "",
    usageLimit: "",
    isActive: true,
  });
  const [formError, setFormError] = useState("");

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await adminFetch(`${API_BASE}/api/coupons/admin`);
      const data = await safeJson(res);
      if (res.ok && data?.success) {
        setCoupons(Array.isArray(data.data) ? data.data : []);
        if (data.stats) setStats(data.stats);
      } else {
        console.error("Failed to fetch coupons:", data?.message || res.statusText);
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Format date helper
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return { text: "Never Expires", isExpired: false, badge: "badge-gray", daysLeft: null };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { text: "No expiry", isExpired: false, badge: "badge-gray", daysLeft: null };
      
      const now = new Date();
      const diffMs = d - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const isExpired = diffMs <= 0;

      const formatted = d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      let badge = "badge-green";
      let statusNote = "";

      if (isExpired) {
        badge = "badge-red";
        statusNote = "Expired";
      } else if (diffDays <= 3) {
        badge = "badge-amber";
        statusNote = `${diffDays} day${diffDays === 1 ? "" : "s"} left`;
      } else {
        statusNote = `${diffDays} days left`;
      }

      return { text: formatted, isExpired, badge, statusNote, daysLeft: diffDays };
    } catch (e) {
      return { text: "-", isExpired: false, badge: "badge-gray", daysLeft: null };
    }
  };

  // Convert Date to string suitable for <input type="datetime-local">
  const toLocalDatetimeInput = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const pad = (n) => String(n).padStart(2, "0");
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const handleCopyCode = (code) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    // Default expiry: 30 days from now at 23:59
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    defaultDate.setHours(23, 59, 0, 0);

    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      expiresAt: toLocalDatetimeInput(defaultDate),
      usageLimit: "",
      isActive: true,
    });
    setFormError("");
    setActiveCoupon(null);
    setModalMode("add");
  };

  // Open Edit Modal
  const openEditModal = (coupon) => {
    setFormData({
      code: coupon.code || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue !== undefined ? String(coupon.discountValue) : "",
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : "",
      maxDiscountAmount: coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : "",
      expiresAt: toLocalDatetimeInput(coupon.expiresAt),
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      isActive: coupon.isActive !== false,
    });
    setFormError("");
    setActiveCoupon(coupon);
    setModalMode("edit");
  };

  const closeModal = () => {
    if (isSubmittingRef.current) return;
    setModalMode(null);
    setActiveCoupon(null);
    setFormError("");
  };

  // Quick preset dates for expiry
  const setExpiryPreset = (days) => {
    if (days === null) {
      setFormData((prev) => ({ ...prev, expiresAt: "" }));
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(23, 59, 0, 0);
    setFormData((prev) => ({ ...prev, expiresAt: toLocalDatetimeInput(d) }));
  };

  // Handle Form Submit (Create / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    const trimmedCode = formData.code.trim().toUpperCase();
    if (!trimmedCode) {
      setFormError("Coupon code is required.");
      return;
    }

    const numericDiscount = parseFloat(formData.discountValue);
    if (isNaN(numericDiscount) || numericDiscount <= 0) {
      setFormError("Please enter a valid positive discount value.");
      return;
    }

    if (formData.discountType === "percentage" && numericDiscount > 100) {
      setFormError("Percentage discount cannot exceed 100%.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setFormError("");

    const payload = {
      code: trimmedCode,
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue: numericDiscount,
      minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
      maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
      isActive: formData.isActive,
    };

    try {
      const url =
        modalMode === "add"
          ? `${API_BASE}/api/coupons/admin`
          : `${API_BASE}/api/coupons/admin/${activeCoupon._id}`;

      const res = await adminFetch(url, {
        method: modalMode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);

      if (res.ok && data?.success) {
        showToast(
          modalMode === "add"
            ? `Coupon "${trimmedCode}" created successfully!`
            : `Coupon "${trimmedCode}" updated successfully!`
        );
        closeModal();
        await fetchCoupons();
      } else {
        setFormError(data?.message || "Failed to save coupon.");
      }
    } catch (err) {
      console.error("Save coupon error:", err);
      setFormError("Network error. Please try again.");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Toggle active status
  const handleToggle = async (coupon) => {
    try {
      const res = await adminFetch(`${API_BASE}/api/coupons/admin/${coupon._id}/toggle`, {
        method: "PATCH",
      });
      const data = await safeJson(res);
      if (res.ok && data?.success) {
        showToast(`Coupon ${coupon.code} is now ${data.data?.isActive ? "Active" : "Inactive"}`);
        setCoupons((prev) =>
          prev.map((c) => (c._id === coupon._id ? { ...c, isActive: data.data.isActive } : c))
        );
      } else {
        showToast(data?.message || "Failed to toggle status", "error");
      }
    } catch (err) {
      console.error("Toggle error:", err);
      showToast("Network error while updating status", "error");
    }
  };

  // Delete coupon
  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      const res = await adminFetch(`${API_BASE}/api/coupons/admin/${deleteModal._id}`, {
        method: "DELETE",
      });
      const data = await safeJson(res);
      if (res.ok && data?.success) {
        showToast(`Coupon "${deleteModal.code}" deleted successfully.`);
        setDeleteModal(null);
        await fetchCoupons();
      } else {
        showToast(data?.message || "Failed to delete coupon", "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Network error while deleting coupon", "error");
    }
  };

  // Filter & Search Logic
  const filteredCoupons = useMemo(() => {
    const now = new Date();
    return coupons.filter((c) => {
      const isExpired = c.expiresAt && new Date(c.expiresAt) <= now;
      const isActive = c.isActive && !isExpired;

      // Filter Tab
      if (filter === "active" && !isActive) return false;
      if (filter === "expired" && !isExpired) return false;
      if (filter === "inactive" && c.isActive) return false;

      // Search Filter
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const codeMatch = c.code.toLowerCase().includes(query);
        const descMatch = (c.description || "").toLowerCase().includes(query);
        return codeMatch || descMatch;
      }

      return true;
    });
  }, [coupons, filter, search]);

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold transition-all duration-300 animate-fadeInUp ${
            notification.type === "error"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          <Icon name={notification.type === "error" ? "alert-triangle" : "check"} size={18} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Icon name="ticket" size={24} />
            </span>
            Coupon Management
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Create and manage promotional discount coupons, expiration dates, and usage limits.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn btn-primary flex items-center gap-2 self-start sm:self-auto shadow-md hover:shadow-lg transition-all"
        >
          <Icon name="plus" size={17} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Coupons"
          value={stats.total}
          sub="All promo codes configured"
          accent="purple"
          icon={<Icon name="ticket" size={22} />}
        />
        <StatsCard
          label="Active Coupons"
          value={stats.active}
          sub="Currently claimable by customers"
          accent="green"
          icon={<Icon name="check" size={22} />}
        />
        <StatsCard
          label="Expired Coupons"
          value={stats.expired}
          sub="Past expiration date"
          accent="amber"
          icon={<Icon name="alert-triangle" size={22} />}
        />
        <StatsCard
          label="Total Redemptions"
          value={stats.totalUsage}
          sub="Times coupons used by customers"
          accent="blue"
          icon={<Icon name="trending-up" size={22} />}
        />
      </div>

      {/* Controls & Search Bar */}
      <div className="admin-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search coupon code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-surface-2 border border-border rounded-xl text-text placeholder:text-text-dim focus:outline-none focus:border-primary transition-all"
          />
          <span className="absolute left-3 top-2.5 text-text-dim">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-text-dim hover:text-text text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All", count: stats.total },
            { id: "active", label: "Active", count: stats.active },
            { id: "expired", label: "Expired", count: stats.expired },
            { id: "inactive", label: "Disabled", count: stats.inactive },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filter === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface-2 text-text-muted hover:bg-surface-3 hover:text-text border border-border/50"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filter === tab.id ? "bg-white/20 text-white" : "bg-border text-text-muted"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table */}
      <div className="admin-card p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount Added</th>
                <th>Min. Order</th>
                <th>Expiration Date & Status</th>
                <th>Redemptions</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-muted text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading coupons...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-muted text-sm">
                    <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center text-text-dim text-2xl">
                        🎟️
                      </div>
                      <span className="font-semibold text-text">No coupons found</span>
                      <p className="text-xs text-text-dim">
                        {search
                          ? `No coupons match "${search}". Try clearing search.`
                          : "Create your first discount coupon to offer savings to customers."}
                      </p>
                      {!search && (
                        <button onClick={openAddModal} className="btn btn-sm btn-primary mt-2">
                          + Create Coupon
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const exp = formatDateDisplay(coupon.expiresAt);
                  const isDiscountPercent = coupon.discountType === "percentage";

                  return (
                    <tr key={coupon._id} className="hover:bg-surface-2/40 transition-colors">
                      {/* Code */}
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            title="Click to copy code"
                            className="font-mono text-xs font-bold text-text bg-surface-2 px-2.5 py-1.5 rounded-lg border border-border/80 hover:border-primary flex items-center gap-1.5 transition-colors group cursor-pointer"
                          >
                            <span className="text-primary">{coupon.code}</span>
                            <span className="text-[10px] text-text-dim group-hover:text-primary">
                              {copiedCode === coupon.code ? "✓ Copied" : "📋"}
                            </span>
                          </button>
                        </div>
                        {coupon.description && (
                          <div className="text-[11px] text-text-muted mt-1 max-w-xs truncate" title={coupon.description}>
                            {coupon.description}
                          </div>
                        )}
                      </td>

                      {/* Discount Added */}
                      <td>
                        <div className="flex items-center gap-2">
                          <span
                            className={`badge ${
                              isDiscountPercent ? "badge-green" : "badge-blue"
                            } font-bold text-xs`}
                          >
                            {isDiscountPercent
                              ? `${coupon.discountValue}% OFF`
                              : `₹${coupon.discountValue.toLocaleString("en-IN")} FLAT OFF`}
                          </span>
                        </div>
                        {isDiscountPercent && coupon.maxDiscountAmount && (
                          <div className="text-[11px] text-text-dim mt-0.5 font-medium">
                            Up to ₹{coupon.maxDiscountAmount.toLocaleString("en-IN")} cap
                          </div>
                        )}
                      </td>

                      {/* Min. Order */}
                      <td>
                        <div className="text-xs font-semibold text-text">
                          {coupon.minOrderAmount > 0
                            ? `₹${coupon.minOrderAmount.toLocaleString("en-IN")}`
                            : "No Minimum"}
                        </div>
                        <div className="text-[10px] text-text-dim">
                          {coupon.minOrderAmount > 0 ? "Basket Subtotal" : "Any order size"}
                        </div>
                      </td>

                      {/* Expiration Date */}
                      <td>
                        <div className="flex flex-col gap-1">
                          <span className={`badge ${exp.badge} self-start text-[11px] font-bold`}>
                            {exp.isExpired ? "Expired" : exp.statusNote || "Active"}
                          </span>
                          <span className="text-xs text-text font-medium">{exp.text}</span>
                        </div>
                      </td>

                      {/* Redemptions */}
                      <td>
                        <div className="text-xs font-bold text-text">
                          {coupon.usedCount || 0}
                          {coupon.usageLimit ? (
                            <span className="text-text-dim font-normal"> / {coupon.usageLimit}</span>
                          ) : (
                            <span className="text-text-dim font-normal"> uses</span>
                          )}
                        </div>
                        {coupon.usageLimit && (
                          <div className="w-20 h-1.5 bg-surface-2 rounded-full overflow-hidden mt-1 border border-border">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, Math.round(((coupon.usedCount || 0) / coupon.usageLimit) * 100))}%`,
                              }}
                            />
                          </div>
                        )}
                      </td>

                      {/* Active Toggle */}
                      <td>
                        <button
                          onClick={() => handleToggle(coupon)}
                          title={`Click to ${coupon.isActive ? "deactivate" : "activate"}`}
                          className={`badge cursor-pointer transition-all hover:scale-105 ${
                            coupon.isActive ? "badge-green" : "badge-gray"
                          }`}
                        >
                          {coupon.isActive ? "Active" : "Disabled"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="btn btn-icon btn-sm hover:text-primary hover:border-primary"
                            title="Edit Coupon & Expiry Date"
                          >
                            <Icon name="edit-2" size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteModal(coupon)}
                            className="btn btn-icon btn-sm text-red-500 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
                            title="Delete Coupon"
                          >
                            <Icon name="trash-2" size={14} />
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
      </div>

      {/* Add / Edit Coupon Modal */}
      <Modal
        open={Boolean(modalMode)}
        onClose={closeModal}
        title={modalMode === "add" ? "Create New Discount Coupon" : `Edit Coupon: ${activeCoupon?.code}`}
        maxWidth={620}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Icon name="alert-triangle" size={16} />
              <span>{formError}</span>
            </div>
          )}

          {/* Code and Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. FESTIVE20, DRONA100"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s+/g, "") }))
                }
                className="w-full px-3 py-2 text-sm uppercase font-mono font-bold bg-surface-2 border border-border rounded-xl text-text focus:outline-none focus:border-primary transition-all"
                required
              />
              <span className="text-[11px] text-text-dim mt-1 block">Customer enters this exact promo code.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, discountType: "percentage" }))}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    formData.discountType === "percentage"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-surface-2 text-text border-border hover:bg-surface-3"
                  }`}
                >
                  <Icon name="percent" size={14} />
                  <span>Percentage (%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, discountType: "flat" }))}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    formData.discountType === "flat"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-surface-2 text-text border-border hover:bg-surface-3"
                  }`}
                >
                  <Icon name="dollar-sign" size={14} />
                  <span>Flat (₹)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5">
              Description / Promotion Note
            </label>
            <input
              type="text"
              placeholder="e.g. Special 20% discount on all organic spices"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-surface-2 border border-border rounded-xl text-text focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Discount Value, Min Order, Max Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  placeholder={formData.discountType === "percentage" ? "e.g. 15" : "e.g. 150"}
                  value={formData.discountValue}
                  onChange={(e) => setFormData((prev) => ({ ...prev, discountValue: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2 text-sm font-bold bg-surface-2 border border-border rounded-xl text-text focus:outline-none focus:border-primary transition-all"
                  required
                />
                <span className="absolute left-2.5 top-2 text-text-muted text-xs font-bold">
                  {formData.discountType === "percentage" ? "%" : "₹"}
                </span>
              </div>
              <span className="text-[10px] text-text-dim mt-1 block">
                {formData.discountType === "percentage" ? "Percent off subtotal" : "Flat amount deducted"}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5">
                Min. Order Amount (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0 (No minimum)"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, minOrderAmount: e.target.value }))}
                  className="w-full pl-7 pr-3 py-2 text-sm bg-surface-2 border border-border rounded-xl text-text focus:outline-none focus:border-primary transition-all"
                />
                <span className="absolute left-2.5 top-2 text-text-muted text-xs font-bold">₹</span>
              </div>
              <span className="text-[10px] text-text-dim mt-1 block">Cart subtotal threshold</span>
            </div>

            {formData.discountType === "percentage" ? (
              <div>
                <label className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5">
                  Max Cap (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 500 (No cap)"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxDiscountAmount: e.target.value }))}
                    className="w-full pl-7 pr-3 py-2 text-sm bg-surface-2 border border-border rounded-xl text-text focus:outline-none focus:border-primary transition-all"
                  />
                  <span className="absolute left-2.5 top-2 text-text-muted text-xs font-bold">₹</span>
                </div>
                <span className="text-[10px] text-text-dim mt-1 block">Maximum discount allowed</span>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5">
                  Max Redemptions
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, usageLimit: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-surface-2 border border-border rounded-xl text-text focus:outline-none focus:border-primary transition-all"
                />
                <span className="text-[10px] text-text-dim mt-1 block">Total times coupon can be used</span>
              </div>
            )}
          </div>

          {/* Expiration Date Section - Admin Full Control */}
          <div className="p-4 bg-surface-2/60 border border-border rounded-2xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="tag" size={14} className="text-primary" />
                Coupon Expiration Date & Time
              </label>
              {formData.expiresAt && (
                <button
                  type="button"
                  onClick={() => setExpiryPreset(null)}
                  className="text-[11px] text-red-500 hover:text-red-700 font-semibold"
                >
                  Clear Expiry (Never Expires)
                </button>
              )}
            </div>

            <input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm bg-white border border-border rounded-xl text-text focus:outline-none focus:border-primary transition-all"
            />

            {/* Quick Expiry Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-[11px] text-text-dim mr-1">Quick Presets:</span>
              <button
                type="button"
                onClick={() => setExpiryPreset(7)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-border rounded-lg hover:border-primary hover:text-primary transition-all"
              >
                +7 Days
              </button>
              <button
                type="button"
                onClick={() => setExpiryPreset(15)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-border rounded-lg hover:border-primary hover:text-primary transition-all"
              >
                +15 Days
              </button>
              <button
                type="button"
                onClick={() => setExpiryPreset(30)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-border rounded-lg hover:border-primary hover:text-primary transition-all"
              >
                +30 Days
              </button>
              <button
                type="button"
                onClick={() => setExpiryPreset(null)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-border rounded-lg hover:border-primary hover:text-primary transition-all"
              >
                Never Expires
              </button>
            </div>
            <p className="text-[11px] text-text-dim leading-relaxed">
              Admin controls the exact expiration cutoff. Customers cannot apply this coupon once this timestamp has passed.
            </p>
          </div>

          {/* Active Status Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="couponActive"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
            />
            <label htmlFor="couponActive" className="text-sm font-semibold text-text cursor-pointer select-none">
              Coupon is active and ready for customer use
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="btn btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary text-sm min-w-[130px] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Icon name="save" size={16} />
                  <span>{modalMode === "add" ? "Create Coupon" : "Save Changes"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deleteModal)}
        onClose={() => setDeleteModal(null)}
        title="Delete Coupon"
        maxWidth={460}
      >
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5">
            <Icon name="alert-triangle" size={18} className="shrink-0 text-red-600 mt-0.5" />
            <p>
              Are you sure you want to permanently delete coupon <b>&ldquo;{deleteModal?.code}&rdquo;</b>? This
              cannot be undone. Existing orders with this coupon will keep their recorded discount.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={() => setDeleteModal(null)} className="btn btn-secondary text-sm">
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="btn bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
