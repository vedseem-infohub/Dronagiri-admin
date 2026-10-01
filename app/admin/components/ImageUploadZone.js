"use client";

import { useState, useRef } from "react";
import Icon from "./Icon";

export default function ImageUploadZone({
  label,
  image,
  onImage,
  hint,
  aspect = "video", // "video" (banner), "portrait" (founder), "square" (logo)
}) {
  const fileRef = useRef(null);
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
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  const aspectClass =
    aspect === "portrait"
      ? "w-44 h-56"
      : aspect === "square"
      ? "w-32 h-32"
      : "w-full max-w-[380px] h-44";

  return (
    <div className="mb-4">
      {label && (
        <span className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
          {label}
        </span>
      )}

      {image ? (
        <div className="relative inline-block group">
          <img
            src={image}
            alt="preview"
            className={`${aspectClass} object-cover rounded-2xl border-2 border-border shadow-sm`}
          />
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="bg-white/95 border border-border rounded-lg px-2.5 py-1 text-xs font-semibold text-text cursor-pointer flex items-center gap-1 hover:bg-white shadow-sm"
            >
              <Icon name="edit-2" size={12} /> Change
            </button>
            <button
              type="button"
              onClick={() => onImage("")}
              className="bg-red-600 border-none rounded-lg p-1.5 text-white cursor-pointer hover:bg-red-700 flex items-center justify-center shadow-sm"
              title="Remove image"
            >
              <Icon name="x" size={12} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${aspectClass} flex flex-col items-center justify-center ${
            dragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-bg/40"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
            <Icon name="upload" size={18} />
          </div>
          <p className="text-xs font-semibold text-text mb-0.5">
            {dragging ? "Drop to upload" : "Click or drag image"}
          </p>
          <p className="text-[11px] text-text-muted">
            {hint || "PNG, JPG, WebP up to 10MB"}
          </p>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}
