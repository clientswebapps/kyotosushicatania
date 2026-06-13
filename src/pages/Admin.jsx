import { useState, useMemo } from "react";
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
  ChevronDown,
  Edit,
  Search
} from "lucide-react";
import { collection, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
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

  // Reservation filter and search states
  const [resSearch, setResSearch] = useState("");
  const [resDateFilter, setResDateFilter] = useState("");
  const [resPartyFilter, setResPartyFilter] = useState("");
  const [resStatusTab, setResStatusTab] = useState("pending");
  const [deletingResId, setDeletingResId] = useState(null);

  // Reservation list
  const { data: reservations, loading: resLoading } = useCollection(
    "reservations",
    { orderByField: "createdAt", realtime: true }
  );

  // Filtered reservations based on search text, date, party size, and status tab
  const filteredReservations = useMemo(() => {
    if (!reservations) return [];
    
    let list = [...reservations];
    
    // Sort chronologically by dinner reservation date & time
    list.sort((a, b) => {
      if (a.date !== b.date) {
        return (a.date || "").localeCompare(b.date || "");
      }
      return (a.time || "").localeCompare(b.time || "");
    });

    return list.filter((res) => {
      // 1. Status Tab filter
      if (resStatusTab !== "all" && res.status !== resStatusTab) {
        return false;
      }
      
      // 2. Search Text filter (matches name, email, phone, or notes)
      if (resSearch.trim()) {
        const query = resSearch.toLowerCase();
        const nameMatch = res.name?.toLowerCase().includes(query);
        const emailMatch = res.email?.toLowerCase().includes(query);
        const phoneMatch = res.phone?.toLowerCase().includes(query);
        const notesMatch = res.notes?.toLowerCase().includes(query);
        if (!nameMatch && !emailMatch && !phoneMatch && !notesMatch) {
          return false;
        }
      }
      
      // 3. Date filter
      if (resDateFilter) {
        if (res.date !== resDateFilter) {
          return false;
        }
      }
      
      // 4. Party Size filter
      if (resPartyFilter) {
        if (resPartyFilter === "11") {
          if (Number(res.partySize) <= 10) return false;
        } else {
          if (Number(res.partySize) !== Number(resPartyFilter)) return false;
        }
      }
      
      return true;
    });
  }, [reservations, resStatusTab, resSearch, resDateFilter, resPartyFilter]);

  // Menu items list
  const { data: menuItems, loading: menuLoading } = useCollection("menuItems", {
    orderByField: "order",
    realtime: true,
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

  // Gallery list & actions
  const { data: galleryItems, loading: galleryLoading } = useCollection("galleryItems", { orderByField: "order", realtime: true });
  const { updateDocument: updateGalleryItem } = useUpdateDocument("galleryItems");
  const { addDocument: addGalleryItem } = useAddDocument("galleryItems");
  const { deleteDocument: deleteGalleryItem } = useDeleteDocument("galleryItems");

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
  // Image/Video Upload Handlers (Firebase Storage with base64 fallback)
  const [uploadingImage, setUploadingImage] = useState(false);
  const handleFileUpload = async (e, setFormState) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const MAX_SIZE = isImage ? 2 * 1024 * 1024 : 10 * 1024 * 1024;
    
    if (file.size > MAX_SIZE) {
      alert(`File is too large! Max ${isImage ? '2MB' : '10MB'} allowed.`);
      return;
    }

    try {
      setUploadingImage(true);
      
      if (storage) {
        let fileToUpload = file;
        let fileName = `${Date.now()}_${file.name}`;
        
        if (isImage) {
          try {
            const compressedBase64 = await processImageUpload(file);
            const resBlob = await fetch(compressedBase64).then(r => r.blob());
            fileToUpload = resBlob;
            const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            fileName = `${Date.now()}_${cleanName}.webp`;
          } catch (compressErr) {
            console.error("Compression failed, using original file:", compressErr);
          }
        }
        
        const storageRef = ref(storage, `uploads/${fileName}`);
        const metadata = {
          contentType: fileToUpload.type || file.type,
          cacheControl: "public, max-age=31536000"
        };
        const uploadResult = await uploadBytes(storageRef, fileToUpload, metadata);
        const downloadUrl = await getDownloadURL(uploadResult.ref);
        
        setFormState((prev) => ({ ...prev, imageUrl: downloadUrl }));
      } else {
        // Fallback: local/mock data-URL encoding
        if (isImage) {
          const base64Str = await processImageUpload(file);
          setFormState((prev) => ({ ...prev, imageUrl: base64Str }));
        } else {
          // Video fallback
          const reader = new FileReader();
          reader.onload = (event) => {
            setFormState((prev) => ({ ...prev, imageUrl: event.target.result }));
          };
          reader.readAsDataURL(file);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [savingMenuItem, setSavingMenuItem] = useState(false);
  const [savingHeroSlide, setSavingHeroSlide] = useState(false);
  const [savingPromo, setSavingPromo] = useState(false);

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

  // New Menu Item Form State
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    isBestSeller: false,
    isFeatured: false,
    isAvailable: true,
    imageUrl: "",
    highlights: [],
  });

  const [editingItemId, setEditingItemId] = useState(null);

  // New Hero Slide Form State
  const [newHeroSlide, setNewHeroSlide] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    ctaText: "",
    ctaLink: "",
    duration: 5,
    order: 0,
    active: true
  });

  const [editingHeroSlideId, setEditingHeroSlideId] = useState(null);

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

  const [savingGalleryItem, setSavingGalleryItem] = useState(false);
  const [editingGalleryItemId, setEditingGalleryItemId] = useState(null);

  // New Gallery Item Form State
  const [newGalleryItem, setNewGalleryItem] = useState({
    title: "",
    imageUrl: "",
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

  // Handle reservation delete with inline custom confirmation
  const handleResDelete = async (id) => {
    if (deletingResId === id) {
      try {
        await deleteRes(id);
        setDeletingResId(null);
      } catch (err) {
        console.error(err);
      }
    } else {
      setDeletingResId(id);
      // Auto-reset delete state after 4 seconds
      setTimeout(() => {
        setDeletingResId((prev) => (prev === id ? null : prev));
      }, 4000);
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

  // Toggle featured on homepage
  const toggleFeatured = async (item) => {
    try {
      await updateMenuItem(item.id, { isFeatured: !item.isFeatured });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Menu Item submission (Add or Update)
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
        await updateMenuItem(editingItemId, payload);
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
      }

      setNewItem({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        categoryId: "",
        isBestSeller: false,
        isFeatured: false,
        isAvailable: true,
        imageUrl: "",
        highlights: [],
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
      isFeatured: !!item.isFeatured,
      isAvailable: item.isAvailable !== undefined ? !!item.isAvailable : true,
      imageUrl: item.imageUrl || "",
      highlights: Array.isArray(item.highlights) ? item.highlights : [],
    });
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
        const minOrder = heroSlides?.length > 0 ? Math.min(...heroSlides.map(s => s.order || 0)) : 0;
        await addHeroSlide({
          ...payload,
          order: minOrder - 1,
        });
      }
      setNewHeroSlide({ title: "", subtitle: "", imageUrl: "", ctaText: "", ctaLink: "", duration: 5, order: 0, active: true });
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
      active: slide.active !== undefined ? !!slide.active : true
    });
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
    setSavingPromo(true);
    try {
      if (promotions && promotions.length >= 5) {
        alert("Promotions are already full (maximum 5 promos). You need to remove 1 item to continue.");
        return;
      }
      const minOrder = promotions?.length > 0 ? Math.min(...promotions.map(s => s.order || 0)) : 0;
      await addPromo({
        ...newPromotion,
        order: minOrder - 1,
      });
      setNewPromotion({ title: "", description: "", imageUrl: "", tag: "", link: "", order: 0, active: true });
    } catch (err) { 
      console.error(err); 
    } finally {
      setSavingPromo(false);
    }
  };

  const handlePromoDelete = async (id) => {
    if (window.confirm("Delete this promotion?")) {
      try { await deletePromo(id); } catch (err) { console.error(err); }
    }
  };

  const handlePromoToggle = async (id, currentStatus) => {
    try { await updatePromo(id, { active: !currentStatus }); } catch (err) { console.error(err); }
  };

  // --- Gallery Actions ---
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
        const minOrder = galleryItems?.length > 0 ? Math.min(...galleryItems.map(s => s.order || 0)) : 0;
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
      active: item.active !== undefined ? !!item.active : true
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
      // 5. Add gallery items
      if (fallbackData.galleryItems) {
        for (const item of fallbackData.galleryItems) {
          await setDoc(doc(db, "galleryItems", item.id), item);
        }
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
        <button
          className={`admin-tab-btn ${activeTab === "gallery" ? "active" : ""}`}
          onClick={() => setActiveTab("gallery")}
        >
          <Eye size={18} />
          <span>Gallery Settings</span>
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
              <div className="admin-res-header-row">
                <h2>Reservation Requests</h2>
                
                {/* Database Seeding fallback button if DB is empty */}
                {reservations.length === 0 && !resLoading && (
                  <button onClick={handleSeedDatabase} className="btn-seed-db" disabled={seeding}>
                    {seeding ? "Seeding..." : "Seed Database"}
                  </button>
                )}
              </div>

              {/* Advanced Filter Panel */}
              <div className="admin-res-filters-panel">
                <div className="res-filter-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={resSearch}
                    onChange={(e) => setResSearch(e.target.value)}
                  />
                  {resSearch && (
                    <button className="clear-filter-btn" onClick={() => setResSearch("")}>
                      &times;
                    </button>
                  )}
                </div>

                <div className="res-filter-date">
                  <Calendar size={16} />
                  <input
                    type="date"
                    value={resDateFilter}
                    onChange={(e) => setResDateFilter(e.target.value)}
                  />
                  {resDateFilter && (
                    <button className="clear-filter-btn" onClick={() => setResDateFilter("")}>
                      &times;
                    </button>
                  )}
                </div>

                <div className="res-filter-party">
                  <Users size={16} />
                  <select
                    value={resPartyFilter}
                    onChange={(e) => setResPartyFilter(e.target.value)}
                  >
                    <option value="">Any Guest Size</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                    <option value="11">10+ guests</option>
                  </select>
                  {resPartyFilter && (
                    <button className="clear-filter-btn" onClick={() => setResPartyFilter("")}>
                      &times;
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-tabs for Reservation Statuses */}
              <div className="admin-res-subtabs">
                {[
                  { id: "pending", label: "Pending Requests" },
                  { id: "confirmed", label: "Confirmed" },
                  { id: "cancelled", label: "Cancelled" },
                  { id: "all", label: "All Reservations" },
                ].map((tab) => {
                  const count = reservations.filter((r) => tab.id === "all" || r.status === tab.id).length;
                  return (
                    <button
                      key={tab.id}
                      className={`admin-res-subtab-btn ${resStatusTab === tab.id ? "active" : ""}`}
                      onClick={() => {
                        setResStatusTab(tab.id);
                        setDeletingResId(null);
                      }}
                    >
                      <span>{tab.label}</span>
                      <span className="res-badge-count">{count}</span>
                    </button>
                  );
                })}
              </div>

              {resLoading ? (
                <div className="admin-loading-spinner-wrapper">
                  <div className="menu-loading-spinner"></div>
                </div>
              ) : filteredReservations.length === 0 ? (
                <p className="admin-empty-state">No reservations found.</p>
              ) : (
                <div className="admin-table-responsive">
                  <table className="admin-res-table">
                    <thead>
                      <tr>
                        <th>Customer / Note</th>
                        <th>Contact Details</th>
                        <th>Date &amp; Time</th>
                        <th>Guests</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations.map((res) => (
                        <tr key={res.id} className={`admin-res-row status-${res.status}`}>
                          <td>
                            <div className="res-customer-info">
                              <span className="res-customer-name">{res.name}</span>
                              {res.notes && (
                                <span className="res-note-tooltip-trigger" title={res.notes}>
                                  📝 Note
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="res-contact-details">
                              <a href={`tel:${res.phone}`} className="res-contact-link">{res.phone}</a>
                              <a href={`mailto:${res.email}`} className="res-contact-link secondary">{res.email}</a>
                            </div>
                          </td>
                          <td>
                            <div className="res-datetime">
                              <span className="res-date">{res.date}</span>
                              <span className="res-time">{res.time}</span>
                            </div>
                          </td>
                          <td>
                            <span className="res-party-badge">{res.partySize} guests</span>
                          </td>
                          <td>
                            <span className={`status-badge ${res.status}`}>
                              {res.status === "pending" && "Pending"}
                              {res.status === "confirmed" && "Confirmed"}
                              {res.status === "cancelled" && "Cancelled"}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="admin-res-actions justify-end">
                              {res.status !== "confirmed" && (
                                <button
                                  onClick={() => handleResStatus(res.id, "confirmed")}
                                  className="admin-res-btn confirm"
                                  title="Confirm Reservation"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              {res.status !== "cancelled" && (
                                <button
                                  onClick={() => handleResStatus(res.id, "cancelled")}
                                  className="admin-res-btn cancel"
                                  title="Cancel Reservation"
                                >
                                  <X size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => handleResDelete(res.id)}
                                className={`admin-res-btn delete ${deletingResId === res.id ? "confirming" : ""}`}
                                title={deletingResId === res.id ? "Confirm Delete" : "Delete Reservation"}
                              >
                                {deletingResId === res.id ? (
                                  <span className="delete-confirm-text">Confirm?</span>
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                          onChange={(e) => handleFileUpload(e, setNewItem)}
                          disabled={uploadingImage}
                          style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }}
                        />
                      </div>
                      {uploadingImage && <small style={{ color: "var(--color-brand-gold)", display: "block", marginTop: "8px" }}>Processing media file...</small>}
                      <small style={{ color: 'var(--color-text-secondary)', fontSize: '11px', marginTop: '6px', display: 'block' }}>
                        Max file size: 2MB for images (auto-compressed to WebP), 10MB for videos.
                      </small>
                    </div>

                    <div className="form-group" style={{ marginTop: '8px' }}>
                      <label style={{ marginBottom: '8px', display: 'block' }}>Dish Badges / Highlights (Presets)</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        {[
                          "👨‍🍳 Chef's Pick",
                          "🐟 4 Fish Types",
                          "🔥 Top Seller",
                          "🥑 Fresh Avocado"
                        ].map((badge) => {
                          const isSelected = newItem.highlights?.includes(badge);
                          return (
                            <button
                              type="button"
                              key={badge}
                              onClick={() => {
                                setNewItem(prev => {
                                  const highlights = prev.highlights || [];
                                  if (highlights.includes(badge)) {
                                    return { ...prev, highlights: highlights.filter(h => h !== badge) };
                                  } else {
                                    return { ...prev, highlights: [...highlights, badge] };
                                  }
                                });
                              }}
                              className={`admin-toggle-btn ${isSelected ? "active" : ""}`}
                              style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
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
                        value={(newItem.highlights || []).filter(h => ![
                          "👨‍🍳 Chef's Pick",
                          "🐟 4 Fish Types",
                          "🔥 Top Seller",
                          "🥑 Fresh Avocado"
                        ].includes(h)).join(", ")}
                        onChange={(e) => {
                          const val = e.target.value;
                          const customTags = val.split(",")
                            .map(s => s.trim())
                            .filter(s => s.length > 0);
                          const currentPresets = (newItem.highlights || []).filter(h => [
                            "👨‍🍳 Chef's Pick",
                            "🐟 4 Fish Types",
                            "🔥 Top Seller",
                            "🥑 Fresh Avocado"
                          ].includes(h));
                          setNewItem(prev => ({
                            ...prev,
                            highlights: [...currentPresets, ...customTags]
                          }));
                        }}
                        placeholder="Es: 🍤 Crispy, ✨ Premium, 🌶️ Spicy"
                      />
                      <small style={{ color: 'var(--color-text-secondary)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
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
                          checked={newItem.isFeatured}
                          onChange={(e) =>
                            setNewItem((p) => ({
                              ...p,
                              isFeatured: e.target.checked,
                            }))
                          }
                        />
                        <span>Feature on Homepage</span>
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button type="submit" className="admin-add-item-btn" style={{ flex: 1 }} disabled={savingMenuItem || uploadingImage}>
                        {savingMenuItem ? (
                          <div className="admin-spinner" style={{ marginRight: '6px' }}></div>
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
                              isFeatured: false,
                              isAvailable: true,
                              imageUrl: "",
                              highlights: [],
                            });
                          }}
                          style={{ margin: 0, padding: '14px' }}
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
                  <div className="admin-menu-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Manage Existing Dishes</h2>
                    <button 
                      onClick={handleSeedDatabase} 
                      disabled={seeding}
                      className="admin-toggle-btn active"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 12px' }}
                    >
                      {seeding ? (
                        <div className="admin-spinner" style={{ width: '12px', height: '12px' }}></div>
                      ) : (
                        <Database size={14} />
                      )}
                      <span>{seeding ? "Importing..." : "Import Demo Menu"}</span>
                    </button>
                  </div>

                  {/* Search Bar for Dishes list */}
                  <div className="admin-search-wrapper" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                      <input
                        type="text"
                        placeholder="Search dishes by name or description..."
                        value={menuSearchQuery}
                        onChange={(e) => setMenuSearchQuery(e.target.value)}
                        className="admin-search-input"
                        style={{ paddingLeft: '36px', width: '100%' }}
                      />
                    </div>
                    {menuSearchQuery && (
                      <button
                        onClick={() => setMenuSearchQuery("")}
                        className="admin-toggle-btn"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px' }}
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
                        <p className="admin-empty-state" style={{ padding: '20px 0' }}>No matching dishes found.</p>
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
                                onClick={() => toggleFeatured(item)}
                                className={`admin-toggle-btn ${
                                  item.isFeatured ? "active" : ""
                                }`}
                                title="Toggle Featured on Homepage"
                              >
                                🏠
                              </button>
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
                                style={{ color: 'var(--color-brand-gold)', marginRight: '4px' }}
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
                  <h2>{editingHeroSlideId ? "Edit Slide" : "Add New Slide"}</h2>
                  <form onSubmit={handleAddHeroSlide} className="admin-menu-form">
                    <div className="form-group">
                      <label>Title *</label>
                      <input type="text" value={newHeroSlide.title} onChange={(e) => setNewHeroSlide((p) => ({ ...p, title: e.target.value }))} required placeholder="Es: Summer Specials" />
                      <small style={{ color: 'var(--color-text-secondary)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                        Use double asterisks to highlight text in gold (e.g. <code>Welcome to **Kyō-To**</code>)
                      </small>
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
                      <div className="form-group">
                        <label>Redirect Link (CTA Link)</label>
                        <input type="text" value={newHeroSlide.ctaLink} onChange={(e) => setNewHeroSlide((p) => ({ ...p, ctaLink: e.target.value }))} placeholder="Es: /menu" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Slide Duration (Seconds)</label>
                      <input type="number" min="1" max="60" value={newHeroSlide.duration} onChange={(e) => setNewHeroSlide((p) => ({ ...p, duration: Number(e.target.value) }))} placeholder="5" />
                    </div>
                    <div className="form-group" style={{ marginBottom: "16px" }}>
                      <label>Media (Image/Video URL or Upload) *</label>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <input type="text" value={newHeroSlide.imageUrl} onChange={(e) => setNewHeroSlide((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="/images/hero-1.avif or .mp4 link" style={{ flex: 1, margin: 0 }} required={!newHeroSlide.imageUrl} />
                        <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>OR</span>
                        <input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, setNewHeroSlide)} disabled={uploadingImage} style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} />
                      </div>
                      {uploadingImage && <small style={{ color: "var(--color-brand-gold)", display: "block", marginTop: "8px" }}>Processing media file...</small>}
                      <small style={{ color: 'var(--color-text-secondary)', fontSize: '11px', marginTop: '6px', display: 'block' }}>
                        Max file size: 2MB for images (auto-compressed to WebP), 10MB for videos.
                      </small>
                    </div>
                    <div className="form-row-checkboxes">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={newHeroSlide.active} onChange={(e) => setNewHeroSlide((p) => ({ ...p, active: e.target.checked }))} />
                        <span>Active</span>
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button type="submit" className="admin-add-item-btn" style={{ flex: 1 }} disabled={savingHeroSlide || uploadingImage}>
                        {savingHeroSlide ? (
                          <div className="admin-spinner" style={{ marginRight: '6px' }}></div>
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
                            setNewHeroSlide({ title: "", subtitle: "", imageUrl: "", ctaText: "", ctaLink: "", duration: 5, order: 0, active: true });
                          }}
                          style={{ margin: 0, padding: '14px' }}
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
                              <p>{slide.subtitle || "(No subtitle)"} | ⏱️ {slide.duration || 5}s</p>
                            </div>
                          </div>
                          <div className="admin-menu-item-actions">
                            <button onClick={() => handleHeroSlideToggle(slide.id, slide.active)} className={`admin-toggle-btn ${slide.active ? "active-available" : ""}`}>
                              {slide.active ? "Active" : "Hidden"}
                            </button>
                            <button onClick={() => handleStartHeroEdit(slide)} className="admin-delete-row-btn" style={{ color: 'var(--color-brand-gold)', marginRight: '4px' }} title="Edit Slide">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleHeroSlideDelete(slide.id)} className="admin-delete-row-btn" title="Delete Slide">
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
                        <input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, setNewPromotion)} disabled={uploadingImage} style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} />
                      </div>
                      {uploadingImage && <small style={{ color: "var(--color-brand-gold)", display: "block", marginTop: "8px" }}>Processing media file...</small>}
                      <small style={{ color: 'var(--color-text-secondary)', fontSize: '11px', marginTop: '6px', display: 'block' }}>
                        Max file size: 2MB for images (auto-compressed to WebP), 10MB for videos.
                      </small>
                    </div>
                    <div className="form-row-checkboxes">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={newPromotion.active} onChange={(e) => setNewPromotion((p) => ({ ...p, active: e.target.checked }))} />
                        <span>Active</span>
                      </label>
                    </div>
                    <button type="submit" className="admin-add-item-btn" disabled={savingPromo || uploadingImage}>
                      {savingPromo ? (
                        <div className="admin-spinner" style={{ marginRight: '6px' }}></div>
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

          {activeTab === "gallery" && (
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
                  <h2>{editingGalleryItemId ? `Edit Gallery Item` : "Add New Gallery Item"}</h2>
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
                          onChange={(e) => handleFileUpload(e, setNewGalleryItem)} 
                          disabled={uploadingImage} 
                          style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} 
                        />
                      </div>
                      {uploadingImage && <small style={{ color: "var(--color-brand-gold)", display: "block", marginTop: "8px" }}>Processing media file...</small>}
                      <small style={{ color: 'var(--color-text-secondary)', fontSize: '11px', marginTop: '6px', display: 'block' }}>
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

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button type="submit" className="admin-add-item-btn" style={{ flex: 1 }} disabled={savingGalleryItem || uploadingImage}>
                        {savingGalleryItem ? (
                          <div className="admin-spinner" style={{ marginRight: '6px' }}></div>
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
                          style={{ margin: 0, padding: '14px' }}
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="admin-reorder-btns">
                              <button
                                className="admin-reorder-btn"
                                onClick={() => handleMoveItem(index, 'up', galleryItems, updateGalleryItem)}
                                disabled={index === 0}
                                title="Move up"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                className="admin-reorder-btn"
                                onClick={() => handleMoveItem(index, 'down', galleryItems, updateGalleryItem)}
                                disabled={index === galleryItems.length - 1}
                                title="Move down"
                              >
                                <ChevronDown size={14} />
                              </button>
                            </div>
                            
                            {/* Visual Thumbnail */}
                            <div style={{ width: '48px', height: '48px', borderRadius: '4px', overflow: 'hidden', background: '#222', flexShrink: 0 }}>
                              {/\.(mp4|webm|ogg)(\?.*)?$/i.test(item.imageUrl) ? (
                                <video src={item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                              ) : (
                                <img src={item.imageUrl || '/images/dragon-roll.avif'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              )}
                            </div>

                            <div className="admin-menu-item-info">
                              <h4>{item.title || "(Untitled Item)"}</h4>
                              <p style={{ fontSize: '11px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>
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
                              style={{ color: 'var(--color-brand-gold)', marginRight: '4px' }} 
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
                        <p className="admin-empty-state" style={{ padding: '20px 0' }}>No gallery items found. Click 'Import Demo Menu' to seed or upload some media files!</p>
                      )}
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
