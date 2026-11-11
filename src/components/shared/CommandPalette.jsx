// src/components/shared/CommandPalette.jsx
import React, { useState, useEffect } from 'react';
import { Search, FileText, ArrowRight, LayoutDashboard, Share2, Calendar, BookOpen, Plus, X } from 'lucide-react';
import { useVaultStore } from '../../stores/useVaultStore';
import { useNavigate } from 'react-router-dom';

export const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { notes, addNote, setSelectedNoteId } = useVaultStore();
  const navigate = useNavigate();

  // Listen for ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const quickPages = [
    { title: 'Core Dashboard', path: '/', icon: LayoutDashboard },
    { title: 'Neural Notes', path: '/notes', icon: FileText },
    { title: 'Knowledge Graph', path: '/graph', icon: Share2 },
    { title: 'Chronicle Log', path: '/journal', icon: Calendar },
    { title: 'Resource Vault', path: '/resources', icon: BookOpen },
  ];

  // Filter notes and pages based on query
  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPages = quickPages.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectNote = (noteId) => {
    setSelectedNoteId(noteId);
    navigate('/notes');
    onClose();
  };

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleCreateFastNote = () => {
    addNote(query || 'Quick Capture Thought');
    navigate('/notes');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[#0b0c10]/95 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-zinc-800/80 bg-zinc-950/60">
          <Search className="w-4 h-4 text-cyan-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, jump to note, or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          {query.trim() && (
            <div>
              <p className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-semibold">Action</p>
              <div
                onClick={handleCreateFastNote}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-cyan-950/30 border border-transparent hover:border-cyan-500/30 cursor-pointer text-xs text-cyan-300 font-mono transition"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Create note: "{query}"</span>
                </div>
                <kbd className="text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">↵ Enter</kbd>
              </div>
            </div>
          )}

          {/* Notes Matching */}
          {filteredNotes.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-semibold">Notes</p>
              {filteredNotes.slice(0, 5).map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note.id)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-900/60 cursor-pointer text-xs text-zinc-300 transition group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate group-hover:text-cyan-300">{note.title}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-cyan-400 transition" />
                </div>
              ))}
            </div>
          )}

          {/* Navigation Pages */}
          {filteredPages.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-500 font-semibold">Quick Navigation</p>
              {filteredPages.map((page) => {
                const Icon = page.icon;
                return (
                  <div
                    key={page.path}
                    onClick={() => handleNavigate(page.path)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-900/60 cursor-pointer text-xs text-zinc-300 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400" />
                      <span className="group-hover:text-white">{page.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-600">Jump</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between text-[10px] font-mono text-zinc-500 px-4">
          <span>Search or navigate instantly</span>
          <div className="flex gap-2">
            <span>[ESC] Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};