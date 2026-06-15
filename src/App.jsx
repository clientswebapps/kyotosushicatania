import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

const Admin = lazy(() => import("./pages/Admin"));
import ScrollToTop from "./components/ScrollToTop";
import AnalyticsTracker from "./components/AnalyticsTracker";
import "./styles/index.css";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<Menu />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="admin" element={
            <Suspense fallback={<div className="admin-loading-container"><div className="menu-loading-spinner"></div></div>}>
              <Admin />
            </Suspense>
          } />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
