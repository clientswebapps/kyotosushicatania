import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { generateRoundWavyPath } from "../../utils/wavyPath";
import "../../styles/modal.css";

const allergensList = [
  {
    num: 1,
    title: "Cereali contenenti glutine",
    desc: "Grano, segale, orzo, avena, farro, kamut o i loro ceppi ibridati e prodotti derivati. Tranne sciroppi di glucosio a base di grano (incluso destrosio), maltodestrine a base di grano, sciroppi di glucosio a base di orzo e cereali per distillati.",
  },
  {
    num: 2,
    title: "Crostacei e prodotti derivati",
    desc: "Tutti i tipi di crostacei e prodotti a base di essi.",
  },
  {
    num: 3,
    title: "Uova e prodotti derivati",
    desc: "Tutte le uova e derivati (maionese, salse, dolci).",
  },
  {
    num: 4,
    title: "Pesce e prodotti derivati",
    desc: "Tranne gelatina di pesce utilizzata come supporto per preparati di vitamine o carotenoidi e chiarificante nella birra e nel vino.",
  },
  {
    num: 5,
    title: "Arachidi e prodotti derivati",
    desc: "Arachidi, olio di arachidi e alimenti che li contengono.",
  },
  {
    num: 6,
    title: "Soia e prodotti derivati",
    desc: "Tranne olio e grasso di soia raffinato, tocoferoli misti naturali (E306), fitosteroli ed esteri di fitosteroli a base di soia.",
  },
  {
    num: 7,
    title: "Latte e prodotti derivati",
    desc: "Incluso il lattosio. Tranne siero di latte utilizzato per la fabbricazione di distillati alcolici e lattitolo.",
  },
  {
    num: 8,
    title: "Frutta a guscio",
    desc: "Mandorle, nocciole, noci comuni, noci di anacardi, noci di pecan, noci del Brasile, pistacchi, noci del Queensland e i loro prodotti derivati.",
  },
  {
    num: 9,
    title: "Sedano e prodotti derivati",
    desc: "Sedano, foglie, coste e prodotti derivati.",
  },
  {
    num: 10,
    title: "Senape e prodotti derivati",
    desc: "Senape, semi di senape, salse e derivati.",
  },
  {
    num: 11,
    title: "Semi di sesamo e prodotti derivati",
    desc: "Semi di sesamo, tahina, olio di sesamo e alimenti derivati.",
  },
  {
    num: 12,
    title: "Anidride solforosa e solfiti",
    desc: "In concentrazioni superiori a 10 mg/kg o 10 mg/litro espressi come SO2 (comunemente presenti in vino, aceto e conservanti).",
  },
  {
    num: 13,
    title: "Lupini e prodotti derivati",
    desc: "Lupini e farine o preparati a base di lupini.",
  },
  {
    num: 14,
    title: "Molluschi e prodotti derivati",
    desc: "Cozze, vongole, polpo, seppie, calamari, lumache di mare e prodotti derivati.",
  },
];

export default function AllergenModal({ isOpen, onClose }) {
  // Prevent background scrolling when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(5px)",
              zIndex: 1000,
            }}
          />

          {/* Modal Container */}
          <motion.div
            className="allergen-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="allergen-modal-header">
              <div className="allergen-modal-header-info">
                <div className="allergen-modal-icon-wrapper">
                  <AlertCircle size={22} />
                </div>
                <div className="allergen-modal-title-group">
                  <h3>Allergeni Alimentari</h3>
                  <p>Sostanze o prodotti che provocano allergie o intolleranze</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="allergen-modal-close-btn"
                aria-label="Chiudi modal"
              >
                <X size={20} />
              </button>

              {/* Wavy cutout header divider (cutout transitions into light body) */}
              <div className="allergen-modal-wave" aria-hidden="true">
                <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <path d={generateRoundWavyPath()} fill="var(--color-bg)" />
                </svg>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="allergen-modal-body">
              {allergensList.map((allergen) => (
                <div key={allergen.num} className="allergen-card">
                  <div className="allergen-card-num">{allergen.num}</div>
                  <div>
                    <h4 className="allergen-card-title">{allergen.title}</h4>
                    <p className="allergen-card-desc">{allergen.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div className="allergen-modal-footer">
              * Regolamento UE 1169/2011 relativo all'informazione sugli alimenti ai consumatori.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
