import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import "../styles/policy.css";

export default function PrivacyPolicy() {
  return (
    <main className="policy-page">
      <Helmet>
        <title>Privacy Policy - Kyō-To Sushi Catania</title>
        <meta name="description" content="Privacy Policy e informativa sul trattamento dei dati personali (GDPR) di Kyō-To Sushi Catania." />
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
              <Shield size={32} />
            </div>
          </div>
          <h1>Informativa sulla Privacy</h1>
          <p>Ultimo aggiornamento: 15 Giugno 2026</p>
        </motion.div>

        <motion.div
          className="policy-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <section className="policy-section">
            <h2>1. Titolare del Trattamento dei Dati</h2>
            <p>
              Il Titolare del trattamento dei dati personali raccolti tramite questo sito web è:
              <br />
              <strong>Kyō-To Sushi Catania</strong>
              <br />
              Indirizzo: Via Barone della Bicocca, 14, 95124 Catania CT, Italia
              <br />
              Email: <a href="mailto:privacy@kyotosushicatania.com" style={{ color: "var(--color-brand-gold)" }}>privacy@kyotosushicatania.com</a>
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Tipologie di Dati Raccolti</h2>
            <p>
              I dati personali che raccogliamo per la gestione delle prenotazioni e dei contatti includono:
            </p>
            <ul>
              <li><strong>Dati Identificativi:</strong> Nome e cognome.</li>
              <li><strong>Dati di Contatto:</strong> Indirizzo email e numero di telefono.</li>
              <li><strong>Dati sulla Prenotazione:</strong> Data, ora, numero di ospiti ed eventuali note o preferenze inserite nel modulo (es. allergie o esigenze alimentari).</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. Finalità del Trattamento</h2>
            <p>
              I dati raccolti vengono trattati per le seguenti finalità:
            </p>
            <ul>
              <li>Fornire il servizio di prenotazione del tavolo richiesto dall'utente.</li>
              <li>Inviare comunicazioni di conferma, aggiornamento o cancellazione relative alla prenotazione via email o telefono.</li>
              <li>Gestire richieste di supporto o messaggi inviati tramite i moduli di contatto.</li>
              <li>Adempiere ad obblighi legali e di sicurezza.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. Base Giuridica del Trattamento</h2>
            <p>
              Trattiamo i tuoi dati personali sulla base delle seguenti condizioni:
            </p>
            <ul>
              <li><strong>Esecuzione di un contratto:</strong> Per confermare ed erogare il servizio di prenotazione del tavolo richiesto (Art. 6.1.b GDPR).</li>
              <li><strong>Consenso dell'interessato:</strong> Per il trattamento di categorie particolari di dati, come le informazioni su allergie o intolleranze indicate nelle note (Art. 9.2.a GDPR).</li>
              <li><strong>Legittimo interesse:</strong> Per la prevenzione delle frodi o delle prenotazioni doppie/fittizie e per garantire la sicurezza del sito.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>5. Conservazione dei Dati</h2>
            <p>
              I dati personali relativi alle prenotazioni vengono conservati solo per il tempo strettamente necessario a gestire la prenotazione stessa e per un periodo successivo massimo di 90 giorni (per finalità amministrative o di risoluzione di controversie), dopodiché vengono cancellati o resi anonimi.
            </p>
          </section>

          <section className="policy-section">
            <h2>6. Diritti degli Interessati (GDPR)</h2>
            <p>
              In conformità con il Regolamento Europeo (GDPR), gli utenti hanno il diritto di:
            </p>
            <ul>
              <li>Accedere ai propri dati personali conservati presso di noi.</li>
              <li>Ottenere la rettifica o la correzione dei dati inesatti.</li>
              <li>Richiedere la cancellazione (diritto all'oblio) dei propri dati.</li>
              <li>Ottenere la limitazione del trattamento o opporsi allo stesso.</li>
              <li>Esercitare il diritto alla portabilità dei dati.</li>
              <li>Revocare il consenso in qualsiasi momento senza pregiudicare la liceità del trattamento basata sul consenso prestato prima della revoca.</li>
            </ul>
            <p>
              Per esercitare tali diritti, è possibile inviare una richiesta all'indirizzo email: <strong>privacy@kyotosushicatania.com</strong>.
            </p>
          </section>
        </motion.div>
      </div>
    </main>
  );
}
