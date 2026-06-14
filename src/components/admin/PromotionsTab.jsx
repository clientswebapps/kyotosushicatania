import { useState } from "react";
import { motion } from "framer-motion";
import {
  useCollection,
  useUpdateDocument,
  useDeleteDocument,
  useAddDocument,
} from "../../hooks/useFirestore";
import { PlusCircle, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { uploadMediaFile } from "../../utils/imageUtils";

export default function PromotionsTab() {
  const { data: promotions, loading: promoLoading } = useCollection("promotions", {
    orderByField: "order",
    realtime: true,
  });

  const { updateDocument: updatePromo } = useUpdateDocument("promotions");
  const { addDocument: addPromo } = useAddDocument("promotions");
  const { deleteDocument: deletePromo } = useDeleteDocument("promotions");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingPromo, setSavingPromo] = useState(false);

  const [newPromotion, setNewPromotion] = useState({
    title: "",
    description: "",
    imageUrl: "",
    tag: "",
    link: "",
    order: 0,
    active: true,
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadMediaFile(file, setUploadingImage);
      setNewPromotion((prev) => ({ ...prev, imageUrl: url }));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMoveItem = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= promotions.length) return;

    const currentItem = promotions[index];
    const swapItem = promotions[targetIndex];

    try {
      await updatePromo(currentItem.id, { order: swapItem.order });
      await updatePromo(swapItem.id, { order: currentItem.order });
    } catch (err) {
      console.error("Reorder error:", err);
    }
  };

  const handleAddPromotion = async (e) => {
    e.preventDefault();
    setSavingPromo(true);
    try {
      if (promotions && promotions.length >= 5) {
        alert("Promotions are already full (maximum 5 promos). You need to remove 1 item to continue.");
        return;
      }
      const minOrder = promotions?.length > 0 ? Math.min(...promotions.map((s) => s.order || 0)) : 0;
      await addPromo({
        ...newPromotion,
        order: minOrder - 1,
      });
      setNewPromotion({
        title: "",
        description: "",
        imageUrl: "",
        tag: "",
        link: "",
        order: 0,
        active: true,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPromo(false);
    }
  };

  const handlePromoDelete = async (id) => {
    if (window.confirm("Delete this promotion?")) {
      try {
        await deletePromo(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePromoToggle = async (id, currentStatus) => {
    try {
      await updatePromo(id, { active: !currentStatus });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      key="promotions"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      <div className="admin-menu-header">
        <h2>Promotions Settings</h2>
        <p>Manage the featured offers section (Max 4 recommended)</p>
      </div>

      <div className="admin-menu-grid">
        <div className="admin-menu-form-container">
          <h2>Add New Promotion</h2>
          <form onSubmit={handleAddPromotion} className="admin-menu-form">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={newPromotion.title}
                onChange={(e) => setNewPromotion((p) => ({ ...p, title: e.target.value }))}
                required
                placeholder="Es: Lunch Special"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newPromotion.description}
                onChange={(e) => setNewPromotion((p) => ({ ...p, description: e.target.value }))}
                placeholder="Details about the offer..."
                rows={2}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Tag (Badge Text)</label>
                <input
                  type="text"
                  value={newPromotion.tag}
                  onChange={(e) => setNewPromotion((p) => ({ ...p, tag: e.target.value }))}
                  placeholder="Es: 15% OFF"
                />
              </div>
              <div className="form-group">
                <label>Optional Link</label>
                <input
                  type="text"
                  value={newPromotion.link || ""}
                  onChange={(e) => setNewPromotion((p) => ({ ...p, link: e.target.value }))}
                  placeholder="/menu or https://..."
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Media (Image/Video URL or Upload) *</label>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="text"
                  value={newPromotion.imageUrl}
                  onChange={(e) => setNewPromotion((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="/images/promo-1.avif or .mp4 link"
                  style={{ flex: 1, margin: 0 }}
                  required={!newPromotion.imageUrl}
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
                  checked={newPromotion.active}
                  onChange={(e) => setNewPromotion((p) => ({ ...p, active: e.target.checked }))}
                />
                <span>Active</span>
              </label>
            </div>
            <button type="submit" className="admin-add-item-btn" disabled={savingPromo || uploadingImage}>
              {savingPromo ? (
                <div className="admin-spinner" style={{ marginRight: "6px" }}></div>
              ) : (
                <PlusCircle size={16} />
              )}
              <span>{savingPromo ? "Adding..." : "Add Promotion"}</span>
            </button>
          </form>
        </div>

        <div className="admin-menu-list-container">
          <div className="admin-menu-list-header">
            <h2>Manage Promotions</h2>
          </div>
          {promoLoading ? (
            <div className="admin-loading-spinner-wrapper">
              <div className="menu-loading-spinner"></div>
            </div>
          ) : (
            <div className="admin-menu-items-list">
              {promotions.map((promo, index) => (
                <div key={promo.id} className="admin-menu-item-row">
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
                        disabled={index === promotions.length - 1}
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <div className="admin-menu-item-info">
                      <h4>
                        {promo.title}{" "}
                        {promo.tag && (
                          <span
                            style={{
                              fontSize: "10px",
                              background: "var(--color-brand-gold)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              color: "#000",
                            }}
                          >
                            {promo.tag}
                          </span>
                        )}
                      </h4>
                      <p>{promo.description}</p>
                    </div>
                  </div>
                  <div className="admin-menu-item-actions">
                    <button
                      onClick={() => handlePromoToggle(promo.id, promo.active)}
                      className={`admin-toggle-btn ${promo.active ? "active-available" : ""}`}
                    >
                      {promo.active ? "Active" : "Hidden"}
                    </button>
                    <button onClick={() => handlePromoDelete(promo.id)} className="admin-delete-row-btn">
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
