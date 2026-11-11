// src/pages/Resources/index.jsx
import React, { useState } from 'react';
import { ExternalLink, Plus, Video, FileText, Globe, Trash2, X, Bookmark } from 'lucide-react';
import { useVaultStore } from '../../stores/useVaultStore';

export const Resources = () => {
  const { resources, addResource, deleteResource } = useVaultStore();
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('tool');
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    addResource({
      title,
      url: url.startsWith('http') ? url : `https://${url}`,
      type,
      tags: tagInput ? tagInput.split(',').map((t) => t.trim().toLowerCase()) : ['resource'],
    });

    setTitle('');
    setUrl('');
    setTagInput('');
    setIsModalOpen(false);
  };

  const getTypeIcon = (resourceType) => {
    switch (resourceType) {
      case 'video': return <Video className="w-4 h-4 text-rose-400" />;
      case 'tool': return <Globe className="w-4 h-4 text-cyan-400" />;
      default: return <FileText className="w-4 h-4 text-indigo-400" />;
    }
  };

  const filteredResources = resources.filter((r) => filter === 'all' || r.type === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-cyan-400" /> RESOURCE VAULT
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">Curated bookmarks, tools, references, and video streams.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-mono font-semibold px-4 py-2 rounded-xl transition shadow-[0_0_20px_rgba(6,182,212,0.25)] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> ADD REPO
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-3">
        {['all', 'tool', 'article', 'video'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`text-xs font-mono capitalize px-3.5 py-1.5 rounded-lg transition ${
              filter === tab
                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="group bg-[#0c0d14]/80 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-800">{getTypeIcon(res.type)}</div>
                <div className="flex items-center gap-2">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-cyan-400 rounded-lg transition"
                    title="Visit Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => deleteResource(res.id)}
                    className="p-1.5 hover:bg-rose-950/40 text-zinc-600 hover:text-rose-400 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                {res.title}
              </h3>
              <p className="text-xs text-zinc-500 font-mono truncate mt-1">{res.url}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-900 flex flex-wrap gap-1.5">
              {res.tags?.map((tag) => (
                <span key={tag} className="text-[9px] font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Resource */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0b0c10] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">SAVE TO REPO VAULT</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase">Resource Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tailwind CSS Documentation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase">Target URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="tool">Tool / Utility</option>
                    <option value="article">Article / Doc</option>
                    <option value="video">Video Stream</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="css, design"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
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
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-mono font-semibold rounded-xl transition"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};