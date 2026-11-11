// src/pages/Dashboard/index.jsx
import React from 'react';
import { FileText, Share2, BookOpen, Calendar, ArrowUpRight, Zap, ShieldCheck, Activity, Trash2 } from 'lucide-react';
import { useVaultStore } from '../../stores/useVaultStore';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { notes, resources, journalEntries, recentNoteIds, clearRecentNotes, setSelectedNoteId } =
    useVaultStore();
  const navigate = useNavigate();

  // 👉 DYNAMIC GRAPH LINKS CALCULATION (0 Notes = 0 Links)
  const calculateLinks = () => {
    if (!notes || notes.length < 2) return 0;
    let count = 0;
    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        const shared = notes[i].tags?.some((t) => notes[j].tags?.includes(t));
        if (shared) count++;
      }
    }
    return count;
  };

  const dynamicLinks = calculateLinks();

  const metrics = [
    { label: 'SYNAPSE NODES', count: notes.length, icon: FileText, color: 'from-cyan-500 to-blue-500', glow: 'shadow-cyan-500/20' },
    { label: 'GRAPH LINKS', count: dynamicLinks, icon: Share2, color: 'from-indigo-500 to-violet-500', glow: 'shadow-indigo-500/20' },
    { label: 'DATA REPOSITORIES', count: resources.length, icon: BookOpen, color: 'from-violet-500 to-fuchsia-500', glow: 'shadow-fuchsia-500/20' },
    { label: 'CHRONICLE LOGS', count: journalEntries.length, icon: Calendar, color: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20' },
  ];

  // 56 days Activity Matrix
  const days = [];
  const today = new Date();
  for (let i = 55; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const noteCount = notes.filter((n) => n.createdAt === dateStr || n.updatedAt === dateStr).length;
    const journalCount = journalEntries.filter((j) => j.date === dateStr).length;
    days.push({ date: dateStr, activity: noteCount + journalCount });
  }

  const getActivityColor = (level) => {
    if (level === 0) return 'bg-zinc-900/60 border-zinc-800/80';
    if (level === 1) return 'bg-cyan-950 border-cyan-800 text-cyan-400';
    if (level === 2) return 'bg-cyan-600/70 border-cyan-400 shadow-[0_0_8px_#06b6d4]';
    return 'bg-gradient-to-tr from-cyan-400 to-indigo-500 border-white shadow-[0_0_12px_#22d3ee]';
  };

  const activeRecentNotes = recentNoteIds
    .map((id) => notes.find((n) => n.id === id))
    .filter(Boolean)
    .slice(0, 3);

  const handleOpenNote = (id) => {
    setSelectedNoteId(id);
    navigate('/notes');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Welcome HUD Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-900/60 to-[#0c0d14] p-8 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-cyan-500/10 via-indigo-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono tracking-widest uppercase">
            <Zap className="w-3 h-3 text-cyan-400 animate-bounce" /> SYSTEM ONLINE // QUANTUM ENGINE ACTIVE
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Welcome, Neural Architect.
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl font-light leading-relaxed">
            Your second brain is operating with optimum coherence. All neural links and persistent memory caches are synchronized.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className={`group relative overflow-hidden rounded-2xl bg-zinc-950/60 border border-zinc-800/80 p-5 hover:border-zinc-700 transition-all duration-300 hover:shadow-xl ${m.glow}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono text-zinc-400 tracking-wider font-semibold">
                  {m.label}
                </span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${m.color} text-white shadow-lg`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white font-mono tracking-tight group-hover:scale-105 transition-transform duration-200">
                {m.count.toString().padStart(2, '0')}
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]" /> ACTIVE MEMORY
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Matrix Heatmap */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              SYNAPSE COGNITION MATRIX (LAST 56 DAYS)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">Real-time Activity Log</span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col grid-rows-7 gap-2 w-max">
            {days.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.activity} interactions`}
                className={`w-4 h-4 rounded-md border transition-all duration-200 hover:scale-125 cursor-pointer ${getActivityColor(
                  day.activity
                )}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Notes */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6 border-b border-zinc-800/60 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> RECENTLY ACCESSED NODES
            </h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">Direct pointer references from current session</p>
          </div>

          <div className="flex items-center gap-3">
            {activeRecentNotes.length > 0 && (
              <button
                onClick={clearRecentNotes}
                className="text-xs font-mono text-zinc-500 hover:text-rose-400 flex items-center gap-1 transition"
                title="Clear recent history"
              >
                <Trash2 className="w-3.5 h-3.5" /> CLEAR HISTORY
              </button>
            )}

            <button
              onClick={() => navigate('/notes')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              VIEW ALL <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {activeRecentNotes.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
            Recent access buffer cleared. Open any node to track history.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeRecentNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleOpenNote(note.id)}
                className="group p-5 bg-[#0e0e14]/90 border border-zinc-800/80 rounded-xl hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-2">
                    <span>ID: #{note.id.slice(-4)}</span>
                    <span>{note.updatedAt}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {note.title || 'Untitled'}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-2 leading-relaxed font-light">
                    {note.content || 'Memory block unwritten...'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-zinc-900">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/30 px-2 py-0.5 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};