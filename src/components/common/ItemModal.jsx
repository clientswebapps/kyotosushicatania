import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/modal.css';

const ItemModal = ({ isOpen, onClose, item }) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && item && (
        <div className="modal-overlay" onClick={onClose}>
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" onClick={onClose}>
              <X size={24} />
            </button>
            
            <div className="modal-image-container">
              {/\.(mp4|webm|ogg)(\?.*)?$/i.test(item.imageUrl) ? (
                <video src={item.imageUrl} autoPlay loop muted playsInline preload="auto" className="modal-media" />
              ) : (
                <img src={item.imageUrl} alt={item.title} className="modal-media" />
              )}
            </div>
            
            <div className="modal-details">
              {item.tag && <span className="modal-tag">{item.tag}</span>}
              <h2 className="modal-title">{item.title}</h2>
              <p className="modal-description">{item.description || item.subtitle}</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ItemModal;
