// src/stores/useVaultStore.js
import { create } from 'zustand';
import { mockNotes, mockResources, mockJournal } from '../utils/mockData';
import { saveUserVaultData, loadUserVaultData } from '../firebase/firestore';

const defaultCollections = [
  { id: '1', name: 'Web Engineering', description: 'Frontend, architecture, and systems', color: 'from-blue-600 to-indigo-600' },
  { id: '2', name: 'Digital Philosophy', description: 'Mental models and PKM paradigms', color: 'from-purple-600 to-pink-600' },
  { id: '3', name: 'Startup Ideas', description: 'SaaS blueprints and venture thoughts', color: 'from-emerald-600 to-teal-600' },
];

// Reliable LocalStorage Loader
const getStorageKey = (uid) => `nexus_vault_data_${uid || 'guest'}`;

const loadLocalData = (uid) => {
  try {
    const saved = localStorage.getItem(getStorageKey(uid));
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        notes: Array.isArray(parsed?.notes) ? parsed.notes : [],
        resources: Array.isArray(parsed?.resources) ? parsed.resources : [],
        journalEntries: Array.isArray(parsed?.journalEntries) ? parsed.journalEntries : [],
        collections: Array.isArray(parsed?.collections) ? parsed.collections : defaultCollections,
      };
    }
  } catch (e) {}
  return {
    notes: mockNotes,
    resources: mockResources,
    journalEntries: mockJournal,
    collections: defaultCollections,
  };
};

const initialData = loadLocalData(null);

export const useVaultStore = create((set, get) => ({
  user: null,

  // User Login & Load Data
  setUser: async (user) => {
    if (user) {
      // 1. Pehle local storage se foran load karein (0 second delay)
      const local = loadLocalData(user.uid);
      set({
        user,
        notes: local.notes,
        resources: local.resources,
        journalEntries: local.journalEntries,
        collections: local.collections,
        selectedNoteId: local.notes[0]?.id || null,
      });

      // 2. Background me Cloud Firestore se sync karein
      const cloudData = await loadUserVaultData(user.uid);
      if (cloudData) {
        set({
          notes: cloudData.notes || local.notes,
          resources: cloudData.resources || local.resources,
          journalEntries: cloudData.journalEntries || local.journalEntries,
          collections: cloudData.collections || local.collections,
          selectedNoteId: cloudData.notes?.[0]?.id || local.notes[0]?.id || null,
        });
        // Update local cache with cloud data
        localStorage.setItem(getStorageKey(user.uid), JSON.stringify(cloudData));
      }
    } else {
      set({ user: null });
    }
  },

  notes: initialData.notes,
  selectedNoteId: initialData.notes[0]?.id || null,
  resources: initialData.resources,
  journalEntries: initialData.journalEntries,
  collections: initialData.collections,
  recentNoteIds: [],
  accentTheme: 'cyan',
  searchQuery: '',

  isSidebarOpen: typeof window !== 'undefined' ? window.innerWidth > 1024 : true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),

  setAccentTheme: (theme) => set({ accentTheme: theme }),
  clearRecentNotes: () => set({ recentNoteIds: [] }),
  trackNoteAccess: (id) => {
    set((state) => {
      const filtered = state.recentNoteIds.filter((noteId) => noteId !== id);
      return { recentNoteIds: [id, ...filtered].slice(0, 6) };
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedNoteId: (id) => {
    get().trackNoteAccess(id);
    set({ selectedNoteId: id });
  },

  // Helper to persist data to LocalStorage AND Cloud Firestore
  syncData: (state, updatedData) => {
    const fullData = {
      notes: updatedData.notes !== undefined ? updatedData.notes : state.notes,
      resources: updatedData.resources !== undefined ? updatedData.resources : state.resources,
      journalEntries: updatedData.journalEntries !== undefined ? updatedData.journalEntries : state.journalEntries,
      collections: updatedData.collections !== undefined ? updatedData.collections : state.collections,
    };

    // 1. Save to LocalStorage immediately
    try {
      localStorage.setItem(getStorageKey(state.user?.uid), JSON.stringify(fullData));
    } catch (e) {}

    // 2. Save to Cloud Firestore
    if (state.user?.uid) {
      saveUserVaultData(state.user.uid, fullData);
    }
  },

  // Notes Actions
  addNote: (title = 'Untitled Note', collectionId = null) => {
    const newNote = {
      id: Date.now().toString(),
      title,
      content: '',
      tags: ['general'],
      collectionId: collectionId,
      isPinned: false,
      linkedNoteIds: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    set((state) => {
      const updatedNotes = [newNote, ...state.notes];
      state.syncData(state, { notes: updatedNotes });
      return {
        notes: updatedNotes,
        selectedNoteId: newNote.id,
        recentNoteIds: [newNote.id, ...state.recentNoteIds.filter((nId) => nId !== newNote.id)].slice(0, 6),
      };
    });
  },

  updateNote: (id, updatedFields) => {
    set((state) => {
      const updatedNotes = state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updatedFields, updatedAt: new Date().toISOString().split('T')[0] }
          : note
      );
      state.syncData(state, { notes: updatedNotes });
      return { notes: updatedNotes };
    });
  },

  togglePinNote: (id) => {
    set((state) => {
      const updatedNotes = state.notes.map((note) =>
        note.id === id ? { ...note, isPinned: !note.isPinned } : note
      );
      state.syncData(state, { notes: updatedNotes });
      return { notes: updatedNotes };
    });
  },

  deleteNote: (id) => {
    set((state) => {
      const remainingNotes = state.notes.filter((n) => n.id !== id);
      state.syncData(state, { notes: remainingNotes });
      return {
        notes: remainingNotes,
        selectedNoteId: state.selectedNoteId === id ? remainingNotes[0]?.id || null : state.selectedNoteId,
        recentNoteIds: state.recentNoteIds.filter((noteId) => noteId !== id),
      };
    });
  },

  addCollection: (name, description, color = 'from-cyan-600 to-indigo-600') => {
    const newCol = { id: Date.now().toString(), name, description, color };
    set((state) => {
      const updatedCols = [...state.collections, newCol];
      state.syncData(state, { collections: updatedCols });
      return { collections: updatedCols };
    });
  },

  deleteCollection: (id) => {
    set((state) => {
      const updatedCols = state.collections.filter((c) => c.id !== id);
      const updatedNotes = state.notes.map((n) => (n.collectionId === id ? { ...n, collectionId: null } : n));
      state.syncData(state, { collections: updatedCols, notes: updatedNotes });
      return { collections: updatedCols, notes: updatedNotes };
    });
  },

  addResource: (resource) => {
    set((state) => {
      const updatedRes = [{ id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0], ...resource }, ...state.resources];
      state.syncData(state, { resources: updatedRes });
      return { resources: updatedRes };
    });
  },

  deleteResource: (id) => {
    set((state) => {
      const updatedRes = state.resources.filter((r) => r.id !== id);
      state.syncData(state, { resources: updatedRes });
      return { resources: updatedRes };
    });
  },

  addJournalEntry: (entry) => {
    set((state) => {
      const updatedLogs = [{ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], ...entry }, ...state.journalEntries];
      state.syncData(state, { journalEntries: updatedLogs });
      return { journalEntries: updatedLogs };
    });
  },

  deleteJournalEntry: (id) => {
    set((state) => {
      const updatedLogs = state.journalEntries.filter((item) => item.id !== id);
      state.syncData(state, { journalEntries: updatedLogs });
      return { journalEntries: updatedLogs };
    });
  },
}));