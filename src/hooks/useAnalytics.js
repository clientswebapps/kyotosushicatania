import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebase/config";

export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (analytics) {
      logEvent(analytics, "page_view", {
        page_path: location.pathname + location.search + location.hash,
        page_location: window.location.href,
        page_title: document.title,
      });
    } else {
      console.log("[Analytics Mock] Page View:", location.pathname + location.search + location.hash);
    }
  }, [location]);

  const trackEvent = (eventName, eventParams = {}) => {
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    } else {
      console.log(`[Analytics Mock] Event logged: "${eventName}"`, eventParams);
    }
  };

  return { trackEvent };
}
