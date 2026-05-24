import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCollection,
  useUpdateDocument,
  useDeleteDocument,
  useAddDocument,
} from "../hooks/useFirestore";
import { useAuth } from "../hooks/useAuth";
import {
  Calendar,
  Users,
  Clock,
  Plus,
  Trash2,
  Check,
  X,
  FileText,
  DollarSign,
  TrendingUp,
  Sliders,
  LogOut,
  PlusCircle,
  Eye,
  CheckCircle,
  AlertCircle,
  Database,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { fallbackData } from "../hooks/useFirestore";
import { processImageUpload } from "../utils/imageUtils";
import "../styles/admin.css";

export default function Admin() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("reservations");

  // Reservation list
  const { data: reservations, loading: resLoading } = useCollection(
    "reservations",
    { orderByField: "createdAt", realtime: true }
  );

  // Menu items list
  const { data: menuItems, loading: menuLoading } = useCollection("menuItems", {
    orderByField: "order",
  });

  // Categories list
  const { data: categories } = useCollection("menuCategories");

  // Actions
  const { updateDocument: updateRes } = useUpdateDocument("reservations");
  const { deleteDocument: deleteRes } = useDeleteDocument("reservations");
  const { updateDocument: updateMenuItem } = useUpdateDocument("menuItems");
  const { addDocument: addMenuItem } = useAddDocument("menuItems");
  const { deleteDocument: deleteMenuItem } = useDeleteDocument("menuItems");
  
  // Hero slides list & actions
  const { data: heroSlides, loading: heroLoading } = useCollection("heroSlides", { orderByField: "order", realtime: true });
  const { updateDocument: updateHeroSlide } = useUpdateDocument("heroSlides");
  const { addDocument: addHeroSlide } = useAddDocument("heroSlides");
  const { deleteDocument: deleteHeroSlide } = useDeleteDocument("heroSlides");

  // Promotions list & actions
  const { data: promotions, loading: promoLoading } = useCollection("promotions", { orderByField: "order", realtime: true });
  const { updateDocument: updatePromo } = useUpdateDocument("promotions");
  const { addDocument: addPromo } = useAddDocument("promotions");
  const { deleteDocument: deletePromo } = useDeleteDocument("promotions");

  // Reorder items using up/down arrows
  const handleMoveItem = async (index, direction, items, updateFn) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const currentItem = items[index];
    const swapItem = items[targetIndex];

    // Swap order values
    try {
      await updateFn(currentItem.id, { order: swapItem.order });
      await updateFn(swapItem.id, { order: currentItem.order });
    } catch (err) {
      console.error('Reorder error:', err);
    }
  };

  // Image Upload Handlers
  const [uploadingImage, setUploadingImage] = useState(false);
  const handleFileUpload = async (e, setFormState) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const base64Str = await processImageUpload(file);
      setFormState((prev) => ({ ...prev, imageUrl: base64Str }));
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // New Menu Item Form State
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    isBestSeller: false,
    isAvailable: true,
    imageUrl: "",
  });

  // New Hero Slide Form State
  const [newHeroSlide, setNewHeroSlide] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    ctaText: "",
    ctaLink: "",
    order: 0,
    active: true
  });

  // New Promotion Form State
  const [newPromotion, setNewPromotion] = useState({
    title: "",
    description: "",
    imageUrl: "",
    tag: "",
    link: "",
    order: 0,
    active: true
  });

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await login(username, password, rememberMe);
    } catch (err) {
      setLoginError("Invalid credentials. Please try again.");
    }
  };

  // Handle reservation action
  const handleResStatus = async (id, status) => {
    try {
      await updateRes(id, { status });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle reservation delete
  const handleResDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this reservation?")) {
      try {
        await deleteRes(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Toggle availability
  const toggleAvailable = async (item) => {
    try {
      await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle best seller
  const toggleBestSeller = async (item) => {
    try {
      await updateMenuItem(item.id, { isBestSeller: !item.isBestSeller });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Menu Item submission
  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      await addMenuItem({
        ...newItem,
        price: parseFloat(newItem.price),
        order: menuItems?.length || 0,
      });
      setNewItem({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        isBestSeller: false,
        isAvailable: true,
        imageUrl: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Menu Item delete
  const handleMenuItemDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        await deleteMenuItem(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Handle Menu Item Toggle Active
  const handleMenuItemToggle = async (id, currentStatus) => {
    try {
      await updateMenuItem(id, { isAvailable: !currentStatus });
    } catch (err) {
      console.error(err);
    }
  };

  // --- Hero Actions ---
  const handleAddHeroSlide = async (e) => {
    e.preventDefault();
    try {
      const minOrder = heroSlides?.length > 0 ? Math.min(...heroSlides.map(s => s.order || 0)) : 0;
      await addHeroSlide({
        ...newHeroSlide,
        order: minOrder - 1,
      });
      setNewHeroSlide({ title: "", subtitle: "", imageUrl: "", ctaText: "", ctaLink: "", order: 0, active: true });
    } catch (err) { console.error(err); }
  };

  const handleHeroSlideDelete = async (id) => {
    if (window.confirm("Delete this hero slide?")) {
      try { await deleteHeroSlide(id); } catch (err) { console.error(err); }
    }
  };

  const handleHeroSlideToggle = async (id, currentStatus) => {
    try { await updateHeroSlide(id, { active: !currentStatus }); } catch (err) { console.error(err); }
  };

  // --- Promo Actions ---
  const handleAddPromotion = async (e) => {
    e.preventDefault();
    try {
      const minOrder = promotions?.length > 0 ? Math.min(...promotions.map(s => s.order || 0)) : 0;
      await addPromo({
        ...newPromotion,
        order: minOrder - 1,
      });
      setNewPromotion({ title: "", description: "", imageUrl: "", tag: "", link: "", order: 0, active: true });
    } catch (err) { console.error(err); }
  };

  const handlePromoDelete = async (id) => {
    if (window.confirm("Delete this promotion?")) {
      try { await deletePromo(id); } catch (err) { console.error(err); }
    }
  };

  const handlePromoToggle = async (id, currentStatus) => {
    try { await updatePromo(id, { active: !currentStatus }); } catch (err) { console.error(err); }
  };

  const [seeding, setSeeding] = useState(false);

  const handleSeedDatabase = async () => {
    if (
      !window.confirm(
        "Do you want to populate the Firestore database with demo menu data, categories, and promotional slides?"
      )
    ) {
      return;
    }
    setSeeding(true);
    try {
      // 1. Add categories
      for (const cat of fallbackData.menuCategories) {
        await setDoc(doc(db, "menuCategories", cat.id), cat);
      }
      // 2. Add menu items
      for (const item of fallbackData.menuItems) {
        await setDoc(doc(db, "menuItems", item.id), item);
      }
      // 3. Add hero slides
      for (const slide of fallbackData.heroSlides) {
        await setDoc(doc(db, "heroSlides", slide.id), slide);
      }
      // 4. Add promotions
      for (const promo of fallbackData.promotions) {
        await setDoc(doc(db, "promotions", promo.id), promo);
      }
      alert("Database populated successfully! Reload the page.");
    } catch (err) {
      console.error(err);
      alert("Seeding error: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  if (authLoading) {
    return (
      <div className="admin-loading-container">
        <div className="menu-loading-spinner"></div>
      </div>
    );
  }

  // Not logged in: Show premium login form
  if (!user) {
    return (
      <div className="admin-login-page">
        <motion.div
          className="admin-login-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src="/images/logo-white.avif"
            alt="Kyō-To Sushi Catania"
            className="admin-login-logo"
          />
          <h2>Admin Control Panel</h2>
          <p>Enter your credentials to access the admin area</p>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g. kyotoadmin"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <div className="form-row-checkboxes">
              <label className="checkbox-label" style={{ justifyContent: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember Login</span>
              </label>
            </div>
            {loginError && <div className="form-error">{loginError}</div>}
            <button type="submit" className="admin-login-btn">
              Log In
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Logged in: Show beautiful admin dashboard
  return (
    <div className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user.username || user.email}</p>
        </div>
        <button onClick={logout} className="admin-logout-btn">
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </header>

      {/* Summary statistics */}
      <section className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon gold">
            <Calendar size={24} />
          </div>
          <div>
            <h3>Total Reservations</h3>
            <p className="admin-stat-num">{reservations.length}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <Users size={24} />
          </div>
          <div>
            <h3>Pending</h3>
            <p className="admin-stat-num">
              {reservations.filter((r) => r.status === "pending").length}
            </p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div>
            <h3>Confirmed</h3>
            <p className="admin-stat-num">
              {reservations.filter((r) => r.status === "confirmed").length}
            </p>
          </div>
        </div>
      </section>

      {/* Navigation tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === "reservations" ? "active" : ""}`}
          onClick={() => setActiveTab("reservations")}
        >
          <Calendar size={18} />
          <span>Reservations</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "hero" ? "active" : ""}`}
          onClick={() => setActiveTab("hero")}
        >
          <Sliders size={18} />
          <span>Hero Settings</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "promotions" ? "active" : ""}`}
          onClick={() => setActiveTab("promotions")}
        >
          <AlertCircle size={18} />
          <span>Promotions</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "menu" ? "active" : ""}`}
          onClick={() => setActiveTab("menu")}
        >
          <FileText size={18} />
          <span>Menu Settings</span>
        </button>
      </div>

      <main className="admin-tab-content">
        <AnimatePresence mode="wait">
          {activeTab === "reservations" && (
            <motion.div
              key="reservations"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <h2>Reservation Requests</h2>
              {resLoading ? (
                <p>Loading reservations...</p>
              ) : reservations.length === 0 ? (
                <p className="admin-empty-state">No reservations found.</p>
              ) : (
                <div className="admin-res-list">
                  {reservations.map((res) => (
                    <div
                      key={res.id}
                      className={`admin-res-card status-${res.status}`}
                    >
                      <div className="admin-res-card-info">
                        <div className="admin-res-card-header">
                          <h3>{res.name}</h3>
                          <span className={`status-badge ${res.status}`}>
                            {res.status === "pending" && "Pending"}
                            {res.status === "confirmed" && "Confirmed"}
                            {res.status === "cancelled" && "Cancelled"}
                          </span>
                        </div>
                        <div className="admin-res-details">
                          <span>
                            <Calendar size={14} /> {res.date}
                          </span>
                          <span>
                            <Clock size={14} /> {res.time}
                          </span>
                          <span>
                            <Users size={14} /> {res.partySize} guests
                          </span>
                        </div>
                        <div className="admin-res-contact">
                          <p>Phone: {res.phone}</p>
                          <p>Email: {res.email}</p>
                          {res.notes && (
                            <p className="admin-res-notes">
                              <strong>Note:</strong> {res.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="admin-res-actions">
                        {res.status !== "confirmed" && (
                          <button
                            onClick={() => handleResStatus(res.id, "confirmed")}
                            className="admin-res-btn confirm"
                            title="Confirm"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        {res.status !== "cancelled" && (
                          <button
                            onClick={() => handleResStatus(res.id, "cancelled")}
                            className="admin-res-btn cancel"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleResDelete(res.id)}
                          className="admin-res-btn delete"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="admin-menu-manager"
            >
              <div className="admin-menu-split">
                {/* Form to add item */}
                <div className="admin-menu-form-container">
                  <h2>Add New Dish</h2>
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
                        <label>Price (€) *</label>
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
                    </div>

                    <button type="submit" className="admin-add-item-btn">
                      <PlusCircle size={16} />
                      <span>Add to Menu</span>
                    </button>
                  </form>
                </div>

                {/* List of items */}
                <div className="admin-menu-list-container">
                  <div className="admin-menu-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Manage Existing Dishes</h2>
                    <button 
                      onClick={handleSeedDatabase} 
                      disabled={seeding}
                      className="admin-toggle-btn active"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 12px' }}
                    >
                      <Database size={14} />
                      <span>{seeding ? "Importing..." : "Import Demo Menu"}</span>
                    </button>
                  </div>
                  {menuLoading ? (
                    <p>Loading dishes...</p>
                  ) : (
                    <div className="admin-menu-items-list">
                      {menuItems.map((item) => (
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
                              onClick={() => handleMenuItemDelete(item.id)}
                              className="admin-delete-row-btn"
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
          )}

          {activeTab === "hero" && (
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
                  <h2>Add New Slide</h2>
                  <form onSubmit={handleAddHeroSlide} className="admin-menu-form">
                    <div className="form-group">
                      <label>Title *</label>
                      <input type="text" value={newHeroSlide.title} onChange={(e) => setNewHeroSlide((p) => ({ ...p, title: e.target.value }))} required placeholder="Es: Summer Specials" />
                    </div>
                    <div className="form-group">
                      <label>Subtitle</label>
                      <input type="text" value={newHeroSlide.subtitle} onChange={(e) => setNewHeroSlide((p) => ({ ...p, subtitle: e.target.value }))} placeholder="Discover our new dishes..." />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>CTA Text</label>
                        <input type="text" value={newHeroSlide.ctaText} onChange={(e) => setNewHeroSlide((p) => ({ ...p, ctaText: e.target.value }))} placeholder="Es: View Menu" />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: "16px" }}>
                      <label>Media (Image/Video URL or Upload) *</label>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <input type="text" value={newHeroSlide.imageUrl} onChange={(e) => setNewHeroSlide((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="/images/hero-1.avif or .mp4 link" style={{ flex: 1, margin: 0 }} required={!newHeroSlide.imageUrl} />
                        <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>OR</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewHeroSlide)} disabled={uploadingImage} style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} />
                      </div>
                      {uploadingImage && <small style={{ color: "var(--color-brand-gold)", display: "block", marginTop: "8px" }}>Compressing image...</small>}
                    </div>
                    <div className="form-row-checkboxes">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={newHeroSlide.active} onChange={(e) => setNewHeroSlide((p) => ({ ...p, active: e.target.checked }))} />
                        <span>Active</span>
                      </label>
                    </div>
                    <button type="submit" className="admin-add-item-btn">
                      <PlusCircle size={16} />
                      <span>Add Slide</span>
                    </button>
                  </form>
                </div>

                <div className="admin-menu-list-container">
                  <div className="admin-menu-list-header">
                    <h2>Manage Existing Slides</h2>
                  </div>
                  {heroLoading ? <p>Loading slides...</p> : (
                    <div className="admin-menu-items-list">
                      {heroSlides.map((slide, index) => (
                        <div key={slide.id} className="admin-menu-item-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="admin-reorder-btns">
                              <button
                                className="admin-reorder-btn"
                                onClick={() => handleMoveItem(index, 'up', heroSlides, updateHeroSlide)}
                                disabled={index === 0}
                                title="Move up"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                className="admin-reorder-btn"
                                onClick={() => handleMoveItem(index, 'down', heroSlides, updateHeroSlide)}
                                disabled={index === heroSlides.length - 1}
                                title="Move down"
                              >
                                <ChevronDown size={14} />
                              </button>
                            </div>
                            <div className="admin-menu-item-info">
                              <h4>{slide.title}</h4>
                              <p>{slide.subtitle}</p>
                            </div>
                          </div>
                          <div className="admin-menu-item-actions">
                            <button onClick={() => handleHeroSlideToggle(slide.id, slide.active)} className={`admin-toggle-btn ${slide.active ? "active-available" : ""}`}>
                              {slide.active ? "Active" : "Hidden"}
                            </button>
                            <button onClick={() => handleHeroSlideDelete(slide.id)} className="admin-delete-row-btn">
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
          )}

          {activeTab === "promotions" && (
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
                      <input type="text" value={newPromotion.title} onChange={(e) => setNewPromotion((p) => ({ ...p, title: e.target.value }))} required placeholder="Es: Lunch Special" />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea value={newPromotion.description} onChange={(e) => setNewPromotion((p) => ({ ...p, description: e.target.value }))} placeholder="Details about the offer..." rows={2} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Tag (Badge Text)</label>
                        <input type="text" value={newPromotion.tag} onChange={(e) => setNewPromotion((p) => ({ ...p, tag: e.target.value }))} placeholder="Es: 15% OFF" />
                      </div>
                      <div className="form-group">
                        <label>Optional Link</label>
                        <input type="text" value={newPromotion.link || ''} onChange={(e) => setNewPromotion((p) => ({ ...p, link: e.target.value }))} placeholder="/menu or https://..." />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: "16px" }}>
                      <label>Media (Image/Video URL or Upload) *</label>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <input type="text" value={newPromotion.imageUrl} onChange={(e) => setNewPromotion((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="/images/promo-1.avif or .mp4 link" style={{ flex: 1, margin: 0 }} required={!newPromotion.imageUrl} />
                        <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>OR</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setNewPromotion)} disabled={uploadingImage} style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} />
                      </div>
                      {uploadingImage && <small style={{ color: "var(--color-brand-gold)", display: "block", marginTop: "8px" }}>Compressing image...</small>}
                    </div>
                    <div className="form-row-checkboxes">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={newPromotion.active} onChange={(e) => setNewPromotion((p) => ({ ...p, active: e.target.checked }))} />
                        <span>Active</span>
                      </label>
                    </div>
                    <button type="submit" className="admin-add-item-btn">
                      <PlusCircle size={16} />
                      <span>Add Promotion</span>
                    </button>
                  </form>
                </div>

                <div className="admin-menu-list-container">
                  <div className="admin-menu-list-header">
                    <h2>Manage Promotions</h2>
                  </div>
                  {promoLoading ? <p>Loading promotions...</p> : (
                    <div className="admin-menu-items-list">
                      {promotions.map((promo, index) => (
                        <div key={promo.id} className="admin-menu-item-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="admin-reorder-btns">
                              <button
                                className="admin-reorder-btn"
                                onClick={() => handleMoveItem(index, 'up', promotions, updatePromo)}
                                disabled={index === 0}
                                title="Move up"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                className="admin-reorder-btn"
                                onClick={() => handleMoveItem(index, 'down', promotions, updatePromo)}
                                disabled={index === promotions.length - 1}
                                title="Move down"
                              >
                                <ChevronDown size={14} />
                              </button>
                            </div>
                            <div className="admin-menu-item-info">
                              <h4>{promo.title} {promo.tag && <span style={{fontSize:'10px', background:'var(--color-brand-gold)', padding:'2px 6px', borderRadius:'4px', color:'#000'}}>{promo.tag}</span>}</h4>
                              <p>{promo.description}</p>
                            </div>
                          </div>
                          <div className="admin-menu-item-actions">
                            <button onClick={() => handlePromoToggle(promo.id, promo.active)} className={`admin-toggle-btn ${promo.active ? "active-available" : ""}`}>
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
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
