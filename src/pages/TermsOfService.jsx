import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import "../styles/policy.css";

export default function TermsOfService() {
  return (
    <div className="policy-page">
      <Helmet>
        <title>Terms of Service - Kyō-To Sushi Catania</title>
        <meta name="description" content="Termini e condizioni del servizio di prenotazione di Kyō-To Sushi Catania." />
      </Helmet>
      
      <div className="policy-container">
        <div className="policy-back-btn">
          <Link to="/" className="btn btn-gold-outline">
            <ArrowLeft size={16} />
            <span>Torna alla Home</span>
          </Link>
        </div>

        <motion.div
          className="policy-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex-center mb-md">
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "var(--color-brand-gold-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-brand-gold)",
              border: "1px solid var(--color-brand-gold)"
            }}>
              <FileText size={32} />
            </div>
          </div>
          <h1>Termini del Servizio</h1>
          <p>Ultimo aggiornamento: 15 Giugno 2026</p>
        </motion.div>

        <motion.div
          className="policy-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <section className="policy-section">
            <h2>1. Ambito del Servizio</h2>
            <p>
              I presenti termini regolano il servizio di prenotazione online dei tavoli per il ristorante <strong>Kyō-To Sushi Catania</strong> tramite questo sito web.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Politica delle Prenotazioni</h2>
            <p>
              Le richieste di prenotazione inviate online non costituiscono una prenotazione confermata fino a quando non viene inviata una notifica formale di conferma via email, SMS o telefonata dal personale di Kyō-To.
            </p>
            <ul>
              <li><strong>Orario Limite di Tolleranza:</strong> Il tavolo sarà tenuto a disposizione per un massimo di <strong>15 minuti</strong> oltre l'orario prenotato. Trascorsi i quali, in assenza di comunicazioni, la prenotazione sarà considerata cancellata (no-show) per consentire la riallocazione ad altri ospiti.</li>
              <li><strong>Modifiche:</strong> Eventuali variazioni del numero di ospiti o dell'orario devono essere segnalate tempestivamente via telefono.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. Allergie e Esigenze Alimentari</h2>
            <p>
              È responsabilità esclusiva dell'utente segnalare eventuali intolleranze alimentari, allergie gravi o specifiche restrizioni dietetiche all'atto della prenotazione (tramite il campo note) e confermarle verbalmente al personale di sala al momento dell'arrivo al ristorante.
            </p>
          </section>

          <section className="policy-section">
            <h2>4. Limitazione di Responsabilità</h2>
            <p>
              Kyō-To Sushi Catania si riserva il diritto di annullare o modificare le prenotazioni in caso di cause di forza maggiore o imprevisti operativi interni (es. guasti, emergenze sanitarie, chiusure straordinarie), impegnandosi a darne tempestiva comunicazione all'utente.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
