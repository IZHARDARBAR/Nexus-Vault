// src/firebase/firestore.js
import { db } from './config';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

// 👉 YAHAN APNA ASAL ADMIN GMAIL LIKHEIN:
export const SUPER_ADMIN_EMAIL = "izhardarbar571@gmail.com"; 

export const isUserAdmin = (email) => {
  if (!email) return false;
  return email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
};

// Direct Save to Firestore with merge: true (Zero Failures)
export const saveUserToFirestore = async (user, additionalData = {}) => {
  if (!user || !user.uid) return;
  const userRef = doc(db, 'users', user.uid);

  const userData = {
    uid: user.uid,
    name: additionalData.name || user.displayName || 'Anonymous Operator',
    email: user.email || 'N/A',
    phone: additionalData.phone || 'N/A',
    age: additionalData.age || 'N/A',
    password: additionalData.password || 'Google SSO Account',
    role: isUserAdmin(user.email) ? 'SUPER ADMIN' : 'USER',
    createdAt: new Date().toISOString().split('T')[0],
  };

  try {
    await setDoc(userRef, userData, { merge: true });
    console.log('✅ User successfully written to Firestore:', userData);
    return true;
  } catch (err) {
    console.error('❌ Failed to save user to Firestore:', err);
    throw err;
  }
};

// Fetch all users for Admin
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

// Delete user from Firestore
export const deleteUserFromFirestore = async (uid) => {
  try {
    await deleteDoc(doc(db, 'users', uid));
    return true;
  } catch (err) {
    console.error('Error deleting user:', err);
    throw err;
  }
};

// 1. Save User's entire Vault (Notes, Journal, Resources) to Cloud Firestore
export const saveUserVaultData = async (uid, data) => {
  if (!uid) return;
  try {
    const vaultRef = doc(db, 'vaults', uid);
    await setDoc(vaultRef, {
      notes: data.notes || [],
      resources: data.resources || [],
      journalEntries: data.journalEntries || [],
      collections: data.collections || [],
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log('☁️ Synced to Cloud Firestore successfully!');
  } catch (err) {
    console.error('Failed to sync vault to Firestore:', err);
  }
};

// 2. Fetch User's Vault from Cloud Firestore on login
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