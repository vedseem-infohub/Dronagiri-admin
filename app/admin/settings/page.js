"use client";

import { useState, useEffect } from "react";
import Icon from "../components/Icon";
import ImageUploadZone from "../components/ImageUploadZone";
import { adminFetch } from "../lib/auth";

const SECTIONS = [
  { id: "hero", label: "Home Hero Banners", icon: "layout" },
  { id: "productsHero", label: "Products Page Hero", icon: "package" },
  { id: "aboutHero", label: "About Page Hero", icon: "info" },
  { id: "founders", label: "Founders & Team", icon: "users" },
  { id: "branding", label: "Branding & Social", icon: "tag" },
  { id: "store", label: "Store Info", icon: "settings" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const backendUrl =
    process.env.NEXT_PUBLIC_API_BACKEND_URL ||
    process.env.NEXT_API_BACKEND_URL ||
    "http://localhost:8000";

  // Site Settings State
  const [settings, setSettings] = useState({
    logoUrl: "/logo2.png",
    whatsappNumber: "+91 99999 99999",
    phoneNumber: "+91 99999 99999",
    address: "Dronagiri, Maharashtra, India",
    instagramUrl:
      "https://www.instagram.com/dronagiri_farms?stkn=MW56NTE5dWZ0ZWhreg%3D%3D&utm_source=qr",
    youtubeUrl: "https://youtube.com/@thenitesh1989?si=ujvjHrIab8OhW2VG",
    heroSlides: [],
    founders: [],
    productsHero: {
      image: "/Artboard 2.png",
      badge: "Dronagiri Farm Products",
      heading: "Farm-Fresh Products",
      paragraph:
        "Pure grains, pulses, spices, oils, and natural staples sourced directly from our farm.",
    },
    aboutHero: {
      image: "/about-hero.jpg",
      badge: "Est. 2018 · Dronagiri Farm",
      heading: "Bringing Pure Organic Goodness From Farm To Your Family",
      paragraph:
        "From the fertile fields of Dronagiri to your dining table — we nurture every seed with love, tradition, and unwavering commitment to purity.",
    },
  });

  // Modal / Editing State for Slides & Founders
  const [editingSlideIndex, setEditingSlideIndex] = useState(null);
  const [slideForm, setSlideForm] = useState(null);

  const [editingFounderIndex, setEditingFounderIndex] = useState(null);
  const [founderForm, setFounderForm] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await adminFetch(`${backendUrl}/api/settings`);
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings({
          ...data.settings,
          productsHero: data.settings.productsHero || {
            image: "/Artboard 2.png",
            badge: "Dronagiri Farm Products",
            heading: "Farm-Fresh Products",
            paragraph:
              "Pure grains, pulses, spices, oils, and natural staples sourced directly from our farm.",
          },
          aboutHero: data.settings.aboutHero || {
            image: "/about-hero.jpg",
            badge: "Est. 2018 · Dronagiri Farm",
            heading: "Bringing Pure Organic Goodness From Farm To Your Family",
            paragraph:
              "From the fertile fields of Dronagiri to your dining table — we nurture every seed with love, tradition, and unwavering commitment to purity.",
          },
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setErrorMessage("Could not load current settings. Check backend connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings(payload = settings) {
    setSaving(true);
    setSavedMessage("");
    setErrorMessage("");

    try {
      const res = await adminFetch(`${backendUrl}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setSavedMessage("Settings & Cloudinary images saved successfully!");
        setTimeout(() => setSavedMessage(""), 4000);
      } else {
        setErrorMessage(data.message || "Failed to save settings.");
      }
    } catch (err) {
      console.error("Save error:", err);
      setErrorMessage(err.message || "Error communicating with server.");
    } finally {
      setSaving(false);
    }
  }

  // --- Hero Slides Helpers ---
  function openNewSlideModal() {
    setSlideForm({
      image: "",
      badge: "100% Natural & Organic",
      title1: "Dronagiri",
      title2: "Farm",
      tagline: "From our fields to your kitchen — pure, unprocessed, farm-fresh goodness.",
      primaryCtaText: "🛒 Shop Products",
      primaryCtaLink: "/products",
      secondaryCtaText: "Our Story ↓",
      secondaryCtaLink: "/about",
    });
    setEditingSlideIndex(-1);
  }

  function openEditSlideModal(index) {
    setSlideForm({ ...settings.heroSlides[index] });
    setEditingSlideIndex(index);
  }

  function saveSlideModal() {
    if (!slideForm.image) {
      alert("Please provide or upload a banner image.");
      return;
    }
    const updatedSlides = [...settings.heroSlides];
    if (editingSlideIndex === -1) {
      updatedSlides.push(slideForm);
    } else {
      updatedSlides[editingSlideIndex] = slideForm;
    }
    const nextSettings = { ...settings, heroSlides: updatedSlides };
    setSettings(nextSettings);
    setEditingSlideIndex(null);
    setSlideForm(null);
    handleSaveSettings(nextSettings);
  }

  function deleteSlide(index) {
    if (!confirm("Are you sure you want to delete this hero slide?")) return;
    const updatedSlides = settings.heroSlides.filter((_, i) => i !== index);
    const nextSettings = { ...settings, heroSlides: updatedSlides };
    setSettings(nextSettings);
    handleSaveSettings(nextSettings);
  }

  // --- Founders Helpers ---
  function openNewFounderModal() {
    setFounderForm({
      name: "",
      role: "Co-Founder",
      title: "Co-Founder, Dronagiri Farms",
      qualification: "",
      location: "",
      image: "",
      paragraphs: "",
      quote: "",
      youtubeUrl: "",
      instagramUrl: "https://www.instagram.com/dronagiri_farms",
    });
    setEditingFounderIndex(-1);
  }

  function openEditFounderModal(index) {
    const f = settings.founders[index];
    setFounderForm({
      ...f,
      paragraphs: Array.isArray(f.paragraphs) ? f.paragraphs.join("\n\n") : (f.paragraphs || ""),
    });
    setEditingFounderIndex(index);
  }

  function saveFounderModal() {
    if (!founderForm.name.trim()) {
      alert("Please enter the founder's name.");
      return;
    }
    const paras = typeof founderForm.paragraphs === "string"
      ? founderForm.paragraphs.split("\n\n").map((p) => p.trim()).filter(Boolean)
      : founderForm.paragraphs;

    const formattedFounder = {
      ...founderForm,
      paragraphs: paras,
    };

    const updatedFounders = [...settings.founders];
    if (editingFounderIndex === -1) {
      updatedFounders.push(formattedFounder);
    } else {
      updatedFounders[editingFounderIndex] = formattedFounder;
    }
    const nextSettings = { ...settings, founders: updatedFounders };
    setSettings(nextSettings);
    setEditingFounderIndex(null);
    setFounderForm(null);
    handleSaveSettings(nextSettings);
  }

  function deleteFounder(index) {
    if (!confirm("Are you sure you want to remove this founder?")) return;
    const updatedFounders = settings.founders.filter((_, i) => i !== index);
    const nextSettings = { ...settings, founders: updatedFounders };
    setSettings(nextSettings);
    handleSaveSettings(nextSettings);
  }

  if (loading) {
    return (
      <div className="admin-card p-12 text-center text-text-muted">
        <Icon name="sprout" size={24} className="animate-spin inline-block mb-3 text-primary" />
        <p className="text-sm">Loading website settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Alert Messages */}
      {savedMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-sm shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <Icon name="check" size={16} className="text-emerald-600" />
            <span className="font-semibold">{savedMessage}</span>
          </div>
          <button onClick={() => setSavedMessage("")} className="text-emerald-600 hover:text-emerald-900">
            <Icon name="x" size={14} />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center justify-between text-sm shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <Icon name="alert-triangle" size={16} className="text-rose-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")} className="text-rose-600 hover:text-rose-900">
            <Icon name="x" size={14} />
          </button>
        </div>
      )}

      {/* Main Grid Layout: Tabs Navigation + Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 items-start">
        {/* Tab Sidebar */}
        <div className="admin-card p-3 space-y-1">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveTab(sec.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                activeTab === sec.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:bg-bg hover:text-text"
              }`}
            >
              <Icon name={sec.icon} size={16} />
              <span>{sec.label}</span>
            </button>
          ))}

          <div className="pt-3 mt-3 border-t border-border">
            <button
              onClick={() => handleSaveSettings()}
              disabled={saving}
              className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-emerald-600 hover:to-primary text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Icon name="save" size={14} />
              <span>{saving ? "Saving to Cloud..." : "Save All Changes"}</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="admin-card p-6">
          {/* =========================================================================
              TAB 1: HERO SLIDES & BANNERS
             ========================================================================= */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-text">Hero Banners & Headlines</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Manage the main homepage carousel slides. Images are uploaded to Cloudinary.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewSlideModal}
                  className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Icon name="plus" size={14} /> Add New Slide
                </button>
              </div>

              {/* Slides Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {settings.heroSlides.map((slide, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-2xl overflow-hidden bg-bg/40 flex flex-col group hover:shadow-md transition-all"
                  >
                    <div className="relative h-44 bg-gray-100 overflow-hidden">
                      <img
                        src={slide.image}
                        alt={slide.title1}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                        {slide.badge || "Slide #" + (index + 1)}
                      </span>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h4 className="font-bold text-text text-base">
                        {slide.title1} <span className="text-primary">{slide.title2}</span>
                      </h4>
                      <p className="text-xs text-text-muted line-clamp-2 mt-1.5 flex-1 leading-relaxed">
                        {slide.tagline}
                      </p>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/80">
                        <span className="text-[11px] font-medium text-text-muted">
                          CTA: {slide.primaryCtaText}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditSlideModal(index)}
                            className="p-1.5 hover:bg-white rounded-lg text-text-muted hover:text-primary transition-colors border border-transparent hover:border-border"
                            title="Edit Slide"
                          >
                            <Icon name="edit-2" size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSlide(index)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-text-muted hover:text-rose-600 transition-colors border border-transparent hover:border-rose-200"
                            title="Delete Slide"
                          >
                            <Icon name="trash-2" size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: PRODUCTS PAGE HERO
             ========================================================================= */}
          {activeTab === "productsHero" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-text">Products Page Hero Header</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Customize the background banner image, badge, heading, and paragraph shown on the Products catalog page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveSettings()}
                  disabled={saving}
                  className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <Icon name="save" size={14} />
                  <span>{saving ? "Saving..." : "Save Products Hero"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Image Upload & Preview (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <ImageUploadZone
                    label="Products Page Banner Image"
                    image={settings.productsHero?.image}
                    aspect="video"
                    hint="Uploaded directly to Cloudinary. 1920x1080 recommended."
                    onImage={(newImg) =>
                      setSettings((prev) => ({
                        ...prev,
                        productsHero: {
                          ...(prev.productsHero || {}),
                          image: newImg,
                        },
                      }))
                    }
                  />

                  {/* Live Simulation Card */}
                  <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-3.5 py-2 bg-bg/80 border-b border-border flex items-center justify-between">
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        Live Preview (Simulation)
                      </span>
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                        /products
                      </span>
                    </div>
                    <div className="relative h-44 bg-[#203515] flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                      {settings.productsHero?.image && (
                        <img
                          src={settings.productsHero.image}
                          alt="Banner Preview"
                          className="absolute inset-0 w-full h-full object-cover opacity-40"
                        />
                      )}
                      <div className="relative z-10 space-y-1.5 max-w-xs">
                        <span className="inline-block bg-white/20 text-[#F7F1E8] text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border border-white/30 backdrop-blur-sm">
                          {settings.productsHero?.badge || "Dronagiri Farm Products"}
                        </span>
                        <h4 className="text-white font-bold text-lg leading-tight drop-shadow-sm font-serif">
                          {settings.productsHero?.heading || "Farm-Fresh Products"}
                        </h4>
                        <p className="text-white/80 text-[11px] line-clamp-2 leading-relaxed font-light">
                          {settings.productsHero?.paragraph ||
                            "Pure grains, pulses, spices, oils, and natural staples."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Text Content Form (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                      Badge / Eyebrow Text
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g., Dronagiri Farm Products"
                      value={settings.productsHero?.badge || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          productsHero: {
                            ...(prev.productsHero || {}),
                            badge: e.target.value,
                          },
                        }))
                      }
                    />
                    <p className="text-[11px] text-text-muted mt-1">
                      Pill badge shown directly above the main heading.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                      Main Heading (H1)
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g., All Farm-Fresh Products"
                      value={settings.productsHero?.heading || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          productsHero: {
                            ...(prev.productsHero || {}),
                            heading: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                      Paragraph / Subtitle Description
                    </label>
                    <textarea
                      rows={4}
                      className="admin-input resize-none leading-relaxed"
                      placeholder="Enter description text..."
                      value={settings.productsHero?.paragraph || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          productsHero: {
                            ...(prev.productsHero || {}),
                            paragraph: e.target.value,
                          },
                        }))
                      }
                    />
                    <p className="text-[11px] text-text-muted mt-1">
                      Displayed below the heading on the products exploration page.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleSaveSettings()}
                      disabled={saving}
                      className="bg-primary hover:bg-primary-dark text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Icon name="save" size={14} />
                      <span>{saving ? "Saving..." : "Save Products Page Settings"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: ABOUT US PAGE HERO
             ========================================================================= */}
          {activeTab === "aboutHero" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-text">About Page Hero Header</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Customize the background image, badge, main title, and introductory story paragraph on the About Us page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveSettings()}
                  disabled={saving}
                  className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <Icon name="save" size={14} />
                  <span>{saving ? "Saving..." : "Save About Hero"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Image Upload & Preview (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <ImageUploadZone
                    label="About Page Background Image"
                    image={settings.aboutHero?.image}
                    aspect="video"
                    hint="Uploaded directly to Cloudinary. Golden hour / farm landscape looks best."
                    onImage={(newImg) =>
                      setSettings((prev) => ({
                        ...prev,
                        aboutHero: {
                          ...(prev.aboutHero || {}),
                          image: newImg,
                        },
                      }))
                    }
                  />

                  {/* Live Simulation Card */}
                  <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-3.5 py-2 bg-bg/80 border-b border-border flex items-center justify-between">
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        Live Preview (Simulation)
                      </span>
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                        /about
                      </span>
                    </div>
                    <div className="relative h-44 bg-[#223614] flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                      {settings.aboutHero?.image && (
                        <img
                          src={settings.aboutHero.image}
                          alt="About Hero Preview"
                          className="absolute inset-0 w-full h-full object-cover opacity-35"
                        />
                      )}
                      <div className="relative z-10 space-y-1.5 max-w-xs">
                        <span className="inline-block bg-white/20 text-[#F7F1E8] text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border border-white/30 backdrop-blur-sm">
                          {settings.aboutHero?.badge || "Est. 2018 · Dronagiri Farm"}
                        </span>
                        <h4 className="text-amber-300 font-bold text-base leading-tight drop-shadow-sm font-serif">
                          {settings.aboutHero?.heading || "Bringing Pure Organic Goodness"}
                        </h4>
                        <p className="text-white/80 text-[11px] line-clamp-2 leading-relaxed font-light">
                          {settings.aboutHero?.paragraph ||
                            "From the fertile fields of Dronagiri to your dining table..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Text Content Form (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                      Badge / Tagline
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g., Est. 2018 · Dronagiri Farm"
                      value={settings.aboutHero?.badge || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          aboutHero: {
                            ...(prev.aboutHero || {}),
                            badge: e.target.value,
                          },
                        }))
                      }
                    />
                    <p className="text-[11px] text-text-muted mt-1">
                      Pill badge shown directly above the main heading.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                      Main Heading
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g., Bringing Pure Organic Goodness From Farm To Your Family"
                      value={settings.aboutHero?.heading || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          aboutHero: {
                            ...(prev.aboutHero || {}),
                            heading: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                      Introductory Story Paragraph
                    </label>
                    <textarea
                      rows={4}
                      className="admin-input resize-none leading-relaxed"
                      placeholder="Enter introductory story text..."
                      value={settings.aboutHero?.paragraph || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          aboutHero: {
                            ...(prev.aboutHero || {}),
                            paragraph: e.target.value,
                          },
                        }))
                      }
                    />
                    <p className="text-[11px] text-text-muted mt-1">
                      Lead paragraph displayed below the heading on the About page.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleSaveSettings()}
                      disabled={saving}
                      className="bg-primary hover:bg-primary-dark text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Icon name="save" size={14} />
                      <span>{saving ? "Saving..." : "Save About Page Settings"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: FOUNDERS & LEADERSHIP
             ========================================================================= */}
          {activeTab === "founders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-text">Founders & Leadership Team</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Manage the About page founders cards, portraits, qualifications, bios, and quotes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewFounderModal}
                  className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Icon name="plus" size={14} /> Add Founder
                </button>
              </div>

              {/* Founders List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {settings.founders.map((founder, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-2xl overflow-hidden bg-bg/40 flex flex-col group hover:shadow-md transition-all"
                  >
                    <div className="relative h-56 bg-gray-100 overflow-hidden">
                      <img
                        src={founder.image}
                        alt={founder.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {founder.role}
                      </span>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h4 className="font-bold text-text text-base">{founder.name}</h4>
                      <p className="text-xs text-primary font-semibold mt-0.5">
                        {founder.qualification || founder.title}
                      </p>
                      {founder.location && (
                        <p className="text-[11px] text-text-muted flex items-center gap-1 mt-1">
                          <Icon name="map-pin" size={11} /> {founder.location}
                        </p>
                      )}

                      <div className="mt-2.5 text-xs text-text-muted line-clamp-3 leading-relaxed flex-1">
                        {Array.isArray(founder.paragraphs)
                          ? founder.paragraphs[0]
                          : founder.paragraphs}
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/80">
                        <span className="text-[11px] text-text-muted font-medium italic truncate max-w-[150px]">
                          {founder.quote || "No quote"}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditFounderModal(index)}
                            className="p-1.5 hover:bg-white rounded-lg text-text-muted hover:text-primary transition-colors border border-transparent hover:border-border"
                            title="Edit Founder"
                          >
                            <Icon name="edit-2" size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteFounder(index)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-text-muted hover:text-rose-600 transition-colors border border-transparent hover:border-rose-200"
                            title="Remove Founder"
                          >
                            <Icon name="trash-2" size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: BRANDING & SOCIAL LINKS
             ========================================================================= */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-text">Logo & Social Media Links</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Update the official store logo, WhatsApp order line, and social media channels.
                </p>
              </div>

              {/* Logo Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                  <ImageUploadZone
                    label="Store Official Logo"
                    image={settings.logoUrl}
                    aspect="square"
                    hint="Transparent PNG or SVG recommended"
                    onImage={(newLogo) =>
                      setSettings((prev) => ({ ...prev, logoUrl: newLogo }))
                    }
                  />
                  <p className="text-[11px] text-text-muted -mt-2">
                    Used across the Navigation header, invoice prints, and footer.
                  </p>
                </div>

                {/* Contact & Socials Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                      WhatsApp Orders & Support Number
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="+91 99999 99999"
                      value={settings.whatsappNumber}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          whatsappNumber: e.target.value,
                        }))
                      }
                    />
                    <p className="text-[11px] text-text-muted mt-1">
                      Customers will chat with this number when clicking WhatsApp order buttons.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                      Support Phone Number
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="+91 99999 99999"
                      value={settings.phoneNumber}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          phoneNumber: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                      Instagram Profile URL
                    </label>
                    <input
                      type="url"
                      className="admin-input"
                      placeholder="https://instagram.com/dronagiri_farms"
                      value={settings.instagramUrl}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          instagramUrl: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                      YouTube Channel URL
                    </label>
                    <input
                      type="url"
                      className="admin-input"
                      placeholder="https://youtube.com/@thenitesh1989"
                      value={settings.youtubeUrl}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          youtubeUrl: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                      Farm / Operational Address
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Dronagiri, Maharashtra, India"
                      value={settings.address}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => handleSaveSettings()}
                      disabled={saving}
                      className="bg-primary hover:bg-primary-dark text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all"
                    >
                      {saving ? "Saving to Cloudinary..." : "Save Branding & Social Links"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: STORE INFO
             ========================================================================= */}
          {activeTab === "store" && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-text">General Store Configuration</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Core farm details and location settings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                    Store Name
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    defaultValue="Dronagiri Farms"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                    Tagline
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    defaultValue="Pure Farm-Fresh Organic Products"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                    Support Email
                  </label>
                  <input
                    type="email"
                    className="admin-input"
                    defaultValue="support@dronagirifarms.co.in"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                    Website URL
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    defaultValue="https://dronagirifarms.co.in"
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL: EDIT / ADD HERO SLIDE
         ========================================================================= */}
      {slideForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-text">
                {editingSlideIndex === -1 ? "Add Hero Slide" : "Edit Hero Slide"}
              </h3>
              <button
                type="button"
                onClick={() => setSlideForm(null)}
                className="p-1.5 hover:bg-bg rounded-lg text-text-muted hover:text-text"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <ImageUploadZone
              label="Banner Image (Uploaded to Cloudinary)"
              image={slideForm.image}
              aspect="video"
              hint="High resolution wide landscape image (1920x1080 recommended)"
              onImage={(img) => setSlideForm((f) => ({ ...f, image: img }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Title Line 1 (e.g. Dronagiri)
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={slideForm.title1}
                  onChange={(e) =>
                    setSlideForm((f) => ({ ...f, title1: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Title Line 2 (e.g. Farm)
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={slideForm.title2}
                  onChange={(e) =>
                    setSlideForm((f) => ({ ...f, title2: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                Badge Tag (e.g. 100% Natural & Organic)
              </label>
              <input
                type="text"
                className="admin-input"
                value={slideForm.badge}
                onChange={(e) =>
                  setSlideForm((f) => ({ ...f, badge: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                Paragraph Description / Tagline
              </label>
              <textarea
                className="admin-input resize-y"
                rows={3}
                value={slideForm.tagline}
                onChange={(e) =>
                  setSlideForm((f) => ({ ...f, tagline: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={slideForm.primaryCtaText}
                  onChange={(e) =>
                    setSlideForm((f) => ({ ...f, primaryCtaText: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Primary Button Link
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={slideForm.primaryCtaLink}
                  onChange={(e) =>
                    setSlideForm((f) => ({ ...f, primaryCtaLink: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setSlideForm(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:bg-bg border border-border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveSlideModal}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-dark text-white shadow-sm"
              >
                {saving ? "Uploading..." : "Save Slide"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT / ADD FOUNDER
         ========================================================================= */}
      {founderForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-text">
                {editingFounderIndex === -1 ? "Add Founder" : "Edit Founder Details"}
              </h3>
              <button
                type="button"
                onClick={() => setFounderForm(null)}
                className="p-1.5 hover:bg-bg rounded-lg text-text-muted hover:text-text"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <ImageUploadZone
              label="Portrait Photo (Uploaded to Cloudinary)"
              image={founderForm.image}
              aspect="portrait"
              hint="High quality vertical portrait photo"
              onImage={(img) => setFounderForm((f) => ({ ...f, image: img }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Nitesh Bhasney"
                  value={founderForm.name}
                  onChange={(e) =>
                    setFounderForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Role
                </label>
                <select
                  className="admin-input"
                  value={founderForm.role}
                  onChange={(e) =>
                    setFounderForm((f) => ({ ...f, role: e.target.value }))
                  }
                >
                  <option value="Founder">Founder</option>
                  <option value="Co-Founder">Co-Founder</option>
                  <option value="Director">Director</option>
                  <option value="Head Farmer">Head Farmer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Qualification / Subtitle
                </label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Civil Engineer & Farmer"
                  value={founderForm.qualification}
                  onChange={(e) =>
                    setFounderForm((f) => ({ ...f, qualification: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Location
                </label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Based in Noida"
                  value={founderForm.location}
                  onChange={(e) =>
                    setFounderForm((f) => ({ ...f, location: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                Bio Paragraphs (Separate each paragraph with an empty line)
              </label>
              <textarea
                className="admin-input resize-y"
                rows={5}
                placeholder="Write paragraph 1...&#10;&#10;Write paragraph 2..."
                value={founderForm.paragraphs}
                onChange={(e) =>
                  setFounderForm((f) => ({ ...f, paragraphs: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                Personal Quote / Motto
              </label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. “Empowering Farmers. Strengthening Communities.”"
                value={founderForm.quote}
                onChange={(e) =>
                  setFounderForm((f) => ({ ...f, quote: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  YouTube Channel URL (Optional)
                </label>
                <input
                  type="url"
                  className="admin-input"
                  placeholder="https://youtube.com/@..."
                  value={founderForm.youtubeUrl}
                  onChange={(e) =>
                    setFounderForm((f) => ({ ...f, youtubeUrl: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Instagram URL (Optional)
                </label>
                <input
                  type="url"
                  className="admin-input"
                  placeholder="https://instagram.com/..."
                  value={founderForm.instagramUrl}
                  onChange={(e) =>
                    setFounderForm((f) => ({ ...f, instagramUrl: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setFounderForm(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:bg-bg border border-border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveFounderModal}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-dark text-white shadow-sm"
              >
                {saving ? "Uploading..." : "Save Founder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
