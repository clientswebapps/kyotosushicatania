import { useState } from "react";
import { motion } from "framer-motion";
import {
  useCollection,
  useUpdateDocument,
  useDeleteDocument,
  useAddDocument,
} from "../../hooks/useFirestore";
import { PlusCircle, ChevronUp, ChevronDown, Edit, Trash2, Check, X } from "lucide-react";
import { uploadMediaFile } from "../../utils/imageUtils";

export default function GalleryTab() {
  const { data: galleryItems = [], loading: galleryLoading } = useCollection("galleryItems", {
    orderByField: "order",
    realtime: true,
  });

  const { updateDocument: updateGalleryItem } = useUpdateDocument("galleryItems");
  const { addDocument: addGalleryItem } = useAddDocument("galleryItems");
  const { deleteDocument: deleteGalleryItem } = useDeleteDocument("galleryItems");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingGalleryItem, setSavingGalleryItem] = useState(false);
  const [editingGalleryItemId, setEditingGalleryItemId] = useState(null);

  const [newGalleryItem, setNewGalleryItem] = useState({
    title: "",
    imageUrl: "",
    order: 0,
    active: true,
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadMediaFile(file, setUploadingImage);
      setNewGalleryItem((prev) => ({ ...prev, imageUrl: url }));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMoveItem = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryItems.length) return;

    const currentItem = galleryItems[index];
    const swapItem = galleryItems[targetIndex];

    try {
      await updateGalleryItem(currentItem.id, { order: swapItem.order });
      await updateGalleryItem(swapItem.id, { order: currentItem.order });
    } catch (err) {
      console.error("Reorder error:", err);
    }
  };

  const handleAddGalleryItem = async (e) => {
    e.preventDefault();
    setSavingGalleryItem(true);
    try {
      const payload = {
        ...newGalleryItem,
      };

      if (editingGalleryItemId) {
        await updateGalleryItem(editingGalleryItemId, payload);
        setEditingGalleryItemId(null);
      } else {
        if (galleryItems && galleryItems.length >= 20) {
          alert("The gallery is already full (maximum 20 items). You need to remove 1 item to continue.");
          return;
        }
        const minOrder = galleryItems?.length > 0 ? Math.min(...galleryItems.map((s) => s.order || 0)) : 0;
        await addGalleryItem({
          ...payload,
          order: minOrder - 1,
        });
      }
      setNewGalleryItem({ title: "", imageUrl: "", order: 0, active: true });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingGalleryItem(false);
    }
  };

  const handleStartGalleryEdit = (item) => {
    setEditingGalleryItemId(item.id);
    setNewGalleryItem({
      title: item.title || "",
      imageUrl: item.imageUrl || "",
      order: item.order || 0,
      active: item.active !== undefined ? !!item.active : true,
    });
  };

  const handleGalleryItemDelete = async (id) => {
    if (window.confirm("Delete this gallery item?")) {
      try {
        await deleteGalleryItem(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGalleryItemToggle = async (id, currentStatus) => {
    try {
      await updateGalleryItem(id, { active: !currentStatus });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      key="gallery"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      <div className="admin-menu-header">
        <h2>Gallery Settings</h2>
        <p>Manage the infinite scrolling food/menu media gallery</p>
      </div>

      <div className="admin-menu-grid">
        <div className="admin-menu-form-container">
          <h2>{editingGalleryItemId ? "Edit Gallery Item" : "Add New Gallery Item"}</h2>
          <form onSubmit={handleAddGalleryItem} className="admin-menu-form">
            <div className="form-group">
              <label>Title (Optional Caption)</label>
              <input
                type="text"
                value={newGalleryItem.title}
                onChange={(e) => setNewGalleryItem((p) => ({ ...p, title: e.target.value }))}
                placeholder="Es: Dragon Roll Signature"
              />
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Media (Image/Video URL or Upload) *</label>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="text"
                  value={newGalleryItem.imageUrl}
                  onChange={(e) => setNewGalleryItem((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="/images/menu/menu (1).jpeg or .mp4 link"
                  style={{ flex: 1, margin: 0 }}
                  required={!newGalleryItem.imageUrl}
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
                  checked={newGalleryItem.active}
                  onChange={(e) => setNewGalleryItem((p) => ({ ...p, active: e.target.checked }))}
                />
                <span>Active</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button type="submit" className="admin-add-item-btn" style={{ flex: 1 }} disabled={savingGalleryItem || uploadingImage}>
                {savingGalleryItem ? (
                  <div className="admin-spinner" style={{ marginRight: "6px" }}></div>
                ) : editingGalleryItemId ? (
                  <Check size={16} />
                ) : (
                  <PlusCircle size={16} />
                )}
                <span>
                  {savingGalleryItem
                    ? editingGalleryItemId
                      ? "Saving..."
                      : "Adding..."
                    : editingGalleryItemId
                    ? "Update Item"
                    : "Add to Gallery"}
                </span>
              </button>

              {editingGalleryItemId && (
                <button
                  type="button"
                  className="admin-logout-btn"
                  onClick={() => {
                    setEditingGalleryItemId(null);
                    setNewGalleryItem({ title: "", imageUrl: "", order: 0, active: true });
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
            <h2>Manage Gallery Items</h2>
          </div>
          {galleryLoading ? (
            <div className="admin-loading-spinner-wrapper">
              <div className="menu-loading-spinner"></div>
            </div>
          ) : (
            <div className="admin-menu-items-list">
              {galleryItems.map((item, index) => (
                <div key={item.id} className="admin-menu-item-row">
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
                        disabled={index === galleryItems.length - 1}
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {/* Visual Thumbnail */}
                    <div style={{ width: "48px", height: "48px", borderRadius: "4px", overflow: "hidden", background: "#222", flexShrink: 0 }}>
                      {/\.(mp4|webm|ogg)(\?.*)?$/i.test(item.imageUrl) ? (
                        <video src={item.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                      ) : (
                        <img src={item.imageUrl || "/images/dragon-roll.avif"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </div>

                    <div className="admin-menu-item-info">
                      <h4>{item.title || "(Untitled Item)"}</h4>
                      <p style={{ fontSize: "11px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "180px" }}>
                        {item.imageUrl}
                      </p>
                    </div>
                  </div>

                  <div className="admin-menu-item-actions">
                    <button
                      onClick={() => handleGalleryItemToggle(item.id, item.active)}
                      className={`admin-toggle-btn ${item.active ? "active-available" : ""}`}
                    >
                      {item.active ? "Active" : "Hidden"}
                    </button>

                    <button
                      onClick={() => handleStartGalleryEdit(item)}
                      className="admin-delete-row-btn"
                      style={{ color: "var(--color-brand-gold)", marginRight: "4px" }}
                      title="Edit Item"
                    >
                      <Edit size={14} />
                    </button>

                    <button
                      onClick={() => handleGalleryItemDelete(item.id)}
                      className="admin-delete-row-btn"
                      title="Delete Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {galleryItems.length === 0 && (
                <p className="admin-empty-state" style={{ padding: "20px 0" }}>No gallery items found. Seed the database or upload some media files!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
