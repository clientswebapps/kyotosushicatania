import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { defineString, defineInt } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import * as nodemailer from "nodemailer";

// Initialize Firebase Admin SDK
initializeApp();

// Cost & Performance Control
setGlobalOptions({ maxInstances: 10, region: "europe-west8" });

// Define Configuration Parameters
const smtpHost = defineString("SMTP_HOST", { default: "smtp.gmail.com" });
const smtpPort = defineInt("SMTP_PORT", { default: 587 });
const smtpUser = defineString("SMTP_USER", { default: "" });
const smtpPass = defineString("SMTP_PASS", { default: "" });
const smtpFrom = defineString("SMTP_FROM", { default: "Kyō-To Sushi Catania <reserve@kyotosushicatania.com>" });
const adminNotificationEmail = defineString("ADMIN_NOTIFICATION_EMAIL", { default: "reserve@kyotosushicatania.com" });
const dashboardUrl = defineString("DASHBOARD_URL", { default: "https://kyotosushicatania.web.app/admin" });

/**
 * Triggered on reservation creation. Sends emails to both:
 * 1. The customer (to acknowledge receipt, pending review).
 * 2. The restaurant admin (to notify them of a new booking request).
 */
export const onReservationCreated = onDocumentCreated("reservations/{reservationId}", async (event) => {
  logger.info("onReservationCreated trigger executing...");
  const snapshot = event.data;
  if (!snapshot) {
    logger.warn("No snapshot data found for event");
    return;
  }
  
  const reservation = snapshot.data();
  const { name, email, phone, date, time, partySize, notes } = reservation;
  
  logger.info(`New reservation request: ${name} (${email}), ${partySize} guests, on ${date} at ${time}`);

  // Retrieve SMTP credentials
  const host = smtpHost.value();
  const port = smtpPort.value();
  const user = smtpUser.value();
  const pass = smtpPass.value();
  const from = smtpFrom.value();
  const adminEmail = adminNotificationEmail.value();

  // Fallback logs if SMTP parameters are left unconfigured
  if (!user || !pass) {
    logger.warn("SMTP user or password not configured. Skipping email send. Logging email content instead.");
    logger.info(`[CUSTOMER EMAIL TO ${email}] Booking received for ${name} on ${date} at ${time}`);
    logger.info(`[ADMIN EMAIL TO ${adminEmail}] New booking notification for ${name} on ${date} at ${time}`);
    return;
  }

  // Create nodemailer transporter
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587/other ports
    auth: {
      user,
      pass,
    },
  });

  // 1. Send confirmation to the Customer (in Italian)
  const customerMailOptions = {
    from,
    to: email,
    subject: "Richiesta di Prenotazione Ricevuta - Kyō-To Sushi Catania",
    html: `
      <div style="background-color: #0a0a0a; color: #f5f0e8; font-family: 'DM Sans', sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #2a2a2a;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://kyotosushicatania.web.app/images/logo-white.avif" alt="Kyō-To Sushi Catania" style="height: 50px; background-color: #0a0a0a;" />
        </div>
        <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 26px; color: #F3C016; text-align: center; margin-bottom: 20px;">Richiesta di Prenotazione Ricevuta</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #8a8a8a;">Gentile <strong>${name}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6; color: #8a8a8a;">Abbiamo ricevuto la tua richiesta di prenotazione per Kyō-To Sushi Catania. Ecco i dettagli:</p>
        
        <div style="background-color: #141414; border: 1px solid #2a2a2a; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #555555; font-size: 14px; text-transform: uppercase; width: 40%;">Data:</td>
              <td style="padding: 8px 0; color: #f5f0e8; font-size: 15px; font-weight: bold;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555555; font-size: 14px; text-transform: uppercase;">Orario:</td>
              <td style="padding: 8px 0; color: #f5f0e8; font-size: 15px; font-weight: bold;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555555; font-size: 14px; text-transform: uppercase;">Ospiti:</td>
              <td style="padding: 8px 0; color: #f5f0e8; font-size: 15px; font-weight: bold;">${partySize} ${Number(partySize) === 1 ? 'persona' : 'persone'}</td>
            </tr>
            ${notes ? `
            <tr>
              <td style="padding: 8px 0; color: #555555; font-size: 14px; text-transform: uppercase; vertical-align: top;">Note:</td>
              <td style="padding: 8px 0; color: #8a8a8a; font-size: 14px; font-style: italic;">${notes}</td>
            </tr>` : ''}
          </table>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #C8102E; text-align: center; font-weight: bold; margin-bottom: 25px;">
          * Questa richiesta è in attesa di conferma. Ti invieremo un'email di conferma o ti contatteremo telefonicamente a breve.
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #8a8a8a; margin-top: 30px; text-align: center;">
          Per modifiche urgenti ti preghiamo di chiamarci direttamente al <a href="tel:+390952907347" style="color: #F3C016; text-decoration: none;">095 290 7347</a>.
        </p>

        <hr style="border: none; border-top: 1px solid #2a2a2a; margin: 30px 0;" />
        
        <div style="text-align: center; color: #555555; font-size: 12px;">
          <p>Kyō-To Sushi Catania • Via Barone della Bicocca, 14, 95124 Catania CT, Italia</p>
        </div>
      </div>
    `
  };

  // 2. Send alert notification to the Admin (in Italian)
  const adminMailOptions = {
    from,
    to: adminEmail,
    subject: `[Nuova Prenotazione] ${name} (${partySize} persone) - ${date}`,
    html: `
      <div style="background-color: #0a0a0a; color: #f5f0e8; font-family: 'DM Sans', sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #2a2a2a;">
        <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 26px; color: #F3C016; text-align: center; margin-bottom: 20px;">Nuova Richiesta di Prenotazione</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #8a8a8a;">Una nuova richiesta di prenotazione è stata effettuata tramite il sito web:</p>
        
        <div style="background-color: #141414; border: 1px solid #2a2a2a; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #555555; font-size: 14px; text-transform: uppercase; width: 40%;">Nome Cliente:</td>
              <td style="padding: 8px 0; color: #f5f0e8; font-size: 15px; font-weight: bold;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555555; font-size: 14px; text-transform: uppercase;">Email:</td>
              <td style="padding: 8px 0; color: #f5f0e8; font-size: 15px;"><a href="mailto:${email}" style="color: #F3C016; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555555; font-size: 14px; text-transform: uppercase;">Telefono:</td>
              <td style="padding: 8px 0; color: #f5f0e8; font-size: 15px;"><a href="tel:${phone}" style="color: #F3C016; text-decoration: none;">${phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555555; font-size: 14px; text-transform: uppercase;">Data e Ora:</td>
              <td style="padding: 8px 0; color: #f5f0e8; font-size: 15px; font-weight: bold;">${date} alle ${time}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555555; font-size: 14px; text-transform: uppercase;">Numero Ospiti:</td>
              <td style="padding: 8px 0; color: #f5f0e8; font-size: 15px; font-weight: bold;">${partySize}</td>
            </tr>
            ${notes ? `
            <tr>
              <td style="padding: 8px 0; color: #555555; font-size: 14px; text-transform: uppercase; vertical-align: top;">Note Cliente:</td>
              <td style="padding: 8px 0; color: #8a8a8a; font-size: 14px; font-style: italic;">${notes}</td>
            </tr>` : ''}
          </table>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${dashboardUrl.value()}" style="background-color: #F3C016; color: #0a0a0a; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block;">
            Gestisci nel Pannello di Controllo
          </a>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(customerMailOptions);
    logger.info(`Customer confirmation email successfully sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send customer confirmation email:`, err);
  }

  try {
    await transporter.sendMail(adminMailOptions);
    logger.info(`Admin notification email successfully sent to ${adminEmail}`);
  } catch (err) {
    logger.error(`Failed to send admin notification email:`, err);
  }
});

/**
 * Triggered on reservation update. If the booking status changes to:
 * 1. "confirmed" -> Sends confirmation email to Customer.
 * 2. "cancelled" -> Sends cancellation email to Customer.
 */
export const onReservationUpdated = onDocumentUpdated("reservations/{reservationId}", async (event) => {
  logger.info("onReservationUpdated trigger executing...");
  const change = event.data;
  if (!change) {
    logger.warn("No change data found for update event");
    return;
  }
  
  const before = change.before.data();
  const after = change.after.data();

  // If status is unchanged, skip sending emails
  if (before.status === after.status) {
    return;
  }

  const { name, email, date, time, partySize, status } = after;
  logger.info(`Reservation status changed from '${before.status}' to '${status}' for ${name} (${email})`);

  // Retrieve SMTP credentials
  const host = smtpHost.value();
  const port = smtpPort.value();
  const user = smtpUser.value();
  const pass = smtpPass.value();
  const from = smtpFrom.value();

  // Fallback logs if SMTP parameters are left unconfigured
  if (!user || !pass) {
    logger.warn("SMTP user or password not configured. Skipping status update email. Logging update instead.");
    logger.info(`[STATUS UPDATE TO ${email}] Booking status for ${name} changed to ${status}`);
    return;
  }

  let subject = "";
  let statusMessage = "";

  if (status === "confirmed") {
    subject = "Prenotazione Confermata! - Kyō-To Sushi Catania";
    statusMessage = `
      <p style="font-size: 15px; line-height: 1.6; color: #8a8a8a;">Siamo lieti di comunicarti che la tua richiesta di prenotazione è stata <strong style="color: #28a745; text-transform: uppercase;">Confermata</strong>!</p>
      <p style="font-size: 15px; line-height: 1.6; color: #8a8a8a;">Ti aspettiamo per cena/pranzo. Ecco il riepilogo finale:</p>
    `;
  } else if (status === "cancelled") {
    subject = "Aggiornamento Prenotazione Annullata - Kyō-To Sushi Catania";
    statusMessage = `
      <p style="font-size: 15px; line-height: 1.6; color: #8a8a8a;">Ti informiamo che, purtroppo, non è stato possibile confermare la tua richiesta di prenotazione, ed essa è stata <strong style="color: #C8102E; text-transform: uppercase;">Annullata</strong>.</p>
      <p style="font-size: 15px; line-height: 1.6; color: #8a8a8a;">Ci scusiamo per l'inconveniente. In caso di dubbi o per prenotare una data alternativa, non esitare a contattarci.</p>
    `;
  } else {
    // Only send emails for confirmed and cancelled statuses
    return;
  }

  // Create nodemailer transporter
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from,
    to: email,
    subject,
    html: `
      <div style="background-color: #0a0a0a; color: #f5f0e8; font-family: 'DM Sans', sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #2a2a2a;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://kyotosushicatania.web.app/images/logo-white.avif" alt="Kyō-To Sushi Catania" style="height: 50px; background-color: #0a0a0a;" />
        </div>
        <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 26px; color: #F3C016; text-align: center; margin-bottom: 20px;">Aggiornamento Prenotazione</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #8a8a8a;">Gentile <strong>${name}</strong>,</p>
        
        ${statusMessage}

        <div style="background-color: #141414; border: 1px solid #2a2a2a; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #555555; font-size: 14px; text-transform: uppercase; width: 40%;">Data:</td>
              <td style="padding: 8px 0; color: #f5f0e8; font-size: 15px; font-weight: bold;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555555; font-size: 14px; text-transform: uppercase;">Orario:</td>
              <td style="padding: 8px 0; color: #f5f0e8; font-size: 15px; font-weight: bold;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555555; font-size: 14px; text-transform: uppercase;">Ospiti:</td>
              <td style="padding: 8px 0; color: #f5f0e8; font-size: 15px; font-weight: bold;">${partySize} ${Number(partySize) === 1 ? 'persona' : 'persone'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555555; font-size: 14px; text-transform: uppercase;">Stato Prenotazione:</td>
              <td style="padding: 8px 0; color: ${status === 'confirmed' ? '#28a745' : '#C8102E'}; font-size: 15px; font-weight: bold; text-transform: uppercase;">${status === 'confirmed' ? 'Confermata' : 'Annullata'}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #8a8a8a; margin-top: 30px; text-align: center;">
          In caso di domande o se desideri apportare ulteriori modifiche, chiamaci al <a href="tel:+390952907347" style="color: #F3C016; text-decoration: none;">095 290 7347</a>.
        </p>

        <hr style="border: none; border-top: 1px solid #2a2a2a; margin: 30px 0;" />
        
        <div style="text-align: center; color: #555555; font-size: 12px;">
          <p>Kyō-To Sushi Catania • Via Barone della Bicocca, 14, 95124 Catania CT, Italia</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Status update email successfully sent to ${email} (${status})`);
  } catch (err) {
    logger.error(`Failed to send status update email to ${email}:`, err);
  }
});
