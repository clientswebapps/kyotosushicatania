import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase/config";

// Hardcoded credentials for local auth when Firebase is bypassed
const LOCAL_USERS = {
  "kyotoadmin": {
    username: "kyotoadmin",
    password: "Kyo-To0987654321",
    role: "admin",
    email: "kyotoadmin@kyoto.local"
  },
  "kyotosuper": {
    username: "kyotosuper",
    password: "Kyo-To0987654321",
    role: "super",
    email: "kyotosuper@kyoto.local"
  }
};

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Local Auth Logic
      const sessionUser = localStorage.getItem("kyoto_session") || sessionStorage.getItem("kyoto_session");
      if (sessionUser) {
        setUser(JSON.parse(sessionUser));
      }
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (username, password, rememberMe = false) => {
    if (!auth) {
      // Local Auth Logic
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const validUser = LOCAL_USERS[username];
          if (validUser && validUser.password === password) {
            const userObj = { email: validUser.email, username: validUser.username, role: validUser.role };
            setUser(userObj);
            
            // Handle remember me
            if (rememberMe) {
              localStorage.setItem("kyoto_session", JSON.stringify(userObj));
              sessionStorage.removeItem("kyoto_session");
            } else {
              sessionStorage.setItem("kyoto_session", JSON.stringify(userObj));
              localStorage.removeItem("kyoto_session");
            }
            resolve(userObj);
          } else {
            reject(new Error("Invalid username or password"));
          }
        }, 500); // simulate network delay
      });
    }
    
    // Fallback to Firebase if configured
    const userEmail = LOCAL_USERS[username]?.email || username;
    return signInWithEmailAndPassword(auth, userEmail, password);
  };

  const logout = async () => {
    if (!auth) {
      // Local Auth Logic
      setUser(null);
      localStorage.removeItem("kyoto_session");
      sessionStorage.removeItem("kyoto_session");
      return;
    }
    return signOut(auth);
  };

  return { user, loading, login, logout };
}
