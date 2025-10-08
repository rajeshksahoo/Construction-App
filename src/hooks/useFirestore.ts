import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export function useFirestore<T>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 👇 Real-time listener for the Firestore collection
  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as T[];
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore snapshot error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  // 👇 Add a new document to Firestore
  const addItem = async (item: Omit<T, 'id' | 'createdAt'>) => {
    try {
      console.log('Adding item to Firestore:', item);
      const docRef = await addDoc(collection(db, collectionName), {
        ...item,
        createdAt: serverTimestamp(), // ✅ Use server timestamp
      });
      console.log('Item added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('Error adding item:', err);
      const msg = err instanceof Error ? err.message : 'Failed to add item';
      setError(msg);
      throw err;
    }
  };

  // 👇 Update an existing document
  const updateItem = async (id: string, updates: Partial<T>) => {
    try {
      await updateDoc(doc(db, collectionName, id), updates);
      console.log('Item updated:', id);
    } catch (err) {
      console.error('Error updating item:', err);
      const msg = err instanceof Error ? err.message : 'Failed to update item';
      setError(msg);
      throw err;
    }
  };

  // 👇 Delete a document
  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      console.log('Item deleted:', id);
    } catch (err) {
      console.error('Error deleting item:', err);
      const msg = err instanceof Error ? err.message : 'Failed to delete item';
      setError(msg);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
  };
}
