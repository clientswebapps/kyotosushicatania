import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase/config";
import { useCollection } from "../../hooks/useFirestore";
import { Send, CheckCircle2, AlertTriangle, Users, Smartphone, BellRing } from "lucide-react";
import "../../styles/pwa-install.css";

export default function NotificationsTab() {
  const [title, setTitle] = useState("Kyō-To Sushi Catania");
  const [body, setBody] = useState("Kyō-To Sushi Catania is 25% off today. Visit us now!");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message: string }

  // Get total subscribers count
  const { data: subscribers = [], loading: subsLoading } = useCollection("pushSubscriptions", {
    realtime: true,
    orderByField: null,
  });

  const iosCount = subscribers.filter(s => s.platform === "iOS").length;
  const androidCount = subscribers.filter(s => s.platform === "Android").length;
  const desktopCount = subscribers.filter(s => s.platform === "Desktop").length;

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setStatus({ type: "error", message: "Please fill out both title and message body." });
      return;
    }

    if (subscribers.length === 0) {
      setStatus({ type: "error", message: "No active device subscriptions found. Invite users to install the app first!" });
      return;
    }

    if (!functions) {
      setStatus({ type: "error", message: "Cloud Functions service is not initialized." });
      return;
    }

    setSending(true);
    setStatus(null);

    try {
      // Call the sendPushNotification Cloud Function
      const sendPushFunc = httpsCallable(functions, "sendPushNotification");
      const result = await sendPushFunc({ title, body });
      
      const resData = result.data;
      if (resData.success) {
        setStatus({
          type: "success",
          message: `Broadcast sent! Successfully delivered to ${resData.sentCount} devices.${
            resData.failedCount ? ` (Failed on ${resData.failedCount} expired tokens; cleaned up automatically)` : ""
          }`
        });
        // Clear fields
        setBody("");
      } else {
        setStatus({
          type: "error",
          message: resData.message || "Failed to broadcast notifications."
        });
      }
    } catch (err) {
      console.error("Error invoking sendPushNotification Cloud Function:", err);
      setStatus({
        type: "error",
        message: err.message || "A network or server error occurred."
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="notifications-tab-container">
      {/* Subscribers Stats Panel */}
      <section className="notifications-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon gold">
            <Users size={24} />
          </div>
          <div>
            <h3>Total Devices</h3>
            <p className="admin-stat-num">{subsLoading ? "..." : subscribers.length}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon red">
            <Smartphone size={24} />
          </div>
          <div>
            <h3>iOS / Android</h3>
            <p className="admin-stat-num">
              {subsLoading ? "..." : `${iosCount} / ${androidCount}`}
            </p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <BellRing size={24} />
          </div>
          <div>
            <h3>Desktop App</h3>
            <p className="admin-stat-num">{subsLoading ? "..." : desktopCount}</p>
          </div>
        </div>
      </section>

      {/* Broadcast Form */}
      <div className="notification-broadcast-card">
        <h2>Broadcast Custom Push Notification</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "24px" }}>
          This will send a live device notification to all customers who have installed the Kyō-To PWA app on their phones or computers.
        </p>

        {status && (
          <div style={{ marginBottom: "20px" }}>
            {status.type === "success" ? (
              <div className="broadcast-success-banner">
                <CheckCircle2 size={18} />
                <span>{status.message}</span>
              </div>
            ) : (
              <div className="broadcast-error-banner">
                <AlertTriangle size={18} />
                <span>{status.message}</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleBroadcast} className="notification-form">
          <div className="form-field">
            <label htmlFor="notif-title">Notification Title</label>
            <input
              id="notif-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Kyō-To Sushi Catania"
              required
              maxLength={65}
            />
          </div>

          <div className="form-field">
            <label htmlFor="notif-body">Notification Message</label>
            <textarea
              id="notif-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="e.g., Kyoto Sushi Catania is 25% off today. Visit us now!"
              required
              maxLength={240}
            />
            <p style={{ alignSelf: "flex-end", fontSize: "11px", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>
              {body.length}/240 characters
            </p>
          </div>

          <button 
            type="submit" 
            className="btn-broadcast" 
            disabled={sending || subsLoading}
          >
            <Send size={16} />
            <span>{sending ? "Sending Broad Message..." : `Send to ${subscribers.length} Subscribed Devices`}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
