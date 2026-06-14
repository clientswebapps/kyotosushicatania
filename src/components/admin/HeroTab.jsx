import { useState } from "react";
import { motion } from "framer-motion";
import {
  useCollection,
  useUpdateDocument,
  useDeleteDocument,
  useAddDocument,
} from "../../hooks/useFirestore";
import { PlusCircle, Check, X, ChevronUp, ChevronDown, Edit, Trash2 } from "lucide-react";
import { uploadMediaFile } from "../../utils/imageUtils";

export default function HeroTab() {
  const { data: heroSlides, loading: heroLoading } = useCollection("heroSlides", {
    orderByField: "order",
    realtime: true,
  });

  const { updateDocument: updateHeroSlide } = useUpdateDocument("heroSlides");
  const { addDocument: addHeroSlide } = useAddDocument("heroSlides");
  const { deleteDocument: deleteHeroSlide } = useDeleteDocument("heroSlides");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingHeroSlide, setSavingHeroSlide] = useState(false);
  const [editingHeroSlideId, setEditingHeroSlideId] = useState(null);

  const [newHeroSlide, setNewHeroSlide] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    ctaText: "",
    ctaLink: "",
    duration: 5,
    order: 0,
    active: true,
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadMediaFile(file, setUploadingImage);
      setNewHeroSlide((prev) => ({ ...prev, imageUrl: url }));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMoveItem = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= heroSlides.length) return;

    const currentItem = heroSlides[index];
    const swapItem = heroSlides[targetIndex];

    try {
      await updateHeroSlide(currentItem.id, { order: swapItem.order });
      await updateHeroSlide(swapItem.id, { order: currentItem.order });
    } catch (err) {
      console.error("Reorder error:", err);
    }
  };

  const handleAddHeroSlide = async (e) => {
    e.preventDefault();
    setSavingHeroSlide(true);
    try {
      const payload = {
        ...newHeroSlide,
        duration: Number(newHeroSlide.duration) || 5,
      };

      if (editingHeroSlideId) {
        await updateHeroSlide(editingHeroSlideId, payload);
        setEditingHeroSlideId(null);
      } else {
        if (heroSlides && heroSlides.length >= 3) {
          alert("Hero settings are already full (maximum 3 items). You need to remove 1 item to continue.");
          return;
        }
        const minOrder = heroSlides?.length > 0 ? Math.min(...heroSlides.map((s) => s.order || 0)) : 0;
        await addHeroSlide({
          ...payload,
          order: minOrder - 1,
        });
      }
      setNewHeroSlide({
        title: "",
        subtitle: "",
        imageUrl: "",
        ctaText: "",
        ctaLink: "",
        duration: 5,
        order: 0,
        active: true,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingHeroSlide(false);
    }
  };

  const handleStartHeroEdit = (slide) => {
    setEditingHeroSlideId(slide.id);
    setNewHeroSlide({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      imageUrl: slide.imageUrl || "",
      ctaText: slide.ctaText || "",
      ctaLink: slide.ctaLink || "",
      duration: slide.duration || 5,
      order: slide.order || 0,
      active: slide.active !== undefined ? !!slide.active : true,
    });
  };

  const handleHeroSlideDelete = async (id) => {
    if (window.confirm("Delete this hero slide?")) {
      try {
        await deleteHeroSlide(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleHeroSlideToggle = async (id, currentStatus) => {
    try {
      await updateHeroSlide(id, { active: !currentStatus });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      key="hero"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      <div className="admin-menu-header">
        <h2>Hero Carousel Settings</h2>
        <p>Manage the sliding banner on the homepage</p>
      </div>

      <div className="admin-menu-grid">
        <div className="admin-menu-form-container">
          <h2>{editingHeroSlideId ? "Edit Slide" : "Add New Slide"}</h2>
          <form onSubmit={handleAddHeroSlide} className="admin-menu-form">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={newHeroSlide.title}
                onChange={(e) => setNewHeroSlide((p) => ({ ...p, title: e.target.value }))}
                required
                placeholder="Es: Summer Specials"
              />
              <small style={{ color: "var(--color-text-secondary)", fontSize: "11px", marginTop: "4px", display: "block" }}>
                Use double asterisks to highlight text in gold (e.g. <code>Welcome to **Kyō-To**</code>)
              </small>
            </div>
            <div className="form-group">
              <label>Subtitle</label>
              <input
                type="text"
                value={newHeroSlide.subtitle}
                onChange={(e) => setNewHeroSlide((p) => ({ ...p, subtitle: e.target.value }))}
                placeholder="Discover our new dishes..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>CTA Text</label>
                <input
                  type="text"
                  value={newHeroSlide.ctaText}
                  onChange={(e) => setNewHeroSlide((p) => ({ ...p, ctaText: e.target.value }))}
                  placeholder="Es: View Menu"
                />
              </div>
              <div className="form-group">
                <label>Redirect Link (CTA Link)</label>
                <input
                  type="text"
                  value={newHeroSlide.ctaLink}
                  onChange={(e) => setNewHeroSlide((p) => ({ ...p, ctaLink: e.target.value }))}
                  placeholder="Es: /menu"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Slide Duration (Seconds)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={newHeroSlide.duration}
                onChange={(e) => setNewHeroSlide((p) => ({ ...p, duration: Number(e.target.value) }))}
                placeholder="5"
              />
            </div>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Media (Image/Video URL or Upload) *</label>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="text"
                  value={newHeroSlide.imageUrl}
                  onChange={(e) => setNewHeroSlide((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="/images/hero-1.avif or .mp4 link"
                  style={{ flex: 1, margin: 0 }}
                  required={!newHeroSlide.imageUrl}
                />
                <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>OR</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }}
                />
              </div>
              {uploadingImage && <small style={{ color: "var(--color-brand-gold)", display: "block", marginTop: "8px" }}>Processing media file...</small>}
              <small style={{ color: "var(--color-text-secondary)", fontSize: "11px", marginTop: "6px", display: "block" }}>
                Max file size: 2MB for images (auto-compressed to WebP), 10MB for videos.
              </small>
            </div>
            <div className="form-row-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newHeroSlide.active}
                  onChange={(e) => setNewHeroSlide((p) => ({ ...p, active: e.target.checked }))}
                />
                <span>Active</span>
              </label>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button type="submit" className="admin-add-item-btn" style={{ flex: 1 }} disabled={savingHeroSlide || uploadingImage}>
                {savingHeroSlide ? (
                  <div className="admin-spinner" style={{ marginRight: "6px" }}></div>
                ) : editingHeroSlideId ? (
                  <Check size={16} />
                ) : (
                  <PlusCircle size={16} />
                )}
                <span>
                  {savingHeroSlide
                    ? editingHeroSlideId
                      ? "Saving..."
                      : "Adding..."
                    : editingHeroSlideId
                    ? "Update Slide"
                    : "Add Slide"}
                </span>
              </button>
              {editingHeroSlideId && (
                <button
                  type="button"
                  className="admin-logout-btn"
                  onClick={() => {
                    setEditingHeroSlideId(null);
                    setNewHeroSlide({
                      title: "",
                      subtitle: "",
                      imageUrl: "",
                      ctaText: "",
                      ctaLink: "",
                      duration: 5,
                      order: 0,
                      active: true,
                    });
                  }}
                  style={{ margin: 0, padding: "14px" }}
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="admin-menu-list-container">
          <div className="admin-menu-list-header">
            <h2>Manage Existing Slides</h2>
          </div>
          {heroLoading ? (
            <div className="admin-loading-spinner-wrapper">
              <div className="menu-loading-spinner"></div>
            </div>
          ) : (
            <div className="admin-menu-items-list">
              {heroSlides.map((slide, index) => (
                <div key={slide.id} className="admin-menu-item-row">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="admin-reorder-btns">
                      <button
                        className="admin-reorder-btn"
                        onClick={() => handleMoveItem(index, "up")}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        className="admin-reorder-btn"
                        onClick={() => handleMoveItem(index, "down")}
                        disabled={index === heroSlides.length - 1}
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <div className="admin-menu-item-info">
                      <h4>{slide.title}</h4>
                      <p>{slide.subtitle || "(No subtitle)"} | ⏱️ {slide.duration || 5}s</p>
                    </div>
                  </div>
                  <div className="admin-menu-item-actions">
                    <button
                      onClick={() => handleHeroSlideToggle(slide.id, slide.active)}
                      className={`admin-toggle-btn ${slide.active ? "active-available" : ""}`}
                    >
                      {slide.active ? "Active" : "Hidden"}
                    </button>
                    <button
                      onClick={() => handleStartHeroEdit(slide)}
                      className="admin-delete-row-btn"
                      style={{ color: "var(--color-brand-gold)", marginRight: "4px" }}
                      title="Edit Slide"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleHeroSlideDelete(slide.id)}
                      className="admin-delete-row-btn"
                      title="Delete Slide"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
