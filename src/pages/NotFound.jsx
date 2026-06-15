import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <Helmet>
        <title>Page Not Found - Kyō-To Sushi Catania</title>
        <meta name="description" content="Oops! The page you are looking for does not exist on Kyō-To Sushi Catania. Return to our homepage to explore our Japanese contemporary menu or book a table." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="not-found-container">
        <motion.div
          className="not-found-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="not-found-icon-wrapper">
            <AlertTriangle size={48} className="text-gold" />
          </div>
          
          <h1 className="not-found-code">404</h1>
          <h2 className="not-found-title">Pagina Non Trovata</h2>
          <h3 className="not-found-subtitle">Page Not Found</h3>
          
          <div className="not-found-divider"></div>
          
          <p className="not-found-text">
            La pagina che stai cercando potrebbe essere stata rimossa, aver cambiato nome o essere temporaneamente non disponibile.
          </p>
          <p className="not-found-text-en">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div className="not-found-action">
            <Link to="/" className="btn btn-gold">
              <ArrowLeft size={16} style={{ marginRight: '8px' }} />
              <span>Torna alla Home / Back to Home</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
