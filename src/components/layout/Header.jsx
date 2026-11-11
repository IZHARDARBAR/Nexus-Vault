// src/components/layout/Header.jsx
import React from 'react';
import { Plus, Terminal, PanelLeft, Search } from 'lucide-react';
import { useVaultStore } from '../../stores/useVaultStore';
import { FocusTimer } from '../shared/FocusTimer';
import { useNavigate } from 'react-router-dom';

export const Header = ({ onOpenPalette }) => {
  const { addNote, toggleSidebar, user } = useVaultStore();
  const navigate = useNavigate();

  const handleCreate = () => {
    addNote('New Thought');
    navigate('/notes');
  };

  return (
    <header className="h-16 bg-[#0a0a0e]/80 backdrop-blur-xl border-b border-zinc-800/60 px-3 sm:px-6 flex items-center justify-between z-30 select-none">
      
      {/* ---------------------------------------------------- */}
      {/* LEFT SECTION: SIDEBAR TOGGLE & SEARCH */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle Sidebar Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-cyan-400 border border-zinc-800 rounded-xl transition duration-200 shrink-0 shadow-sm"
          title="Toggle Sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* 👉 MOBILE ONLY: Compact Search Icon Button */}
        <button
          onClick={onOpenPalette}
          className="sm:hidden p-2 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 border border-zinc-800 rounded-xl transition shrink-0"
          title="Search Vault"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* 👉 DESKTOP ONLY: Full Search Input Bar */}
        <div
          onClick={onOpenPalette}
          className="hidden sm:flex relative w-56 md:w-80 cursor-pointer group"
        >
          <div className="relative flex items-center bg-zinc-950/80 border border-zinc-800/90 group-hover:border-cyan-500/50 rounded-xl px-3 py-1.5 transition-all shadow-sm w-full">
            <Terminal className="w-3.5 h-3.5 text-cyan-400 mr-2.5 shrink-0" />
            <span className="w-full text-xs text-zinc-500 font-mono select-none truncate">
              Search vault or jump to...
            </span>
            <kbd className="hidden md:inline-block text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono shadow">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* RIGHT SECTION: TIMER + CREATE + AVATAR (NO OVERFLOW) */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Pomodoro Focus Timer */}
        <FocusTimer />

        {/* Create Note Button */}
        <button
          onClick={handleCreate}
          className="relative group overflow-hidden rounded-xl p-px font-semibold text-xs transition duration-300 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.25)] shrink-0"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 transition-all duration-300 group-hover:opacity-90" />
          
          {/* Desktop Version */}
          <span className="hidden sm:flex relative items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 text-cyan-200 transition-colors group-hover:bg-transparent group-hover:text-white">
            <Plus className="w-3.5 h-3.5 text-cyan-400 group-hover:text-white" />
            <span className="font-mono tracking-wider">CAPTURE NODE</span>
          </span>

          {/* 👉 Mobile Only Compact Icon Button */}
          <span className="sm:hidden relative flex items-center justify-center p-2 rounded-xl bg-zinc-950 text-cyan-300 group-hover:bg-transparent group-hover:text-white">
            <Plus className="w-4 h-4 text-cyan-400 group-hover:text-white" />
          </span>
        </button>

        {/* User Profile Avatar (100% Inside Screen, No Cut) */}
        {user && (
          <div className="flex items-center pl-1 sm:pl-2 border-l border-zinc-800/80 shrink-0">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-cyan-400/50 shadow-[0_0_10px_#22d3ee] shrink-0 object-cover"
                title={user.displayName || user.email}
              />
            ) : (
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold shrink-0"
                title={user.email}
              >
                {user.email?.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};