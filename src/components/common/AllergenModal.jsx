import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
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
              backdropFilter: "blur(8px)",
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "750px",
              maxHeight: "85vh",
              background: "linear-gradient(135deg, #121212 0%, #080808 100%)",
              border: "1px solid rgba(243, 192, 22, 0.2)",
              borderRadius: "12px",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.8), 0 0 40px rgba(243, 192, 22, 0.05)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              zIndex: 1001,
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(243, 192, 22, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-brand-gold)",
                }}>
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "var(--color-text)",
                    margin: 0,
                  }}>
                    Allergeni Alimentari
                  </h3>
                  <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                    margin: "4px 0 0 0",
                  }}>
                    Sostanze o prodotti che provocano allergie o intolleranze
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(244, 67, 54, 0.1)";
                  e.currentTarget.style.color = "#f44336";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div style={{
              overflowY: "auto",
              padding: "24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}>
              {allergensList.map((allergen) => (
                <div
                  key={allergen.num}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.04)",
                    borderRadius: "8px",
                    padding: "16px",
                    display: "flex",
                    gap: "12px",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(243, 192, 22, 0.15)";
                    e.currentTarget.style.background = "rgba(243, 192, 22, 0.01)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                  }}
                >
                  <div style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "var(--color-brand-gold)",
                    opacity: 0.6,
                    lineHeight: 1,
                    minWidth: "24px",
                  }}>
                    {allergen.num}
                  </div>
                  <div>
                    <h4 style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--color-text)",
                      margin: "0 0 6px 0",
                    }}>
                      {allergen.title}
                    </h4>
                    <p style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                      lineHeight: "1.5",
                      margin: 0,
                    }}>
                      {allergen.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div style={{
              padding: "16px 24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              background: "rgba(0, 0, 0, 0.3)",
              fontSize: "11px",
              color: "var(--color-text-muted)",
              textAlign: "center",
            }}>
              * Regolamento UE 1169/2011 relativo all'informazione sugli alimenti ai consumatori.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
