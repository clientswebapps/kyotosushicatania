import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  collection,
  setDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db, firebaseConfig } from "../firebase/config";

/**
 * Hook for Firebase Authentication.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Login with email and password.
   */
  const login = async (email, password) => {
    if (!auth) {
      throw new Error("Firebase is not configured.");
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  /**
   * Logout the current user.
   */
  const logout = async () => {
    localStorage.removeItem("kyoto_session");
    sessionStorage.removeItem("kyoto_session");
    if (!auth) return;
    return signOut(auth);
  };

  return { user, loading, login, logout };
}

/**
 * Hook for managing admin users.
 * 
 * Uses a secondary Firebase App instance to create new users without
 * signing out the current admin. Stores user metadata in the
 * `adminUsers` Firestore collection.
 */
export function useAdminUsers() {
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to the adminUsers collection in real-time
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onSnapshot(
      collection(db, "adminUsers"),
      (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAdminUsers(users);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching admin users:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * Create a new admin user using a secondary Firebase App instance.
   * This avoids signing out the currently logged-in admin.
   */
  const createAdminUser = async (email, password, displayName) => {
    if (!db) throw new Error("Firestore is not configured.");

    let secondaryApp = null;
    try {
      // Create a temporary secondary Firebase app
      secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);

      // Create the user on the secondary app (doesn't affect main auth session)
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );

      // Set display name
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Store user metadata in Firestore for the admin panel listing
      await setDoc(doc(db, "adminUsers", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName || "",
        role: "admin",
        createdAt: new Date().toISOString(),
      });

      // Sign out from the secondary app and clean up
      await signOut(secondaryAuth);

      return userCredential.user;
    } catch (err) {
      console.error("Error creating admin user:", err);
      throw err;
    } finally {
      // Always clean up the secondary app
      if (secondaryApp) {
        try {
          await deleteApp(secondaryApp);
        } catch (cleanupErr) {
          // Ignore cleanup errors
        }
      }
    }
  };

  /**
   * Remove admin user metadata from Firestore.
   * Note: This does NOT delete the Firebase Auth account (that requires Admin SDK).
   * It removes them from the admin users listing.
   */
  const removeAdminUser = async (userId) => {
    if (!db) throw new Error("Firestore is not configured.");
    try {
      await deleteDoc(doc(db, "adminUsers", userId));
    } catch (err) {
      console.error("Error removing admin user:", err);
      throw err;
    }
  };

  return {
    adminUsers,
    loading,
    error,
    createAdminUser,
    removeAdminUser,
  };
}
