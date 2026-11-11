// src/firebase/firestore.js
import { db } from './config';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

// 👉 1. ADMIN CONFIGURATION (Apna Gmail likhein)
export const SUPER_ADMIN_EMAIL = "your-email@gmail.com"; 

export const isUserAdmin = (email) => {
  if (!email) return false;
  return email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
};

// 👉 2. USER PROFILE FUNCTIONS (FOR LOGIN & ADMIN)
export const saveUserToFirestore = async (user, additionalData = {}) => {
  if (!user || !user.uid) return;
  const userRef = doc(db, 'users', user.uid);

  const userData = {
    uid: user.uid,
    name: additionalData.name || user.displayName || 'Anonymous Operator',
    email: user.email || 'N/A',
    phone: additionalData.phone || 'N/A',
    age: additionalData.age || 'N/A',
    dob: additionalData.dob || 'N/A',
    password: additionalData.password || 'Google SSO Account',
    role: isUserAdmin(user.email) ? 'SUPER ADMIN' : 'USER',
    createdAt: new Date().toISOString().split('T')[0],
  };

  try {
    await setDoc(userRef, userData, { merge: true });
    console.log('✅ User profile saved to Firestore!');
    return true;
  } catch (err) {
    console.error('❌ Failed to save user profile:', err);
    throw err;
  }
};

export const getAllUsersFromFirestore = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const usersList = [];
    querySnapshot.forEach((docSnap) => {
      usersList.push(docSnap.data());
    });
    return usersList;
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
};

export const deleteUserFromFirestore = async (uid) => {
  try {
    await deleteDoc(doc(db, 'users', uid));
    return true;
  } catch (err) {
    console.error('Error deleting user:', err);
    throw err;
  }
};

// 👉 3. VAULT DATA SYNC (NOTES, RESOURCES, JOURNAL, COLLECTIONS)
export const saveUserVaultData = async (uid, data) => {
  if (!uid) return;
  try {
    const vaultRef = doc(db, 'vaults', uid);
    
    const cleanPayload = {
      notes: (data.notes || []).map((n) => ({
        id: String(n.id || Date.now()),
        title: String(n.title || ''),
        content: String(n.content || ''),
        tags: Array.isArray(n.tags) ? n.tags : [],
        isPinned: Boolean(n.isPinned),
        collectionId: n.collectionId || null,
        createdAt: String(n.createdAt || ''),
        updatedAt: String(n.updatedAt || ''),
      })),
      resources: (data.resources || []).map((r) => ({
        id: String(r.id || Date.now()),
        title: String(r.title || ''),
        url: String(r.url || ''),
        type: String(r.type || 'tool'),
        tags: Array.isArray(r.tags) ? r.tags : [],
        createdAt: String(r.createdAt || ''),
      })),
      journalEntries: (data.journalEntries || []).map((j) => ({
        id: String(j.id || Date.now()),
        date: String(j.date || ''),
        content: String(j.content || ''),
        mood: String(j.mood || 'great'),
        tags: Array.isArray(j.tags) ? j.tags : [],
      })),
      collections: (data.collections || []).map((c) => ({
        id: String(c.id || Date.now()),
        name: String(c.name || ''),
        description: String(c.description || ''),
        color: String(c.color || ''),
      })),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(vaultRef, cleanPayload, { merge: true });
    console.log('✅ Vault successfully synced to Firestore!');
  } catch (err) {
    console.error('❌ Failed to sync vault to Firestore:', err);
  }
};

export const loadUserVaultData = async (uid) => {
  if (!uid) return null;
  try {
    const vaultRef = doc(db, 'vaults', uid);
    const snap = await getDoc(vaultRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error('Failed to load vault from Firestore:', err);
    return null;
  }
};