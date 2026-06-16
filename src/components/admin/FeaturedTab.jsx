import { useState } from "react";
import { motion } from "framer-motion";
import {
  useCollection,
  useUpdateDocument,
  useDeleteDocument,
  useAddDocument,
} from "../../hooks/useFirestore";
import { PlusCircle, ChevronUp, ChevronDown, Trash2, Edit, Check, X } from "lucide-react";
import { uploadMediaFile } from "../../utils/imageUtils";

export default function FeaturedTab() {
  const { data: featuredItems = [], loading: featuredLoading } = useCollection("featuredItems", {
    orderByField: "order",
    realtime: true,
  });

  const { data: categories = [] } = useCollection("menuCategories", {
    orderByField: "order",
  });
  const { data: menuItems = [] } = useCollection("menuItems", {
    orderByField: "name",
  });

  const { updateDocument: updateFeatured } = useUpdateDocument("featuredItems");
  const { addDocument: addFeatured } = useAddDocument("featuredItems");
  const { deleteDocument: deleteFeatured } = useDeleteDocument("featuredItems");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingFeatured, setSavingFeatured] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  const [linkType, setLinkType] = useState("custom");
  const [linkValue, setLinkValue] = useState("");

  const parseLink = (link) => {
    if (!link) return { type: "custom", value: "" };
    if (link.startsWith("/menu?category=")) {
      return { type: "category", value: link.replace("/menu?category=", "") };
    }
    if (link.startsWith("/menu?item=")) {
      return { type: "item", value: link.replace("/menu?item=", "") };
    }
    return { type: "custom", value: link };
  };

  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    price6: "",
    description: "",
    imageUrl: "",
    link: "",
    order: 0,
    active: true,
    hasPhotoDisclaimer: false,
    isBestSeller: false,
    cardSize: "long",
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadMediaFile(file, setUploadingImage);
      setNewItem((prev) => ({ ...prev, imageUrl: url }));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMoveItem = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= featuredItems.length) return;

    const currentItem = featuredItems[index];
    const swapItem = featuredItems[targetIndex];

    try {
      await updateFeatured(currentItem.id, { order: swapItem.order });
      await updateFeatured(swapItem.id, { order: currentItem.order });
    } catch (err) {
      console.error("Reorder error:", err);
    }
  };

  const handleAddFeatured = async (e) => {
    e.preventDefault();
    setSavingFeatured(true);
    try {
      let resolvedLink = "/menu";
      if (linkType === "category") {
        resolvedLink = `/menu?category=${linkValue}`;
      } else if (linkType === "item") {
        resolvedLink = `/menu?item=${linkValue}`;
      } else if (linkType === "custom" && linkValue) {
        resolvedLink = linkValue;
      }

      const payload = {
        name: newItem.name || "",
        price: newItem.price ? parseFloat(newItem.price) : "",
        price6: newItem.price6 ? parseFloat(newItem.price6) : "",
        description: newItem.description || "",
        imageUrl: newItem.imageUrl,
        link: resolvedLink,
        active: newItem.active !== undefined ? !!newItem.active : true,
        hasPhotoDisclaimer: !!newItem.hasPhotoDisclaimer,
        isBestSeller: !!newItem.isBestSeller,
        cardSize: newItem.cardSize || "long",
      };

      if (editingItemId) {
        await updateFeatured(editingItemId, payload);
        setEditingItemId(null);
      } else {
        const minOrder = featuredItems?.length > 0 ? Math.min(...featuredItems.map((s) => s.order || 0)) : 0;
        await addFeatured({
          ...payload,
          order: minOrder - 1,
        });
      }

      setNewItem({
        name: "",
        price: "",
        price6: "",
        description: "",
        imageUrl: "",
        link: "",
        order: 0,
        active: true,
        hasPhotoDisclaimer: false,
        isBestSeller: false,
        cardSize: "long",
      });
      setLinkType("custom");
      setLinkValue("");
    } catch (err) {
      console.error(err);
    } finally {
      setSavingFeatured(false);
    }
  };

  const handleFeaturedDelete = async (id) => {
    if (window.confirm("Delete this featured item?")) {
      try {
        await deleteFeatured(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFeaturedToggle = async (id, currentStatus) => {
    try {
      await updateFeatured(id, { active: !currentStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setNewItem({
      name: item.name || "",
      price: item.price !== undefined && item.price !== null ? item.price.toString() : "",
      price6: item.price6 !== undefined && item.price6 !== null ? item.price6.toString() : "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      link: item.link || "",
      order: item.order || 0,
      active: item.active !== undefined ? !!item.active : true,
      hasPhotoDisclaimer: !!item.hasPhotoDisclaimer,
      isBestSeller: !!item.isBestSeller,
      cardSize: item.cardSize || "long",
    });
    const parsed = parseLink(item.link || "");
    setLinkType(parsed.type);
    setLinkValue(parsed.value);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setNewItem({
      name: "",
      price: "",
      price6: "",
      description: "",
      imageUrl: "",
      link: "",
      order: 0,
      active: true,
      hasPhotoDisclaimer: false,
      isBestSeller: false,
      cardSize: "long",
    });
    setLinkType("custom");
    setLinkValue("");
  };

  return (
    <motion.div
      key="featured"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      <div className="admin-menu-header">
        <h2>Featured Menu Settings</h2>
        <p>Manage the featured cards shown on the homepage menu preview section.</p>
      </div>

      <div className="admin-menu-grid">
        <div className="admin-menu-form-container">
          <h2>{editingItemId ? "Edit Featured Item" : "Add Featured Item"}</h2>
          <form onSubmit={handleAddFeatured} className="admin-menu-form">
            <div className="form-group">
              <label>Dish Name (Optional)</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                placeholder="Es: Dragon Roll"
              />
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                placeholder="Ingredients or details..."
                rows={2}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (1pz / Std) (€) (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
                  placeholder="2.00"
                />
              </div>
              <div className="form-group">
                <label>Price (6pz) (€) (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price6}
                  onChange={(e) => setNewItem((p) => ({ ...p, price6: e.target.value }))}
                  placeholder="11.00"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Card Size</label>
                <select
                  value={newItem.cardSize || "long"}
                  onChange={(e) => setNewItem((p) => ({ ...p, cardSize: e.target.value }))}
                >
                  <option value="long">Long Card (Wide - 3 Cols)</option>
                  <option value="medium">Medium Card (Medium - 2 Cols)</option>
                  <option value="short">Short Card (Standard - 1 Col)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Link Type</label>
                <select
                  value={linkType}
                  onChange={(e) => {
                    const type = e.target.value;
                    setLinkType(type);
                    if (type === "category") {
                      setLinkValue(categories[0]?.id || "");
                    } else if (type === "item") {
                      const firstItemId = menuItems[0]?.id || "";
                      setLinkValue(firstItemId);
                      const selectedItem = menuItems.find((i) => i.id === firstItemId);
                      if (selectedItem) {
                        setNewItem((prev) => ({
                          ...prev,
                          imageUrl: selectedItem.imageUrl || prev.imageUrl,
                          name: prev.name || selectedItem.name || "",
                          price: prev.price || (selectedItem.price !== undefined && selectedItem.price !== null ? selectedItem.price.toString() : ""),
                          price6: prev.price6 || (selectedItem.price6 !== undefined && selectedItem.price6 !== null ? selectedItem.price6.toString() : ""),
                          description: prev.description || selectedItem.description || "",
                        }));
                      }
                    } else {
                      setLinkValue("");
                    }
                  }}
                >
                  <option value="custom">Custom Link / Route</option>
                  <option value="category">Link to Category</option>
                  <option value="item">Link to Menu Item</option>
                </select>
              </div>
            </div>

            {linkType && (
              <div className="form-group" style={{ marginBottom: "16px" }}>
                {linkType === "custom" && (
                  <>
                    <label>URL / Route Path</label>
                    <input
                      type="text"
                      value={linkValue}
                      onChange={(e) => setLinkValue(e.target.value)}
                      placeholder="e.g., /menu or /contact"
                    />
                  </>
                )}
                {linkType === "category" && (
                  <>
                    <label>Select Category</label>
                    <select
                      value={linkValue}
                      onChange={(e) => setLinkValue(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </>
                )}
                {linkType === "item" && (
                  <>
                    <label>Select Menu Item</label>
                    <select
                      value={linkValue}
                      onChange={(e) => {
                        const itemId = e.target.value;
                        setLinkValue(itemId);
                        const selectedItem = menuItems.find((i) => i.id === itemId);
                        if (selectedItem) {
                          setNewItem((prev) => ({
                            ...prev,
                            imageUrl: selectedItem.imageUrl || prev.imageUrl,
                            name: prev.name || selectedItem.name || "",
                            price: prev.price || (selectedItem.price !== undefined && selectedItem.price !== null ? selectedItem.price.toString() : ""),
                            price6: prev.price6 || (selectedItem.price6 !== undefined && selectedItem.price6 !== null ? selectedItem.price6.toString() : ""),
                            description: prev.description || selectedItem.description || "",
                          }));
                        }
                      }}
                    >
                      {menuItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} {item.price ? `(€${Number(item.price).toFixed(2)})` : ""}{item.price6 ? ` [6pz: €${Number(item.price6).toFixed(2)}]` : ""}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            )}
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Card Image *</label>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="text"
                  value={newItem.imageUrl}
                  onChange={(e) => setNewItem((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="/images/dish.avif or upload"
                  style={{ flex: 1, margin: 0 }}
                  required={!newItem.imageUrl}
                />
                <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>OR</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }}
                />
              </div>
              {uploadingImage && <small style={{ color: "var(--color-brand-gold)", display: "block", marginTop: "8px" }}>Processing image file...</small>}
            </div>
            <div className="form-row-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newItem.active}
                  onChange={(e) => setNewItem((p) => ({ ...p, active: e.target.checked }))}
                />
                <span>Active</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newItem.hasPhotoDisclaimer}
                  onChange={(e) => setNewItem((p) => ({ ...p, hasPhotoDisclaimer: e.target.checked }))}
                />
                <span>Show photo disclaimer note</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newItem.isBestSeller}
                  onChange={(e) => setNewItem((p) => ({ ...p, isBestSeller: e.target.checked }))}
                />
                <span>Show Best Seller Badge</span>
              </label>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" className="admin-add-item-btn" style={{ flex: 1 }} disabled={savingFeatured || uploadingImage}>
                {savingFeatured ? (
                  <div className="admin-spinner" style={{ marginRight: "6px" }}></div>
                ) : editingItemId ? (
                  <Check size={16} />
                ) : (
                  <PlusCircle size={16} />
                )}
                <span>{savingFeatured ? "Saving..." : editingItemId ? "Update Item" : "Add Featured Item"}</span>
              </button>
              {editingItemId && (
                <button
                  type="button"
                  className="admin-logout-btn"
                  onClick={handleCancelEdit}
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
            <h2>Manage Featured Menu</h2>
          </div>
          {featuredLoading ? (
            <div className="admin-loading-spinner-wrapper">
              <div className="menu-loading-spinner"></div>
            </div>
          ) : (
            <div className="admin-menu-items-list">
              {featuredItems.map((item, index) => (
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
                        disabled={index === featuredItems.length - 1}
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <div className="admin-menu-item-info">
                      <h4>
                        {item.name || "(Untitled Card)"}{" "}
                        {item.price && (
                          <span style={{ color: "var(--color-brand-gold)", fontSize: "13px", marginLeft: "8px" }}>
                            1pz: €{Number(item.price).toFixed(2)}
                          </span>
                        )}
                        {item.price6 && (
                          <span style={{ color: "var(--color-brand-gold)", fontSize: "13px", marginLeft: "8px" }}>
                            6pz: €{Number(item.price6).toFixed(2)}
                          </span>
                        )}
                      </h4>
                      <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                        {item.description || "No description"} | Link: {item.link || "/menu"} | Size: {item.cardSize === "short" ? "Short" : item.cardSize === "medium" ? "Medium" : "Long"} | Best Seller: {item.isBestSeller ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                  <div className="admin-menu-item-actions">
                    <button
                      onClick={() => handleFeaturedToggle(item.id, item.active)}
                      className={`admin-toggle-btn ${item.active ? "active-available" : ""}`}
                    >
                      {item.active ? "Active" : "Hidden"}
                    </button>
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="admin-delete-row-btn"
                      style={{ color: "var(--color-brand-gold)", marginRight: "4px" }}
                      title="Edit Item"
                    >
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleFeaturedDelete(item.id)} className="admin-delete-row-btn">
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
