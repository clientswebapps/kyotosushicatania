import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import '../../styles/menu.css';

export default function MenuItemModal({ item, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="menu-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="menu-modal-container"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button className="menu-modal-close" onClick={onClose}>
              <X size={24} />
            </button>
            
            <div className="menu-modal-image-wrapper">
              <img src={item.imageUrl} alt={item.name} className="menu-modal-image" />
              {item.isBestSeller && (
                <span className="menu-modal-badge">Best Seller</span>
              )}
            </div>

            <div className="menu-modal-content">
              <div className="menu-modal-header">
                <h2 className="menu-modal-title">{item.name}</h2>
                <span className="menu-modal-price">€{Number(item.price).toFixed(2)}</span>
              </div>

              {item.highlights && item.highlights.length > 0 && (
                <div className="menu-modal-highlights">
                  {item.highlights.map((tag, idx) => (
                    <span key={idx} className="menu-highlight-tag">{tag}</span>
                  ))}
                </div>
              )}

              <div className="menu-modal-divider"></div>

              <p className="menu-modal-description">{item.description}</p>
              
              {/* Future Implementation: Ratings, Ingredients, Allergens could go here */}

              <div className="menu-modal-footer">
                <button className="menu-modal-action-btn" onClick={onClose}>
                  <ShoppingBag size={18} />
                  <span>Add to Order</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
