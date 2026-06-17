import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCollection } from "../hooks/useFirestore";
import { useAuth, useAdminUsers } from "../hooks/useAuth";
import {
  Calendar,
  Users,
  FileText,
  Sliders,
  LogOut,
  Eye,
  CheckCircle,
  AlertCircle,
  Shield,
  Star,
  BarChart2
} from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { fallbackData } from "../data/fallbackData";
import "../styles/admin.css";

// Tab Subcomponents
import ReservationsTab from "../components/admin/ReservationsTab";
import HeroTab from "../components/admin/HeroTab";
import PromotionsTab from "../components/admin/PromotionsTab";
import MenuTab from "../components/admin/MenuTab";
import GalleryTab from "../components/admin/GalleryTab";
import UsersTab from "../components/admin/UsersTab";
import FeaturedTab from "../components/admin/FeaturedTab";
import AnalyticsTab from "../components/admin/AnalyticsTab";

export default function Admin() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const {
    adminUsers,
    loading: adminUsersLoading,
    createAdminUser,
    removeAdminUser,
  } = useAdminUsers();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("reservations");
  const [seeding, setSeeding] = useState(false);

  // Auto-register authenticated Firebase Auth users in the adminUsers collection if missing
  useEffect(() => {
    if (user && !adminUsersLoading) {
      const userExists = adminUsers.some((u) => u.id === user.uid);
      if (!userExists) {
        const registerUserDoc = async () => {
          try {
            await setDoc(doc(db, "adminUsers", user.uid), {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || "",
              role: "admin",
              createdAt: new Date().toISOString()
            });
          } catch (err) {
            console.error("Error auto-registering admin user in Firestore:", err);
          }
        };
        registerUserDoc();
      }
    }
  }, [user, adminUsers, adminUsersLoading]);

  // Reservation list (needed for statistics in parent dashboard layout)
  const { data: reservations = [], loading: resLoading } = useCollection(
    "reservations",
    { orderByField: "createdAt", realtime: true }
  );

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await login(email, password);
    } catch (err) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setLoginError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setLoginError("Too many failed attempts. Please try again later.");
      } else {
        setLoginError(err.message || "Login failed. Please try again.");
      }
    }
  };

  // Shared Seeder Action
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
      // 6. Add featured items
      if (fallbackData.featuredItems) {
        for (const item of fallbackData.featuredItems) {
          await setDoc(doc(db, "featuredItems", item.id), item);
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
      <main className="admin-loading-container">
        <div className="menu-loading-spinner"></div>
      </main>
    );
  }

  // Not logged in: Show premium login form
  if (!user) {
    return (
      <main className="admin-login-page">
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
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@kyotosushicatania.com"
                autoComplete="email"
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
                autoComplete="current-password"
              />
            </div>
            {loginError && <div className="form-error">{loginError}</div>}
            <button type="submit" className="admin-login-btn">
              Log In
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  // Logged in: Show beautiful admin dashboard
  return (
    <main className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user.displayName || user.email}</p>
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
          className={`admin-tab-btn ${activeTab === "featured" ? "active" : ""}`}
          onClick={() => setActiveTab("featured")}
        >
          <Star size={18} />
          <span>Featured Menu</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "gallery" ? "active" : ""}`}
          onClick={() => setActiveTab("gallery")}
        >
          <Eye size={18} />
          <span>Gallery Settings</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <BarChart2 size={18} />
          <span>Analytics</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <Shield size={18} />
          <span>Admin Users</span>
        </button>
      </div>

      <section className="admin-tab-content">
        <AnimatePresence mode="wait">
          {activeTab === "reservations" && (
            <ReservationsTab
              reservations={reservations}
              resLoading={resLoading}
              seeding={seeding}
              handleSeedDatabase={handleSeedDatabase}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsTab />
          )}

          {activeTab === "hero" && <HeroTab />}

          {activeTab === "promotions" && <PromotionsTab />}

          {activeTab === "menu" && (
            <MenuTab
              user={user}
              seeding={seeding}
              handleSeedDatabase={handleSeedDatabase}
            />
          )}

          {activeTab === "featured" && (
            <FeaturedTab />
          )}

          {activeTab === "gallery" && <GalleryTab />}

          {activeTab === "users" && (
            <UsersTab
              user={user}
              adminUsers={adminUsers}
              adminUsersLoading={adminUsersLoading}
              createAdminUser={createAdminUser}
              removeAdminUser={removeAdminUser}
            />
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
