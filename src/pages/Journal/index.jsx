// src/pages/Journal/index.jsx
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Sparkles, Smile, Meh, Frown, Plus, Trash2, Search } from 'lucide-react';
import { useVaultStore } from '../../stores/useVaultStore';

export const Journal = () => {
  const { journalEntries, addJournalEntry, deleteJournalEntry } = useVaultStore();
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('great');
  const [searchLog, setSearchLog] = useState('');

  const handleSave = () => {
    if (!content.trim()) return;

    addJournalEntry({
      date: entryDate,
      content,
      mood: selectedMood,
      tags: ['daily-log'],
    });

    setContent('');
  };

  const moods = [
    { id: 'great', label: 'OPTIMAL', icon: Sparkles, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40' },
    { id: 'good', label: 'POSITIVE', icon: Smile, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' },
    { id: 'neutral', label: 'STEADY', icon: Meh, color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
    { id: 'bad', label: 'HEAVY', icon: Frown, color: 'text-rose-400 border-rose-500/40 bg-rose-950/40' },
  ];

  // Filter historical entries
  const filteredEntries = journalEntries.filter(
    (item) =>
      item.content.toLowerCase().includes(searchLog.toLowerCase()) ||
      item.date.includes(searchLog) ||
      item.mood.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Date & Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c0d14]/90 border border-zinc-800/80 p-5 rounded-2xl shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide font-mono">CHRONICLE LOG</h2>
            <p className="text-xs text-zinc-400">Record daily reflections, telemetry, and cognitive insights.</p>
          </div>
        </div>

        {/* Date Selector */}
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 self-start sm:self-auto"
        />
      </div>

      {/* Editor Box */}
      <div className="bg-[#0c0d14]/90 border border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-2xl">
        {/* Mood Selector Buttons */}
        <div>
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
            COGNITIVE STATE // MOOD
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {moods.map((m) => {
              const Icon = m.icon;
              const isSelected = selectedMood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMood(m.id)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-mono transition duration-200 ${
                    isSelected
                      ? `${m.color} font-bold shadow-md`
                      : 'border-zinc-800/80 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reflection Input */}
        <div>
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
            LOG BUFFER
          </label>
          <textarea
            rows="4"
            placeholder="Document your breakthroughs, learnings, or daily summary..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed resize-none transition"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-mono font-semibold px-5 py-2.5 rounded-xl transition shadow-[0_0_20px_rgba(6,182,212,0.25)] active:scale-95"
          >
            <Plus className="w-4 h-4" /> COMMIT LOG
          </button>
        </div>
      </div>

      {/* Historical Logs Timeline with Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-semibold">
            HISTORICAL CHRONICLE ENTRIES ({filteredEntries.length})
          </h3>

          {/* Quick Search in Logs */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter logs by date or text..."
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-lg pl-8 pr-2.5 py-1 text-xs text-zinc-300 placeholder-zinc-500 font-mono focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
            No chronicle entries match your filter.
          </div>
        ) : (
          filteredEntries.map((item) => (
            <div
              key={item.id}
              className="group bg-[#0c0d14]/70 border border-zinc-800/80 rounded-2xl p-5 space-y-2 hover:border-zinc-700 transition relative"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">{item.date}</span>
                  <span className="uppercase px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[9px]">
                    STATE: {item.mood}
                  </span>
                </div>

                {/* 👉 Delete Button with Confirmation Hover */}
                <button
                  onClick={() => deleteJournalEntry(item.id)}
                  className="p-1.5 hover:bg-rose-950/50 text-zinc-600 hover:text-rose-400 rounded-lg transition"
                  title="Delete Entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-light whitespace-pre-wrap">
                {item.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};