import { useState, useEffect, useRef } from "react";
import { messaging, db } from "../../firebase/config";
import { getToken } from "firebase/messaging";
import { collection, addDoc, query, where, getDocs, limit } from "firebase/firestore";
import { Bell, Download, Share, X, Check } from "lucide-react";
import "../../styles/pwa-install.css";

export default function PWAInstallPromo() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState("default"); // 'default', 'granted', 'denied', 'loading', 'success'
  const [isIos, setIsIos] = useState(false);

  // Check standalone mode (PWA active) and OS
  useEffect(() => {
    const checkPwaState = () => {
      const standalone = 
        window.matchMedia("(display-mode: standalone)").matches || 
        window.navigator.standalone === true;
      setIsStandalone(standalone);

      // Detect iOS device
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      setIsIos(ios);

      // Check Notification permissions
      if ("Notification" in window) {
        setNotificationStatus(Notification.permission);
      }

      // If running in browser and has not dismissed before, show banner after 3 seconds
      const isDismissed = localStorage.getItem("pwa_promo_dismissed") === "true";
      if (!standalone && !isDismissed) {
        const timer = setTimeout(() => setShowBanner(true), 3000);
        return () => clearTimeout(timer);
      }
    };

    checkPwaState();

    // Listen for the native install prompt (Android/Chrome/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show banner if we have the prompt ready
      const isDismissed = localStorage.getItem("pwa_promo_dismissed") === "true";
      if (!isStandalone && !isDismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for PWA installation completion
    const handleAppInstalled = () => {
      console.log("PWA was installed successfully!");
      setIsStandalone(true);
      setShowBanner(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isStandalone]);

  // Trigger PWA installation
  const handleInstallClick = async () => {
    if (isIos) {
      // iOS doesn't support programmatic install prompts, must show manual steps
      setShowIosModal(true);
      return;
    }

    if (!deferredPrompt) {
      console.log("Install prompt not available. Displaying manual instructions.");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    // Clear deferred prompt so it can only be used once
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      setShowBanner(false);
    }
  };

  // Dismiss install banner
  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem("pwa_promo_dismissed", "true");
  };

  // Request Notification Permissions & Save FCM Token
  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("This device does not support push notifications.");
      return;
    }

    if (!messaging) {
      alert("Firebase messaging is not configured. Add your VAPID key.");
      return;
    }

    setNotificationStatus("loading");
    try {
      // 1. Request permission
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);

      if (permission === "granted") {
        // 2. Fetch the FCM registration token
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.warn("VITE_FIREBASE_VAPID_KEY is missing in environment files. Cannot acquire token.");
          setNotificationStatus("default");
          alert("Notification permission approved, but notification services are not configured yet on this domain.");
          return;
        }

        const token = await getToken(messaging, { vapidKey });
        
        if (token) {
          // 3. Check if token already exists in database
          const pushSubscriptionsRef = collection(db, "pushSubscriptions");
          const q = query(pushSubscriptionsRef, where("token", "==", token), limit(1));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            // 4. Save token to Firestore
            await addDoc(pushSubscriptionsRef, {
              token,
              subscribedAt: new Date().toISOString(),
              platform: isIos ? "iOS" : /Android/.test(navigator.userAgent) ? "Android" : "Desktop",
              userAgent: navigator.userAgent
            });
            console.log("Push notification token saved to Firestore successfully.");
          } else {
            console.log("Token already registered in Firestore.");
          }
          setNotificationStatus("success");
        } else {
          console.error("No registration token available. Request permission to generate one.");
          setNotificationStatus("default");
        }
      }
    } catch (error) {
      console.error("An error occurred while enabling notifications:", error);
      setNotificationStatus("default");
    }
  };

  // Render standalone rewards view
  if (isStandalone) {
    return (
      <div className="pwa-reward-banner">
        <h3 className="pwa-reward-title">Welcome to the Kyō-To App!</h3>
        <p className="pwa-reward-description">
          Thank you for installing our app on your device. Enjoy this exclusive offer on us!
        </p>

        <div className="pwa-reward-code-box">
          <span className="pwa-reward-code-label">Your Exclusive Promo Code</span>
          <span className="pwa-reward-code">KYOTOAPP25</span>
          <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "var(--color-brand-gold)" }}>
            Receive 25% Off Your Next Order!
          </p>
        </div>

        <div className="pwa-notification-optin">
          {notificationStatus === "granted" || notificationStatus === "success" ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#2ecc71", fontSize: "14px" }}>
              <Check size={18} />
              <span>Notifications are active! You will receive our custom offers directly on this device.</span>
            </div>
          ) : notificationStatus === "denied" ? (
            <p style={{ fontSize: "12px", color: "var(--color-brand-red)" }}>
              Notifications are blocked. Please enable notifications in your device settings to receive our offers.
            </p>
          ) : (
            <>
              <p>Keep push notifications enabled to receive custom daily offers and secret deals!</p>
              <button 
                onClick={handleEnableNotifications} 
                className="pwa-btn-notifications"
                disabled={notificationStatus === "loading"}
              >
                <Bell size={16} />
                <span>{notificationStatus === "loading" ? "Activating..." : "Enable Push Notifications"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Render browser promotion banner
  return (
    <>
      {showBanner && (
        <div className="pwa-install-banner">
          <div className="pwa-install-content">
            <div className="pwa-install-icon">京</div>
            <div className="pwa-install-text">
              <h4>Install Kyō-To App</h4>
              <p>Install the app for real-time updates and receive exclusive offers!</p>
            </div>
          </div>
          <div className="pwa-install-actions">
            <button onClick={handleInstallClick} className="pwa-btn-install">
              <Download size={14} style={{ marginRight: "4px", display: "inline" }} />
              <span>Install</span>
            </button>
            <button onClick={handleDismissBanner} className="pwa-btn-close" aria-label="Dismiss">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* iOS Manual Instructions Modal */}
      {showIosModal && (
        <div className="ios-install-modal-overlay" onClick={() => setShowIosModal(false)}>
          <div className="ios-install-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Install on iOS</h3>
            <p>Add Kyō-To to your Home Screen to get real-time updates, enable push notifications, and receive exclusive offers!</p>
            
            <div className="ios-steps">
              <div className="ios-step">
                <span className="ios-step-num">1</span>
                <span>Open this site in the <strong>Safari</strong> browser.</span>
              </div>
              <div className="ios-step">
                <span className="ios-step-num">2</span>
                <span>Tap the <strong>Share</strong> button <span className="ios-icon-helper"><Share size={12} style={{ display: "inline" }} /></span> in the bottom toolbar.</span>
              </div>
              <div className="ios-step">
                <span className="ios-step-num">3</span>
                <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
              </div>
              <div className="ios-step">
                <span className="ios-step-num">4</span>
                <span>Launch the app from your home screen to view your reward code!</span>
              </div>
            </div>

            <button onClick={() => setShowIosModal(false)} className="ios-btn-close">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
