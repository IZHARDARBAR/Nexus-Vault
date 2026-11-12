// src/components/shared/InstallPrompt.jsx
import React, { useState, useEffect } from 'react';
import { Download, X, Cpu } from 'lucide-react';

export const InstallPrompt = () => {
  const [promptReady, setPromptReady] = useState(Boolean(window.deferredPrompt));
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
      return;
    }

    // Check if globally captured already
    if (window.deferredPrompt) {
      setPromptReady(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setPromptReady(true);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // 👉 DIRECT ANDROID 1-CLICK INSTALL (ZERO ALERTS)
  const handleInstallClick = async () => {
    const promptEvent = window.deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      window.deferredPrompt = null;
      setPromptReady(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-[9999] animate-in fade-in slide-in-from-bottom duration-300">
      <div className="bg-[#0c0d14] border-2 border-cyan-400 rounded-2xl p-3.5 sm:p-4 shadow-[0_0_40px_rgba(6,182,212,0.5)] backdrop-blur-2xl flex items-center justify-between gap-3">
        
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/40">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <h4 className="text-xs font-black text-white font-mono uppercase tracking-wide truncate">
            GET NEXUS VAULT APP
          </h4>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 text-white rounded-xl text-xs font-mono font-bold transition shadow-lg active:scale-95"
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