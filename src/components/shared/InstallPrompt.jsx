// src/components/shared/InstallPrompt.jsx
import React, { useState, useEffect } from 'react';
import { Download, X, Cpu } from 'lucide-react';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      // Prevent automatic mini-infobar on mobile
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="bg-[#0c0d14]/95 border border-cyan-500/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/30">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
              GET NEXUS VAULT APP
            </h4>
            <p className="text-[10px] text-zinc-400 font-mono truncate">
              Install standalone native app on device
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 text-white rounded-xl text-xs font-mono font-semibold transition shadow-md active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>INSTALL</span>
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};