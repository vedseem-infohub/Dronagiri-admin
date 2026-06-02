"use client";

import { useState, useRef } from "react";
import Icon from "./Icon";
import { CATEGORIES } from "../lib/mockData";

const emptyVariant = { size: "", price: "" };

// Reusable image upload zone
function ImageUploadZone({ label, image, onImage, hint }) {
  const fileRef = useRef();
  const [dragging, setDragging] = useState(false);

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onImage(e.target.result);
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div className="mb-4">
      <span className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">{label}</span>

      {image ? (
        /* Preview */
        <div className="relative inline-block">
          <img
            src={image}
            alt="preview"
            className="w-full max-w-[280px] h-40 object-cover rounded-xl border-2 border-border"
          />
          <div className="absolute top-1.5 right-1.5 flex gap-1.5">
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              className="bg-white/92 border border-border rounded-md px-2.5 py-1 text-[11px] font-semibold text-text cursor-pointer flex items-center gap-1 hover:bg-white"
            >
              <Icon name="edit-2" size={11} className="mr-1" /> Change
            </button>
            <button
              type="button"
              onClick={() => onImage(null)}
              className="bg-red-600/90 border-none rounded-md p-1.5 text-white cursor-pointer hover:bg-red-600 flex items-center justify-center"
            >
              <Icon name="x" size={11} />
            </button>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
          className={`border-2 border-dashed rounded-xl py-6 px-4 text-center cursor-pointer transition-all duration-200 ${
            dragging ? "border-primary bg-green-50/50" : "border-border bg-surface-2 hover:bg-surface-3"
          }`}
        >
          <div className="flex justify-center mb-2">
            <Icon name="image" size={28} className="text-text-dim" />
          </div>
          <p className={`text-xs font-semibold mb-1 ${dragging ? "text-primary" : "text-text-muted"}`}>
            {dragging ? "Drop to upload" : "Click or drag to upload"}
          </p>
          <p className="text-[11px] text-text-dim">{hint || "PNG, JPG, WEBP · Max 5MB"}</p>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}

export default function ProductForm({ initial, onSave, onCancel }) {
  const isEdit = !!initial;

  const [form, setForm] = useState(initial || {
    name: "", nameHindi: "", category: CATEGORIES[0],
    description: "", variants: [{ ...emptyVariant }],
    stock: 0, active: true,
    imageUrl: null,
    imageUrl2: null,
  });
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  function updateVariant(idx, field, value) {
    setForm(f => {
      const variants = [...f.variants];
      variants[idx] = { ...variants[idx], [field]: value };
      return { ...f, variants };
    });
  }

  function addVariant() {
    setForm(f => ({ ...f, variants: [...f.variants, { ...emptyVariant }] }));
  }

  function removeVariant(idx) {
    setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (form.variants.length === 0) e.variants = "At least one variant required";
    form.variants.forEach((v, i) => {
      if (!v.size.trim()) e[`v_size_${i}`] = "Required";
      if (!v.price || isNaN(v.price)) e[`v_price_${i}`] = "Required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...form,
      stock: Number(form.stock) || 0,
      variants: form.variants.map(v => ({ size: v.size, price: Number(v.price) })),
    });
  }

  const inp = { className: "admin-input mb-1" };
  const fieldLabel = (text, required) => (
    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
      {text}{required && <span className="text-danger ml-0.5">*</span>}
    </label>
  );
  const errMsg = (key) => errors[key]
    ? <span className="text-[11px] text-danger">{errors[key]}</span>
    : null;

  return (
    <form onSubmit={handleSubmit}>
      {/* ── Names ── */}
      <div className="grid grid-cols-2 gap-x-4">
        <div className="mb-4">
          {fieldLabel("Product Name", true)}
          <input {...inp} value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Haldi Powder" />
          {errMsg("name")}
        </div>
        <div className="mb-4">
          {fieldLabel("Hindi Name")}
          <input {...inp} value={form.nameHindi} onChange={e => update("nameHindi", e.target.value)} placeholder="e.g. हल्दी पाउडर" />
        </div>
      </div>

      {/* ── Category ── */}
      <div className="mb-4">
        {fieldLabel("Category", true)}
        <select {...inp} className="admin-input admin-select mb-1" value={form.category} onChange={e => update("category", e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* ── Description ── */}
      <div className="mb-4">
        {fieldLabel("Description", true)}
        <textarea
          rows={2}
          value={form.description}
          onChange={e => update("description", e.target.value)}
          placeholder="Short product description..."
          className="admin-input mb-1 resize-y"
        />
        {errMsg("description")}
      </div>

      {/* ── Images ── */}
      {isEdit ? (
        /* Edit: show both image slots */
        <div className="grid grid-cols-2 gap-x-4">
          <ImageUploadZone
            label="Product Image"
            image={form.imageUrl}
            onImage={(v) => update("imageUrl", v)}
            hint="Main product image"
          />
        </div>
      ) : (
        /* Add: single image slot */
        <ImageUploadZone
          label="Product Image"
          image={form.imageUrl}
          onImage={(v) => update("imageUrl", v)}
          hint="PNG, JPG, WEBP · Max 5MB"
        />
      )}

      {/* ── Variants ── */}
      <div className="mb-4">
        {fieldLabel("Variants (Size & Price)", true)}
        {errors.variants && <div className="text-[11px] text-danger mb-1.5">{errors.variants}</div>}
        <div className="flex flex-col gap-2">
          {form.variants.map((v, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  className="admin-input"
                  value={v.size}
                  onChange={e => updateVariant(i, "size", e.target.value)}
                  placeholder="Size (e.g. 500g)"
                />
                {errMsg(`v_size_${i}`)}
              </div>
              <div className="flex-1">
                <input
                  className="admin-input"
                  type="number"
                  value={v.price}
                  onChange={e => updateVariant(i, "price", e.target.value)}
                  placeholder="Price (₹)"
                />
                {errMsg(`v_price_${i}`)}
              </div>
              {form.variants.length > 1 && (
                <button type="button" className="btn btn-icon btn-danger mt-0.5" onClick={() => removeVariant(i)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-secondary btn-sm mt-2" onClick={addVariant}>
          + Add Variant
        </button>
      </div>

      {/* ── Stock & Status ── */}
      <div className="grid grid-cols-2 gap-x-4 mb-5">
        <div>
          {fieldLabel("Stock Quantity")}
          <input className="admin-input mb-1" type="number" min="0" value={form.stock} onChange={e => update("stock", e.target.value)} placeholder="0" />
        </div>
        <div>
          {fieldLabel("Status")}
          <div className="flex gap-2 mt-1">
            {[true, false].map(v => (
              <button
                key={String(v)}
                type="button"
                onClick={() => update("active", v)}
                className={`btn btn-sm flex-1 ${
                  form.active === v
                    ? v
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-red-100 text-red-600 border border-red-300"
                    : "bg-surface-2 text-text-muted border border-border"
                }`}
              >
                {v ? <><Icon name="check" size={12} className="mr-1" /> Active</> : <><Icon name="x" size={12} className="mr-1" /> Inactive</>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-2.5 justify-end pt-1 border-t border-border">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary gap-1">
          {isEdit ? (
            <>
              <Icon name="save" size={14} />
              Save Changes
            </>
          ) : (
            <>
              <Icon name="check" size={14} />
              Add Product
            </>
          )}
        </button>
      </div>
    </form>
  );
}
