// src/utils/mockData.js
export const mockNotes = [
  {
    id: '1',
    title: 'React Architecture Best Practices',
    content: 'Modular folder structure, custom hooks, and separation of concerns are critical...',
    tags: ['react', 'frontend', 'architecture'],
    linkedNoteIds: ['2'],
    createdAt: '2025-02-15',
    updatedAt: '2025-02-18',
  },
  {
    id: '2',
    title: 'State Management with Zustand',
    content: 'Zustand is minimalist, fast, and does not need boilerplate like Redux...',
    tags: ['react', 'state-management'],
    linkedNoteIds: ['1'],
    createdAt: '2025-02-16',
    updatedAt: '2025-02-17',
  },
  {
    id: '3',
    title: 'Firebase vs Supabase',
    content: 'Firestore is NoSQL, whereas Supabase is Postgres based...',
    tags: ['database', 'backend'],
    linkedNoteIds: [],
    createdAt: '2025-02-10',
    updatedAt: '2025-02-12',
  },
];

export const mockResources = [
  {
    id: '1',
    title: 'Tailwind CSS Documentation',
    url: 'https://tailwindcss.com',
    type: 'tool',
    tags: ['css', 'styling'],
    createdAt: '2025-02-01',
  },
  {
    id: '2',
    title: 'Building a Second Brain - Tiago Forte',
    url: 'https://fortelabs.com',
    type: 'article',
    tags: ['productivity', 'pkm'],
    createdAt: '2025-02-05',
  },
];

export const mockJournal = [
  {
    id: '1',
    date: '2025-02-18',
    content: 'Started building Nexus Vault frontend today. Everything is aligned!',
    mood: 'great',
    tags: ['coding', 'nexus-vault'],
  },
];