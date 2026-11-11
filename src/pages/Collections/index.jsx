// src/pages/Collections/index.jsx
import React, { useState } from 'react';
import { Folder, Plus, ArrowRight, ArrowLeft, Trash2, FileText, X } from 'lucide-react';
import { useVaultStore } from '../../stores/useVaultStore';
import { useNavigate } from 'react-router-dom';

export const Collections = () => {
  const { collections, notes, addCollection, deleteCollection, addNote, setSelectedNoteId } =
    useVaultStore();
  const navigate = useNavigate();

  const [activeCollection, setActiveCollection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('from-cyan-600 to-indigo-600');

  const gradients = [
    'from-cyan-600 to-indigo-600',
    'from-purple-600 to-pink-600',
    'from-emerald-600 to-teal-600',
    'from-amber-600 to-orange-600',
    'from-rose-600 to-red-600',
  ];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCollection(name, description, selectedGradient);
    setName('');
    setDescription('');
    setIsModalOpen(false);
  };

  const handleOpenNote = (noteId) => {
    setSelectedNoteId(noteId);
    navigate('/notes');
  };

  const handleCreateNoteInside = () => {
    if (!activeCollection) return;
    addNote(`Note in ${activeCollection.name}`, activeCollection.id);
    navigate('/notes');
  };

  // If a collection is opened, show its inner notes
  if (activeCollection) {
    const innerNotes = notes.filter((n) => n.collectionId === activeCollection.id);

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => setActiveCollection(null)}
          className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-cyan-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Collections
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${activeCollection.color} flex items-center justify-center text-white shadow-lg`}>
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{activeCollection.name}</h2>
              <p className="text-xs text-zinc-400 font-mono">{activeCollection.description || 'Collection Directory'}</p>
            </div>
          </div>

          <button
            onClick={handleCreateNoteInside}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 text-white text-xs font-mono px-4 py-2 rounded-xl transition shadow-lg self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Note Here
          </button>
        </div>

        {/* Inner Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {innerNotes.length === 0 ? (
            <div className="col-span-3 p-12 text-center text-xs font-mono text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
              No notes in this collection yet. Click "Add Note Here" to create one!
            </div>
          ) : (
            innerNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleOpenNote(note.id)}
                className="p-5 bg-[#0c0d14]/80 border border-zinc-800/80 rounded-2xl hover:border-cyan-500/40 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-2">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-mono text-[10px]">{note.updatedAt}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-200 line-clamp-1">{note.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{note.content || 'Empty buffer...'}</p>
                </div>
                <div className="flex gap-1 mt-4">
                  {note.tags.map((t) => (
                    <span key={t} className="text-[9px] font-mono bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Main Collections Directory Grid
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">COLLECTION HUBS</h2>
          <p className="text-sm text-zinc-400">Thematic clusters and directories of your knowledge vault.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 text-white text-xs font-mono font-semibold px-4 py-2 rounded-xl transition shadow-[0_0_20px_rgba(6,182,212,0.25)]"
        >
          <Plus className="w-4 h-4" /> NEW HUB
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {collections.map((col) => {
          const count = notes.filter((n) => n.collectionId === col.id).length;
          return (
            <div
              key={col.id}
              className="group bg-[#0c0d14]/80 border border-zinc-800/80 rounded-2xl p-5 hover:border-cyan-500/40 transition cursor-pointer flex flex-col justify-between"
              onClick={() => setActiveCollection(col)}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${col.color} flex items-center justify-center text-white shadow-lg`}>
                    <Folder className="w-5 h-5" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCollection(col.id);
                    }}
                    className="p-1.5 hover:bg-rose-950/40 text-zinc-600 hover:text-rose-400 rounded-lg transition"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="font-semibold text-base text-zinc-100 group-hover:text-cyan-300 transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{col.description || 'Knowledge Hub'}</p>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-900 font-mono">
                <span>{count} connected nodes</span>
                <span className="flex items-center gap-1 group-hover:text-cyan-400">
                  Enter <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Collection */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b0c10] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-mono font-bold text-white uppercase">INITIALIZE NEW HUB</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase">Hub Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase">Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. Models, Prompts, Architecture"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1.5">Theme Gradient</label>
                <div className="flex gap-2">
                  {gradients.map((grad) => (
                    <div
                      key={grad}
                      onClick={() => setSelectedGradient(grad)}
                      className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${grad} cursor-pointer transition ${
                        selectedGradient === grad ? 'ring-2 ring-white scale-110' : 'opacity-60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 text-white text-xs font-mono font-semibold rounded-xl transition"
                >
                  Create Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};