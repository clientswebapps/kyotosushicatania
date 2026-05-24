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

// Static fallback data for when Firebase is not configured or unavailable
const fallbackData = {
  heroSlides: [
    {
      id: "1",
      title: "Welcome to Kyō-To",
      subtitle: "Japanese Asian Contemporary Cuisine in the heart of Catania",
      ctaText: "Explore the Menu",
      ctaLink: "/menu",
      imageUrl: "/images/dragon-roll.avif",
      order: 1,
      active: true,
    },
    {
      id: "2",
      title: "Fresh Sushi Every Day",
      subtitle: "Selected ingredients for a unique experience",
      ctaText: "Reserve Now",
      ctaLink: "/contact",
      imageUrl: "/images/sashimi-platter.avif",
      order: 2,
      active: true,
    },
    {
      id: "3",
      title: "Special Promotion",
      subtitle: "All You Can Eat starting from €24.90",
      ctaText: "Learn More",
      ctaLink: "/menu",
      imageUrl: "/images/tonkotsu-ramen.avif",
      order: 3,
      active: true,
    },
  ],
  promotions: [
    {
      id: "promo-1",
      title: "Chef's Tasting Menu",
      description: "Experience 8 courses of premium seasonal selections paired with sake.",
      tag: "NEW",
      imageUrl: "/images/sashimi-platter.avif",
      active: true,
      order: 1
    },
    {
      id: "promo-2",
      title: "Lunch Special",
      description: "Enjoy our signature bento boxes with a complimentary matcha tea.",
      tag: "15% OFF",
      imageUrl: "/images/tempura-platter.avif",
      active: true,
      order: 2
    },
    {
      id: "promo-3",
      title: "Happy Hour Drinks",
      description: "Half-price on all signature cocktails and premium sake glasses.",
      tag: "5PM - 7PM",
      imageUrl: "/images/rainbow-roll.avif",
      active: true,
      order: 3
    },
    {
      id: "promo-4",
      title: "Weekend Delivery",
      description: "Get free delivery on all orders over €50 this weekend.",
      tag: "FREE DELIVERY",
      imageUrl: "/images/dragon-roll.avif",
      active: true,
      order: 4
    }
  ],
  menuCategories: [
    { id: "sushi-rolls", name: "Sushi Rolls", nameIt: "Sushi Rolls", icon: "🍣", order: 1 },
    { id: "sashimi", name: "Sashimi", nameIt: "Sashimi", icon: "🐟", order: 2 },
    { id: "nigiri", name: "Nigiri", nameIt: "Nigiri", icon: "🍙", order: 3 },
    { id: "ramen", name: "Ramen & Noodles", nameIt: "Ramen & Noodles", icon: "🍜", order: 4 },
    { id: "tempura", name: "Tempura", nameIt: "Tempura", icon: "🍤", order: 5 },
    { id: "antipasti", name: "Starters", nameIt: "Starters", icon: "🥗", order: 6 },
    { id: "bevande", name: "Drinks", nameIt: "Drinks", icon: "🍶", order: 7 },
    { id: "dolci", name: "Desserts", nameIt: "Desserts", icon: "🍡", order: 8 },
  ],
  menuItems: [
    // Best Sellers
    {
      id: "1",
      name: "Dragon Roll",
      description: "Shrimp tempura, avocado, tobiko, and unagi sauce",
      price: 14.90,
      categoryId: "sushi-rolls",
      isBestSeller: true,
      isAvailable: true,
      order: 1,
      imageUrl: "",
    },
    {
      id: "2",
      name: "Premium Mixed Sashimi",
      description: "15-piece selection: salmon, tuna, sea bass, red shrimp, and yellowtail",
      price: 22.90,
      categoryId: "sashimi",
      isBestSeller: true,
      isAvailable: true,
      order: 1,
      imageUrl: "",
    },
    {
      id: "3",
      name: "Tonkotsu Ramen",
      description: "18-hour pork broth, chashu, marinated egg, nori, and scallion",
      price: 16.90,
      categoryId: "ramen",
      isBestSeller: true,
      isAvailable: true,
      order: 1,
      imageUrl: "",
    },
    {
      id: "4",
      name: "Rainbow Roll",
      description: "California roll topped with salmon, tuna, avocado, and shrimp",
      price: 16.50,
      categoryId: "sushi-rolls",
      isBestSeller: true,
      isAvailable: true,
      order: 2,
      imageUrl: "",
    },
    {
      id: "5",
      name: "Mixed Tempura",
      description: "Shrimp and seasonal vegetables in light, crispy batter",
      price: 13.90,
      categoryId: "tempura",
      isBestSeller: true,
      isAvailable: true,
      order: 1,
      imageUrl: "",
    },
    {
      id: "6",
      name: "Grilled Gyoza",
      description: "Japanese dumplings filled with pork and vegetables, served with ponzu sauce",
      price: 8.90,
      categoryId: "antipasti",
      isBestSeller: true,
      isAvailable: true,
      order: 1,
      imageUrl: "",
    },
    // Regular items - Sushi Rolls
    {
      id: "7",
      name: "California Roll",
      description: "Crab, avocado, cucumber, and mayonnaise",
      price: 9.90,
      categoryId: "sushi-rolls",
      isBestSeller: false,
      isAvailable: true,
      order: 3,
      imageUrl: "",
    },
    {
      id: "8",
      name: "Spicy Tuna Roll",
      description: "Spicy tuna, cucumber, scallion, and sriracha sauce",
      price: 12.90,
      categoryId: "sushi-rolls",
      isBestSeller: false,
      isAvailable: true,
      order: 4,
      imageUrl: "",
    },
    {
      id: "9",
      name: "Philadelphia Roll",
      description: "Salmon, cream cheese, avocado, and sesame",
      price: 10.90,
      categoryId: "sushi-rolls",
      isBestSeller: false,
      isAvailable: true,
      order: 5,
      imageUrl: "",
    },
    {
      id: "10",
      name: "Volcano Roll",
      description: "Tempura roll with spicy tuna, spicy mayo sauce, and tobiko",
      price: 15.90,
      categoryId: "sushi-rolls",
      isBestSeller: false,
      isAvailable: true,
      order: 6,
      imageUrl: "",
    },
    // Sashimi
    {
      id: "11",
      name: "Salmon Sashimi",
      description: "5 slices of fresh Norwegian salmon",
      price: 9.90,
      categoryId: "sashimi",
      isBestSeller: false,
      isAvailable: true,
      order: 2,
      imageUrl: "",
    },
    {
      id: "12",
      name: "Tuna Sashimi",
      description: "5 slices of premium bluefin tuna",
      price: 12.90,
      categoryId: "sashimi",
      isBestSeller: false,
      isAvailable: true,
      order: 3,
      imageUrl: "",
    },
    // Nigiri
    {
      id: "13",
      name: "Salmon Nigiri",
      description: "2 pieces of salmon on rice",
      price: 5.90,
      categoryId: "nigiri",
      isBestSeller: false,
      isAvailable: true,
      order: 1,
      imageUrl: "",
    },
    {
      id: "14",
      name: "Shrimp Nigiri",
      description: "2 pieces of cooked shrimp on rice",
      price: 6.50,
      categoryId: "nigiri",
      isBestSeller: false,
      isAvailable: true,
      order: 2,
      imageUrl: "",
    },
    {
      id: "15",
      name: "Tuna Nigiri",
      description: "2 pieces of bluefin tuna on rice",
      price: 7.90,
      categoryId: "nigiri",
      isBestSeller: false,
      isAvailable: true,
      order: 3,
      imageUrl: "",
    },
    // Ramen
    {
      id: "16",
      name: "Shoyu Ramen",
      description: "Soy broth, chicken, marinated egg, bamboo shoots, and nori",
      price: 14.90,
      categoryId: "ramen",
      isBestSeller: false,
      isAvailable: true,
      order: 2,
      imageUrl: "",
    },
    {
      id: "17",
      name: "Vegetarian Miso Ramen",
      description: "Miso broth, tofu, shiitake mushrooms, corn, and spinach",
      price: 13.90,
      categoryId: "ramen",
      isBestSeller: false,
      isAvailable: true,
      order: 3,
      imageUrl: "",
    },
    // Tempura
    {
      id: "18",
      name: "Shrimp Tempura",
      description: "5 shrimp in light batter with tentsuyu sauce",
      price: 12.90,
      categoryId: "tempura",
      isBestSeller: false,
      isAvailable: true,
      order: 2,
      imageUrl: "",
    },
    {
      id: "19",
      name: "Vegetable Tempura",
      description: "Selection of seasonal vegetables in crispy batter",
      price: 9.90,
      categoryId: "tempura",
      isBestSeller: false,
      isAvailable: true,
      order: 3,
      imageUrl: "",
    },
    // Antipasti
    {
      id: "20",
      name: "Edamame",
      description: "Steamed soybeans with sea salt",
      price: 5.50,
      categoryId: "antipasti",
      isBestSeller: false,
      isAvailable: true,
      order: 2,
      imageUrl: "",
    },
    {
      id: "21",
      name: "Takoyaki",
      description: "Octopus balls with takoyaki sauce, mayonnaise, and katsuobushi",
      price: 8.50,
      categoryId: "antipasti",
      isBestSeller: false,
      isAvailable: true,
      order: 3,
      imageUrl: "",
    },
    // Bevande
    {
      id: "22",
      name: "Sake Premium",
      description: "Japanese sake served hot or cold",
      price: 8.90,
      categoryId: "bevande",
      isBestSeller: false,
      isAvailable: true,
      order: 1,
      imageUrl: "",
    },
    {
      id: "23",
      name: "Matcha Latte",
      description: "Japanese matcha tea with frothed milk",
      price: 5.50,
      categoryId: "bevande",
      isBestSeller: false,
      isAvailable: true,
      order: 2,
      imageUrl: "",
    },
    // Dolci
    {
      id: "24",
      name: "Mochi Ice Cream",
      description: "3 pieces: matcha, strawberry, and mango",
      price: 7.50,
      categoryId: "dolci",
      isBestSeller: false,
      isAvailable: true,
      order: 1,
      imageUrl: "",
    },
    {
      id: "25",
      name: "Dorayaki",
      description: "Japanese pancake filled with azuki bean cream",
      price: 6.50,
      categoryId: "dolci",
      isBestSeller: false,
      isAvailable: true,
      order: 2,
      imageUrl: "",
    },
    // Signature Rolls
    {
      id: "26",
      name: "Kyoto Rock N Roll",
      description: "Tuna, asparagus, avocado, tobiko, salmon and spicy Kyoto sauce",
      price: 16.00,
      categoryId: "sushi-rolls",
      isBestSeller: true,
      isAvailable: true,
      order: 7,
      imageUrl: "",
    },
    {
      id: "27",
      name: "Kyoto Fire Roll",
      description: "Shrimp tempura, avocado, Japanese mayonnaise, tuna and Kyoto sauce",
      price: 17.00,
      categoryId: "sushi-rolls",
      isBestSeller: true,
      isAvailable: true,
      order: 8,
      imageUrl: "",
    },
    {
      id: "28",
      name: "Kyoto Rainbow Roll",
      description: "King crab meat, avocado, Japanese mayonnaise, salmon, tuna and Kyoto sauce",
      price: 16.00,
      categoryId: "sushi-rolls",
      isBestSeller: false,
      isAvailable: true,
      order: 9,
      imageUrl: "",
    },
    {
      id: "29",
      name: "Kyoto Caterpillar Roll",
      description: "Sea bass ceviche, tomato, onion crunch, avocado, salmon, ikura, Japanese mayonnaise and teryaki sauce",
      price: 18.00,
      categoryId: "sushi-rolls",
      isBestSeller: false,
      isAvailable: true,
      order: 10,
      imageUrl: "",
    },
    {
      id: "30",
      name: "Kyoto Dragon Roll",
      description: "Eel, cucumber, avocado, crunch, tobiko and Kyoto sauce",
      price: 18.90,
      categoryId: "sushi-rolls",
      isBestSeller: true,
      isAvailable: true,
      order: 11,
      imageUrl: "",
    },
    // Special Rolls
    {
      id: "31",
      name: "Taiyo Roll",
      description: "Salmon, philadelphia, cooked shrimp, avocado, mayonnaise and mango",
      price: 14.50,
      categoryId: "sushi-rolls",
      isBestSeller: false,
      isAvailable: true,
      order: 12,
      imageUrl: "",
    },
    {
      id: "32",
      name: "Kyoto Roll",
      description: "Eel, asparagus, mango, avocado, chili, mayonnaise and teryaki sauce",
      price: 15.00,
      categoryId: "sushi-rolls",
      isBestSeller: false,
      isAvailable: true,
      order: 13,
      imageUrl: "",
    },
    {
      id: "33",
      name: "Tonno Flambé",
      description: "Crabmeat, avocado, cucumber, tuna, crunchy onion, teryaki sauce",
      price: 14.50,
      categoryId: "sushi-rolls",
      isBestSeller: false,
      isAvailable: true,
      order: 14,
      imageUrl: "",
    },
    {
      id: "34",
      name: "Sakura Roll",
      description: "Shrimp tempura, avocado, mayonnaise, salmon, cooked shrimp tartar",
      price: 14.50,
      categoryId: "sushi-rolls",
      isBestSeller: false,
      isAvailable: true,
      order: 15,
      imageUrl: "",
    }
  ],
};

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
            const fallback = fallbackData[collectionName] || [];
            let filtered = fallback;
            if (whereField && whereValue !== undefined) {
              filtered = fallback.filter((item) => item[whereField] === whereValue);
            }
            if (orderByField) {
              filtered.sort((a, b) => (a[orderByField] || 0) - (b[orderByField] || 0));
            }
            setData(filtered);
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
            const fallback = fallbackData[collectionName] || [];
            let filtered = fallback;
            if (whereField && whereValue !== undefined) {
              filtered = fallback.filter((item) => item[whereField] === whereValue);
            }
            if (orderByField) {
              filtered.sort((a, b) => (a[orderByField] || 0) - (b[orderByField] || 0));
            }
            setData(filtered);
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
