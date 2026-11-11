// src/components/layout/AppLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '../shared/CommandPalette';
import { InstallPrompt } from '../shared/InstallPrompt';
import { Login } from '../../pages/Auth/Login';
import { useVaultStore } from '../../stores/useVaultStore';
import { subscribeToAuth } from '../../firebase/auth';

export const AppLayout = () => {
  const { isSidebarOpen, closeSidebar, accentTheme, user, setUser } = useVaultStore();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [setUser]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyK' || e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        e.stopPropagation();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  const themeGlows = {
    cyan: { primary: 'bg-cyan-600/10', secondary: 'bg-indigo-600/10' },
    matrix: { primary: 'bg-emerald-600/10', secondary: 'bg-green-700/10' },
    amber: { primary: 'bg-amber-600/10', secondary: 'bg-orange-600/10' },
    synthwave: { primary: 'bg-pink-600/10', secondary: 'bg-purple-600/10' },
  };

  const currentGlow = themeGlows[accentTheme] || themeGlows.cyan;

  if (authLoading) {
    return (
      <div className="h-screen bg-[#070709] flex items-center justify-center text-cyan-400 font-mono text-xs gap-3">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>AUTHENTICATING SECURE PROTOCOL...</span>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-[#070709] text-zinc-100 overflow-hidden font-sans relative selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className={`absolute top-[-10%] left-[20%] w-[500px] h-[500px] ${currentGlow.secondary} rounded-full blur-[140px] pointer-events-none transition-all duration-700`} />
      <div className={`absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] ${currentGlow.primary} rounded-full blur-[160px] pointer-events-none transition-all duration-700`} />

      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Global Utilities */}
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
      
      {/* 👉 PWA INSTALL / GET APP BANNER */}
      <InstallPrompt />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Header onOpenPalette={() => setIsPaletteOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};