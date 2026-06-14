import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { fallbackData } from "../data/fallbackData";

/**
 * Check if Firebase is properly configured
 */
const isFirebaseConfigured = () => {
  return !!import.meta.env.VITE_FIREBASE_PROJECT_ID;
};

/**
 * Custom hook for fetching a Firestore collection
 * Falls back to static data when Firebase is not available
 */
export const fallbackEvent = new EventTarget();

export function useCollection(collectionName, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { orderByField = "order", whereField, whereValue, realtime = false } = options;

  useEffect(() => {
    // Use fallback data if Firebase is not configured
    if (!isFirebaseConfigured()) {
      const fetchFallback = () => {
        const fallback = fallbackData[collectionName] || [];
        let filtered = [...fallback];
        if (whereField && whereValue !== undefined) {
          filtered = filtered.filter((item) => item[whereField] === whereValue);
        }
        if (orderByField) {
          filtered.sort((a, b) => (a[orderByField] || 0) - (b[orderByField] || 0));
        }
        setData(filtered);
        setLoading(false);
      };

      fetchFallback();
      
      const handleUpdate = () => fetchFallback();
      fallbackEvent.addEventListener("update", handleUpdate);
      return () => fallbackEvent.removeEventListener("update", handleUpdate);
    }

    let q;
    try {
      const constraints = [];
      if (whereField && whereValue !== undefined) {
        constraints.push(where(whereField, "==", whereValue));
      }
      if (orderByField) {
        constraints.push(orderBy(orderByField));
      }
      q = query(collection(db, collectionName), ...constraints);
    } catch (err) {
      setError(err);
      setLoading(false);
      return;
    }

    if (realtime) {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            setData([]);
          } else {
            const results = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setData(results);
          }
          setLoading(false);
        },
        (err) => {
          console.error(`Error fetching ${collectionName}:`, err);
          // Fall back to static data on error
          const fallback = fallbackData[collectionName] || [];
          setData(fallback);
          setError(err);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      getDocs(q)
        .then((snapshot) => {
          if (snapshot.empty) {
            setData([]);
          } else {
            const results = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setData(results);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(`Error fetching ${collectionName}:`, err);
          const fallback = fallbackData[collectionName] || [];
          setData(fallback);
          setError(err);
          setLoading(false);
        });
    }
  }, [collectionName, orderByField, whereField, whereValue, realtime]);

  return { data, loading, error };
}

/**
 * Hook to add a document to a collection
 */
export function useAddDocument(collectionName) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addDocument = async (data) => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured() || !db) {
        // Local in-memory fallback
        return new Promise((resolve) => {
          setTimeout(() => {
            if (!fallbackData[collectionName]) {
              fallbackData[collectionName] = [];
            }
            const newDoc = { id: Date.now().toString(), ...data, createdAt: new Date().toISOString() };
            fallbackData[collectionName].push(newDoc);
            setLoading(false);
            fallbackEvent.dispatchEvent(new Event("update"));
            resolve({ id: newDoc.id });
          }, 300);
        });
      }
      const docRef = await addDoc(collection(db, collectionName), data);
      setLoading(false);
      return docRef;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return { addDocument, loading, error };
}

/**
 * Hook to update a document in a collection
 */
export function useUpdateDocument(collectionName) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateDocument = async (docId, data) => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured() || !db) {
        // Local in-memory fallback
        return new Promise((resolve) => {
          setTimeout(() => {
            if (fallbackData[collectionName]) {
              const index = fallbackData[collectionName].findIndex(doc => doc.id === docId);
              if (index !== -1) {
                fallbackData[collectionName][index] = { ...fallbackData[collectionName][index], ...data };
              }
            }
            setLoading(false);
            fallbackEvent.dispatchEvent(new Event("update"));
            resolve();
          }, 300);
        });
      }
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, data, { merge: true });
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return { updateDocument, loading, error };
}

/**
 * Hook to delete a document from a collection
 */
export function useDeleteDocument(collectionName) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteDocument = async (docId) => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured() || !db) {
        // Local in-memory fallback
        return new Promise((resolve) => {
          setTimeout(() => {
            if (fallbackData[collectionName]) {
              fallbackData[collectionName] = fallbackData[collectionName].filter(doc => doc.id !== docId);
            }
            setLoading(false);
            fallbackEvent.dispatchEvent(new Event("update"));
            resolve();
          }, 300);
        });
      }
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return { deleteDocument, loading, error };
}

export { fallbackData };
