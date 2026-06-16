import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  useCollection,
  useUpdateDocument,
  useDeleteDocument,
  useAddDocument,
} from "../../hooks/useFirestore";
import { Search, Database, Edit, Trash2, Check, PlusCircle, X } from "lucide-react";
import { uploadMediaFile } from "../../utils/imageUtils";

export default function MenuTab({ user, seeding, handleSeedDatabase }) {
  // Menu items list
  const { data: menuItems, loading: menuLoading } = useCollection("menuItems", {
    orderByField: "order",
    realtime: true,
  });

  // Categories list
  const { data: categories = [] } = useCollection("menuCategories");

  // Menu activity logs
  const { data: menuLogs = [], loading: logsLoading } = useCollection("menuLogs");
  const { addDocument: addLog } = useAddDocument("menuLogs");

  const { updateDocument: updateMenuItem } = useUpdateDocument("menuItems");
  const { addDocument: addMenuItem } = useAddDocument("menuItems");
  const { deleteDocument: deleteMenuItem } = useDeleteDocument("menuItems");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [savingMenuItem, setSavingMenuItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // New Menu Item Form State
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    isBestSeller: false,
    isAvailable: true,
    imageUrl: "",
    highlights: [],
    hasPhotoDisclaimer: false,
  });

  const logActivity = async (action, itemName, details = "") => {
    try {
      await addLog({
        action,
        itemName,
        details,
        userEmail: user?.email || "unknown@kyotosushicatania.com",
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error creating log entry:", err);
    }
  };

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

  // Toggle availability
  const toggleAvailable = async (item) => {
    try {
      const nextState = !item.isAvailable;
      await updateMenuItem(item.id, { isAvailable: nextState });
      await logActivity(
        "toggle_availability",
        item.name,
        `Availability set to ${nextState ? "Active" : "Sold Out"}`
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle best seller
  const toggleBestSeller = async (item) => {
    try {
      const nextState = !item.isBestSeller;
      await updateMenuItem(item.id, { isBestSeller: nextState });
      await logActivity(
        "toggle_bestseller",
        item.name,
        `Best Seller status set to ${nextState ? "Yes" : "No"}`
      );
    } catch (err) {
      console.error(err);
    }
  };



  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    setSavingMenuItem(true);
    try {
      const payload = {
        ...newItem,
        price: parseFloat(newItem.price),
        originalPrice: newItem.originalPrice ? parseFloat(newItem.originalPrice) : null,
        highlights: Array.isArray(newItem.highlights) ? newItem.highlights : [],
      };

      if (editingItemId) {
        const originalItem = menuItems.find((item) => item.id === editingItemId);
        const changes = [];
        if (originalItem) {
          if (originalItem.name !== payload.name) {
            changes.push(`Name: "${originalItem.name}" ➔ "${payload.name}"`);
          }
          if (Number(originalItem.price) !== Number(payload.price)) {
            changes.push(`Price: €${Number(originalItem.price).toFixed(2)} ➔ €${Number(payload.price).toFixed(2)}`);
          }
          if (Number(originalItem.originalPrice || 0) !== Number(payload.originalPrice || 0)) {
            changes.push(
              `Original Price: ${
                originalItem.originalPrice ? `€${Number(originalItem.originalPrice).toFixed(2)}` : "None"
              } ➔ ${payload.originalPrice ? `€${Number(payload.originalPrice).toFixed(2)}` : "None"}`
            );
          }
          if (originalItem.categoryId !== payload.categoryId) {
            changes.push(`Category: "${originalItem.categoryId}" ➔ "${payload.categoryId}"`);
          }
          if (originalItem.description !== payload.description) {
            changes.push("Description updated");
          }
          if (!!originalItem.isBestSeller !== !!payload.isBestSeller) {
            changes.push(`Best Seller: ${originalItem.isBestSeller ? "Yes" : "No"} ➔ ${payload.isBestSeller ? "Yes" : "No"}`);
          }

          if (originalItem.imageUrl !== payload.imageUrl) {
            changes.push("Image updated");
          }
          if (!!originalItem.hasPhotoDisclaimer !== !!payload.hasPhotoDisclaimer) {
            changes.push(`Photo Disclaimer: ${originalItem.hasPhotoDisclaimer ? "Yes" : "No"} ➔ ${payload.hasPhotoDisclaimer ? "Yes" : "No"}`);
          }
        }
        const changeString = changes.length > 0 ? changes.join(", ") : "No fields changed";
        await updateMenuItem(editingItemId, payload);
        await logActivity("update", payload.name, changeString);
        setEditingItemId(null);
      } else {
        if (menuItems && menuItems.length >= 700) {
          alert("The menu is already full (maximum 700 menu items). You need to remove 1 item to continue.");
          return;
        }
        await addMenuItem({
          ...payload,
          order: menuItems?.length || 0,
        });
        await logActivity(
          "add",
          payload.name,
          `Added as new dish. Price: €${payload.price.toFixed(2)}, Category: ${payload.categoryId}`
        );
      }

      setNewItem({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        categoryId: "",
        isBestSeller: false,
        isAvailable: true,
        imageUrl: "",
        highlights: [],
        hasPhotoDisclaimer: false,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingMenuItem(false);
    }
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setNewItem({
      name: item.name || "",
      description: item.description || "",
      price: item.price !== undefined ? item.price.toString() : "",
      originalPrice: item.originalPrice !== undefined && item.originalPrice !== null ? item.originalPrice.toString() : "",
      categoryId: item.categoryId || "",
      isBestSeller: !!item.isBestSeller,
      isAvailable: item.isAvailable !== undefined ? !!item.isAvailable : true,
      imageUrl: item.imageUrl || "",
      highlights: Array.isArray(item.highlights) ? item.highlights : [],
      hasPhotoDisclaimer: !!item.hasPhotoDisclaimer,
    });
  };

  const handleMenuItemDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      const deletedItem = menuItems.find((item) => item.id === id);
      try {
        await deleteMenuItem(id);
        if (deletedItem) {
          await logActivity("delete", deletedItem.name, "Item was deleted from the menu.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filtered menu items for the list search functionality
  const filteredMenuItems = useMemo(() => {
    if (!menuItems) return [];
    if (!menuSearchQuery.trim()) return menuItems;
    const q = menuSearchQuery.toLowerCase();
    return menuItems.filter((item) =>
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  }, [menuItems, menuSearchQuery]);

  return (
    <motion.div
      key="menu"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="admin-menu-manager"
    >
      <div className="admin-menu-split">
        {/* Form to add/edit item */}
        <div className="admin-menu-form-container">
          <h2>{editingItemId ? `Edit Dish: ${newItem.name}` : "Add New Dish"}</h2>
          <form onSubmit={handleAddMenuItem} className="admin-menu-form">
            <div className="form-group">
              <label>Dish Name *</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((p) => ({ ...p, name: e.target.value }))
                }
                required
                placeholder="Es: Sake Roll"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newItem.description}
                onChange={(e) =>
                  setNewItem((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Ingredients..."
                rows={2}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={newItem.categoryId}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, categoryId: e.target.value }))
                  }
                  required
                >
                  <option value="">Select...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Active Price (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, price: e.target.value }))
                  }
                  required
                  placeholder="9.90"
                />
              </div>
              <div className="form-group">
                <label>Original Price (€) (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.originalPrice}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, originalPrice: e.target.value }))
                  }
                  placeholder="12.00"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Media (Image/Video URL or Upload) (Optional)</label>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="text"
                  value={newItem.imageUrl || ""}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  placeholder="/images/dish.avif or .mp4 link"
                  style={{ flex: 1, margin: 0 }}
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

            <div className="form-group" style={{ marginTop: "8px" }}>
              <label style={{ marginBottom: "8px", display: "block" }}>Dish Badges / Highlights (Presets)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                {[
                  "👨‍🍳 Chef's Pick",
                  "🐟 4 Fish Types",
                  "🔥 Top Seller",
                  "🥑 Fresh Avocado",
                ].map((badge) => {
                  const isSelected = newItem.highlights?.includes(badge);
                  return (
                    <button
                      type="button"
                      key={badge}
                      onClick={() => {
                        setNewItem((prev) => {
                          const highlights = prev.highlights || [];
                          if (highlights.includes(badge)) {
                            return { ...prev, highlights: highlights.filter((h) => h !== badge) };
                          } else {
                            return { ...prev, highlights: [...highlights, badge] };
                          }
                        });
                      }}
                      className={`admin-toggle-btn ${isSelected ? "active" : ""}`}
                      style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <span>{badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Custom / Future Emoji Badges (comma-separated)</label>
              <input
                type="text"
                value={(newItem.highlights || []).filter((h) => ![
                  "👨‍🍳 Chef's Pick",
                  "🐟 4 Fish Types",
                  "🔥 Top Seller",
                  "🥑 Fresh Avocado",
                ].includes(h)).join(", ")}
                onChange={(e) => {
                  const val = e.target.value;
                  const customTags = val.split(",")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);
                  const currentPresets = (newItem.highlights || []).filter((h) => [
                    "👨‍🍳 Chef's Pick",
                    "🐟 4 Fish Types",
                    "🔥 Top Seller",
                    "🥑 Fresh Avocado",
                  ].includes(h));
                  setNewItem((prev) => ({
                    ...prev,
                    highlights: [...currentPresets, ...customTags],
                  }));
                }}
                placeholder="Es: 🍤 Crispy, ✨ Premium, 🌶️ Spicy"
              />
              <small style={{ color: "var(--color-text-secondary)", fontSize: "11px", marginTop: "4px", display: "block" }}>
                Separate custom badges or any future emojis by commas.
              </small>
            </div>

            <div className="form-row-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newItem.isBestSeller}
                  onChange={(e) =>
                    setNewItem((p) => ({
                      ...p,
                      isBestSeller: e.target.checked,
                    }))
                  }
                />
                <span>Set as Best Seller</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newItem.hasPhotoDisclaimer}
                  onChange={(e) =>
                    setNewItem((p) => ({
                      ...p,
                      hasPhotoDisclaimer: e.target.checked,
                    }))
                  }
                />
                <span>Photo may not exactly represent the actual dish</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button type="submit" className="admin-add-item-btn" style={{ flex: 1 }} disabled={savingMenuItem || uploadingImage}>
                {savingMenuItem ? (
                  <div className="admin-spinner" style={{ marginRight: "6px" }}></div>
                ) : editingItemId ? (
                  <Check size={16} />
                ) : (
                  <PlusCircle size={16} />
                )}
                <span>
                  {savingMenuItem
                    ? editingItemId
                      ? "Saving..."
                      : "Adding..."
                    : editingItemId
                    ? "Update Dish"
                    : "Add to Menu"}
                </span>
              </button>
              {editingItemId && (
                <button
                  type="button"
                  className="admin-logout-btn"
                  onClick={() => {
                    setEditingItemId(null);
                    setNewItem({
                      name: "",
                      description: "",
                      price: "",
                      originalPrice: "",
                      categoryId: "",
                      isBestSeller: false,
                      isAvailable: true,
                      imageUrl: "",
                      highlights: [],
                      hasPhotoDisclaimer: false,
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

        {/* List of items */}
        <div className="admin-menu-list-container">
          <div className="admin-menu-list-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2>Manage Existing Dishes</h2>
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="admin-toggle-btn active"
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 12px" }}
            >
              {seeding ? (
                <div className="admin-spinner" style={{ width: "12px", height: "12px" }}></div>
              ) : (
                <Database size={14} />
              )}
              <span>{seeding ? "Importing..." : "Import Demo Menu"}</span>
            </button>
          </div>

          {/* Search Bar for Dishes list */}
          <div className="admin-search-wrapper" style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-secondary)" }} />
              <input
                type="text"
                placeholder="Search dishes by name or description..."
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                className="admin-search-input"
                style={{ paddingLeft: "36px", width: "100%" }}
              />
            </div>
            {menuSearchQuery && (
              <button
                onClick={() => setMenuSearchQuery("")}
                className="admin-toggle-btn"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 14px" }}
              >
                Clear
              </button>
            )}
          </div>

          {menuLoading ? (
            <div className="admin-loading-spinner-wrapper">
              <div className="menu-loading-spinner"></div>
            </div>
          ) : (
            <div className="admin-menu-items-list">
              {filteredMenuItems.length === 0 ? (
                <p className="admin-empty-state" style={{ padding: "20px 0" }}>No matching dishes found.</p>
              ) : (
                filteredMenuItems.map((item) => (
                  <div key={item.id} className="admin-menu-item-row">
                    <div className="admin-menu-item-info">
                      <h4>{item.name}</h4>
                      <p>
                        €{item.price.toFixed(2)} |{" "}
                        {categories.find((c) => c.id === item.categoryId)
                          ?.name || item.categoryId}
                      </p>
                    </div>
                    <div className="admin-menu-item-actions">
                      <button
                        onClick={() => toggleBestSeller(item)}
                        className={`admin-toggle-btn ${
                          item.isBestSeller ? "active" : ""
                        }`}
                        title="Toggle Best Seller"
                      >
                        ⭐
                      </button>
                      <button
                        onClick={() => toggleAvailable(item)}
                        className={`admin-toggle-btn ${
                          item.isAvailable ? "active-available" : ""
                        }`}
                      >
                        {item.isAvailable ? "Active" : "Sold Out"}
                      </button>
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="admin-delete-row-btn"
                        style={{ color: "var(--color-brand-gold)", marginRight: "4px" }}
                        title="Edit Dish"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleMenuItemDelete(item.id)}
                        className="admin-delete-row-btn"
                        title="Delete Dish"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Menu Settings Activity Logs Section */}
      <div className="admin-logs-section" style={{ marginTop: "40px" }}>
        <div className="admin-menu-list-header" style={{ marginBottom: "20px" }}>
          <h2>Recent Menu Activity Logs</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Track changes made to the menu, pricing, availability, and highlights (Rome/Italy time).
          </p>
        </div>

        {logsLoading ? (
          <div className="admin-loading-spinner-wrapper" style={{ padding: "20px" }}>
            <div className="menu-loading-spinner" style={{ width: "30px", height: "30px" }}></div>
          </div>
        ) : !menuLogs || menuLogs.length === 0 ? (
          <p className="admin-empty-state" style={{ padding: "20px 0" }}>No menu activities logged yet.</p>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-res-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Menu Item</th>
                  <th>Details of Changes</th>
                  <th>Admin User</th>
                  <th>Date &amp; Time (Italy Time)</th>
                </tr>
              </thead>
              <tbody>
                {[...menuLogs]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 15)
                  .map((log) => {
                    let badgeClass = "log-badge";
                    let actionLabel = log.action;
                    if (log.action === "add") {
                      badgeClass += " add";
                      actionLabel = "Added";
                    } else if (log.action === "update") {
                      badgeClass += " update";
                      actionLabel = "Updated";
                    } else if (log.action === "delete") {
                      badgeClass += " delete";
                      actionLabel = "Deleted";
                    } else if (log.action && log.action.startsWith("toggle")) {
                      badgeClass += " toggle";
                      actionLabel = log.action === "toggle_availability" ? "Availability" : log.action === "toggle_featured" ? "Featured" : "Best Seller";
                    }

                    const italyTime = log.createdAt
                      ? new Date(log.createdAt).toLocaleString("it-IT", {
                          timeZone: "Europe/Rome",
                          dateStyle: "short",
                          timeStyle: "medium",
                        })
                      : "";

                    return (
                      <tr key={log.id} className="admin-res-row">
                        <td>
                          <span className={badgeClass}>{actionLabel}</span>
                        </td>
                        <td>
                          <strong style={{ color: "var(--color-text)", fontWeight: "600" }}>{log.itemName}</strong>
                        </td>
                        <td style={{ color: "var(--color-text-secondary)", fontSize: "13px", maxWidth: "400px", wordBreak: "break-word" }}>
                          {log.details}
                        </td>
                        <td style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>
                          {log.userEmail}
                        </td>
                        <td style={{ color: "var(--color-brand-gold)", fontWeight: "500", whiteSpace: "nowrap" }}>
                          {italyTime}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
