"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import { adminFetch } from "../lib/auth";

const BACKEND_URL = `${process.env.NEXT_PUBLIC_API_BACKEND_URL || process.env.NEXT_API_BACKEND_URL || "https://dronagiri-backend-e4ja.onrender.com"}/api/categories`;

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState(null); // null | "add" | "edit"
  const [activeCategory, setActiveCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null); // null | category object
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    nameHindi: "",
    description: "",
    imageUrl: "",
    displayOrder: 0,
    active: true,
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await adminFetch(BACKEND_URL);
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch categories:", res.statusText);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setFormData({
      name: "",
      nameHindi: "",
      description: "",
      imageUrl: "",
      displayOrder: categories.length + 1,
      active: true,
    });
    setFormError("");
    setActiveCategory(null);
    setModalMode("add");
  }

  function openEditModal(category) {
    setFormData({
      name: category.name || "",
      nameHindi: category.nameHindi || "",
      description: category.description || "",
      imageUrl: category.imageUrl || "",
      displayOrder: category.displayOrder || 0,
      active: category.active !== false,
    });
    setFormError("");
    setActiveCategory(category);
    setModalMode("edit");
  }

  function closeModal() {
    if (isSubmittingRef.current) return;
    setModalMode(null);
    setActiveCategory(null);
    setFormError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    if (!formData.name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setFormError("");

    try {
      const catId = activeCategory?._id || activeCategory?.id;
      const url = modalMode === "add" ? BACKEND_URL : `${BACKEND_URL}/${catId}`;
      const method = modalMode === "add" ? "POST" : "PUT";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        if (modalMode === "add") {
          setCategories((prev) => [...prev, data]);
        } else {
          setCategories((prev) =>
            prev.map((c) => ((c._id || c.id) === catId ? { ...c, ...data } : c))
          );
        }
        setModalMode(null);
        setActiveCategory(null);
        // Refresh to ensure product counts and database state stay 100% synchronized
        fetchCategories();
      } else {
        setFormError(data.message || "Failed to save category.");
      }
    } catch (err) {
      console.error("Save category error:", err);
      setFormError(`Network error: ${err.message}`);
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }, 500);
    }
  }

  async function handleDelete() {
    if (!deleteModal || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const deleteId = deleteModal._id || deleteModal.id;
      const res = await adminFetch(`${BACKEND_URL}/${deleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCategories((prev) => prev.filter((c) => (c._id || c.id) !== deleteId));
        setDeleteModal(null);
      } else {
        alert(data.message || "Failed to delete category.");
      }
    } catch (err) {
      console.error("Delete category error:", err);
      alert(`Network error: ${err.message}`);
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }, 500);
    }
  }

  async function toggleCategoryActive(category) {
    const catId = category._id || category.id;
    try {
      const res = await adminFetch(`${BACKEND_URL}/${catId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !category.active }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCategories((prev) =>
          prev.map((c) => ((c._id || c.id) === catId ? updated : c))
        );
      }
    } catch (err) {
      console.error("Toggle active error:", err);
    }
  }

  // Filtered categories
  const filteredCategories = categories.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name?.toLowerCase().includes(q) ||
      c.nameHindi?.includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.slug?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Product Categories</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Manage product categories. Category renames automatically cascade to all assigned products.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link href="/admin/products" className="btn btn-secondary flex-1 sm:flex-initial text-xs sm:text-sm">
            <Icon name="package" size={15} />
            <span>Products</span>
          </Link>
          <button onClick={openAddModal} className="btn btn-primary flex-1 sm:flex-initial text-xs sm:text-sm shadow-md">
            <Icon name="plus" size={15} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="admin-card p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] pointer-events-none"
            >
              <path d="m21 21-4.34-4.34" />
              <circle cx="11" cy="11" r="8" />
            </svg>
            <input
              type="text"
              className="admin-input pl-10 pr-9 h-11"
              placeholder="Search category by name, Hindi, slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] hover:text-[var(--color-text)] p-1 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] font-medium self-end sm:self-center shrink-0">
            Showing <strong className="text-[var(--color-text)]">{filteredCategories.length}</strong> of{" "}
            <strong>{categories.length}</strong> categories
          </div>
        </div>
      </div>

      {/* Content View */}
      {loading ? (
        <div className="admin-card p-12 text-center text-[var(--color-text-muted)]">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full mb-2" />
          <p className="text-sm">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="admin-card p-12 text-center text-[var(--color-text-muted)]">
          <Icon name="tag" size={32} className="mx-auto mb-2 opacity-50" />
          <p className="font-semibold text-base text-[var(--color-text)]">No categories found</p>
          <p className="text-xs mt-1">
            {search ? "No categories match your search." : "Get started by adding your first product category."}
          </p>
          {search ? (
            <button onClick={() => setSearch("")} className="btn btn-secondary btn-sm mt-4">
              Clear Search
            </button>
          ) : (
            <button onClick={openAddModal} className="btn btn-primary btn-sm mt-4">
              Add Category
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table (>=768px) */}
          <div className="admin-card hidden md:block overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Hindi Name</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Assigned Products</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category._id || category.name}>
                      <td className="font-semibold text-[var(--color-text)]">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-primary)] border border-[var(--color-border)]">
                            <Icon name="tag" size={14} />
                          </span>
                          <span>{category.name}</span>
                        </div>
                      </td>
                      <td className="text-[var(--color-text-muted)] font-medium">
                        {category.nameHindi || "—"}
                      </td>
                      <td>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                          {category.slug}
                        </span>
                      </td>
                      <td className="max-w-[240px] truncate text-xs text-[var(--color-text-muted)]">
                        {category.description || "—"}
                      </td>
                      <td>
                        <Link
                          href={`/admin/products`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                          title="View products in this category"
                        >
                          <Icon name="package" size={12} />
                          <span>{category.productCount || 0} product{(category.productCount || 0) !== 1 ? "s" : ""}</span>
                        </Link>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleCategoryActive(category)}
                          className={`badge cursor-pointer transition-colors ${
                            category.active !== false ? "badge-green" : "badge-gray"
                          }`}
                          title="Click to toggle status"
                        >
                          {category.active !== false ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(category)}
                            className="btn btn-sm btn-secondary p-1.5"
                            title="Edit Category"
                          >
                            <Icon name="edit-2" size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModal(category)}
                            className="btn btn-sm btn-danger p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            title="Delete Category"
                          >
                            <Icon name="trash-2" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View (<768px) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredCategories.map((category) => (
              <div key={category._id || category.name} className="admin-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[var(--color-surface-2)] text-[var(--color-primary)] border border-[var(--color-border)]">
                      <Icon name="tag" size={16} />
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-[var(--color-text)] leading-tight">
                        {category.name}
                      </h3>
                      {category.nameHindi && (
                        <p className="text-xs text-[var(--color-text-muted)] font-medium mt-0.5">
                          {category.nameHindi}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCategoryActive(category)}
                    className={`badge cursor-pointer ${category.active !== false ? "badge-green" : "badge-gray"}`}
                  >
                    {category.active !== false ? "Active" : "Inactive"}
                  </button>
                </div>

                {category.description && (
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--color-border)]">
                  <span className="font-mono text-[11px] text-[var(--color-text-dim)]">
                    slug: {category.slug}
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {category.productCount || 0} products
                  </span>
                </div>

                {/* Mobile Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(category)}
                    className="btn btn-sm btn-secondary w-full justify-center h-10"
                  >
                    <Icon name="edit-2" size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteModal(category)}
                    className="btn btn-sm btn-danger w-full justify-center h-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Icon name="trash-2" size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        open={!!modalMode}
        onClose={closeModal}
        title={modalMode === "add" ? "Add New Category" : "Edit Category"}
        maxWidth={500}
      >
        {formError && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Category Name (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Spices, Millets, Herbal Teas"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="admin-input h-11"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Hindi Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. मसाले, मिलेट्स"
              value={formData.nameHindi}
              onChange={(e) => setFormData({ ...formData, nameHindi: e.target.value })}
              className="admin-input h-11"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of products in this category..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="admin-input resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
                className="admin-input h-11"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer h-11">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600"
                  disabled={isSubmitting}
                />
                <span className="text-xs font-semibold text-[var(--color-text)]">Active</span>
              </label>
            </div>
          </div>

          {modalMode === "edit" && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              ℹ️ If you change the category name, all products assigned to "{activeCategory?.name}" will automatically be updated.
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="btn btn-secondary text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary text-xs sm:text-sm inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{modalMode === "add" ? "Create Category" : "Save Changes"}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Category"
        maxWidth={440}
      >
        {deleteModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <Icon name="alert-triangle" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-base text-[var(--color-text)]">Delete Category</h4>
                <p className="text-xs text-[var(--color-text-muted)]">Category: "{deleteModal.name}"</p>
              </div>
            </div>

            {deleteModal.productCount > 0 ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-2">
                <p className="font-bold">⚠️ Cannot Delete Category</p>
                <p>
                  There are currently <strong>{deleteModal.productCount}</strong> product(s) assigned to this category.
                  To protect store catalog integrity, please reassign or delete these products before deleting this category.
                </p>
                <Link
                  href="/admin/products"
                  className="btn btn-sm btn-secondary mt-2 inline-flex"
                >
                  View Products in Catalog
                </Link>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                Are you sure you want to delete the category <strong>"{deleteModal.name}"</strong>? This action cannot be undone.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={isSubmitting}
                className="btn btn-secondary text-xs sm:text-sm"
              >
                Cancel
              </button>
              {deleteModal.productCount === 0 && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="btn btn-danger text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white"
                >
                  {isSubmitting ? "Deleting..." : "Confirm Delete"}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
