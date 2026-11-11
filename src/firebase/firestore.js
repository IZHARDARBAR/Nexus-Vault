// Add/Replace at the bottom of src/firebase/firestore.js

// 1. Clean Save to Firestore (Only pure data, NO functions)
export const saveUserVaultData = async (uid, data) => {
  if (!uid) return;
  try {
    const vaultRef = doc(db, 'vaults', uid);
    
    // Sirf saaf JSON data Firestore me bhejein
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

// 2. Fetch User Vault from Firestore
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