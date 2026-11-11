// src/stores/useVaultStore.js
import { create } from 'zustand';
import { mockNotes, mockResources, mockJournal } from '../utils/mockData';
import { saveUserVaultData, loadUserVaultData } from '../firebase/firestore';

const defaultCollections = [
  { id: '1', name: 'Web Engineering', description: 'Frontend, architecture, and systems', color: 'from-blue-600 to-indigo-600' },
  { id: '2', name: 'Digital Philosophy', description: 'Mental models and PKM paradigms', color: 'from-purple-600 to-pink-600' },
  { id: '3', name: 'Startup Ideas', description: 'SaaS blueprints and venture thoughts', color: 'from-emerald-600 to-teal-600' },
];

export const useVaultStore = create((set, get) => ({
  user: null,

  // Load from Cloud on Login
  setUser: async (user) => {
    if (user) {
      set({ user });
      // Fetch from Cloud Firestore
      const cloudData = await loadUserVaultData(user.uid);
      if (cloudData) {
        set({
          notes: cloudData.notes || [],
          resources: cloudData.resources || [],
          journalEntries: cloudData.journalEntries || [],
          collections: cloudData.collections || defaultCollections,
          selectedNoteId: cloudData.notes?.[0]?.id || null,
        });
      } else {
        // Fresh user: start clean
        set({
          notes: [],
          resources: [],
          journalEntries: [],
          collections: defaultCollections,
          selectedNoteId: null,
        });
      }
    } else {
      set({ user: null });
    }
  },

  notes: [],
  selectedNoteId: null,
  resources: [],
  journalEntries: [],
  collections: defaultCollections,
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

  // Notes Actions with Auto Cloud Sync
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
      if (state.user) {
        saveUserVaultData(state.user.uid, { ...state, notes: updatedNotes });
      }
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
      if (state.user) {
        saveUserVaultData(state.user.uid, { ...state, notes: updatedNotes });
      }
      return { notes: updatedNotes };
    });
  },

  togglePinNote: (id) => {
    set((state) => {
      const updatedNotes = state.notes.map((note) =>
        note.id === id ? { ...note, isPinned: !note.isPinned } : note
      );
      if (state.user) {
        saveUserVaultData(state.user.uid, { ...state, notes: updatedNotes });
      }
      return { notes: updatedNotes };
    });
  },

  deleteNote: (id) => {
    set((state) => {
      const remainingNotes = state.notes.filter((n) => n.id !== id);
      if (state.user) {
        saveUserVaultData(state.user.uid, { ...state, notes: remainingNotes });
      }
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
      if (state.user) saveUserVaultData(state.user.uid, { ...state, collections: updatedCols });
      return { collections: updatedCols };
    });
  },

  deleteCollection: (id) => {
    set((state) => {
      const updatedCols = state.collections.filter((c) => c.id !== id);
      const updatedNotes = state.notes.map((n) => (n.collectionId === id ? { ...n, collectionId: null } : n));
      if (state.user) saveUserVaultData(state.user.uid, { ...state, collections: updatedCols, notes: updatedNotes });
      return { collections: updatedCols, notes: updatedNotes };
    });
  },

  addResource: (resource) => {
    set((state) => {
      const updatedRes = [{ id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0], ...resource }, ...state.resources];
      if (state.user) saveUserVaultData(state.user.uid, { ...state, resources: updatedRes });
      return { resources: updatedRes };
    });
  },

  deleteResource: (id) => {
    set((state) => {
      const updatedRes = state.resources.filter((r) => r.id !== id);
      if (state.user) saveUserVaultData(state.user.uid, { ...state, resources: updatedRes });
      return { resources: updatedRes };
    });
  },

  addJournalEntry: (entry) => {
    set((state) => {
      const updatedLogs = [{ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], ...entry }, ...state.journalEntries];
      if (state.user) saveUserVaultData(state.user.uid, { ...state, journalEntries: updatedLogs });
      return { journalEntries: updatedLogs };
    });
  },

  deleteJournalEntry: (id) => {
    set((state) => {
      const updatedLogs = state.journalEntries.filter((item) => item.id !== id);
      if (state.user) saveUserVaultData(state.user.uid, { ...state, journalEntries: updatedLogs });
      return { journalEntries: updatedLogs };
    });
  },
}));