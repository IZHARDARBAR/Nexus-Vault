// src/components/shared/InstallPrompt.jsx
import React, { useState, useEffect } from 'react';
import { Download, X, Cpu, Share, PlusSquare } from 'lucide-react';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
      return;
    }

    // Check if device is iPhone / iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIos(isIosDevice);

    // Capture Android / Chrome install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      // iPhone instructions popup
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowIosGuide(true);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Bottom Banner */}
      <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom duration-300">
        <div className="bg-[#0c0d14]/95 border border-cyan-500/50 rounded-2xl p-3.5 sm:p-4 shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/30">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                GET NEXUS VAULT APP
              </h4>
              <p className="text-[10px] text-zinc-400 font-mono truncate">
                Install as standalone mobile app
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
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

      {/* iPhone (iOS) Install Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0c0d14] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" /> INSTALL ON IPHONE
              </h3>
              <button onClick={() => setShowIosGuide(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs text-zinc-300">
              <div className="flex items-center gap-3 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <div className="p-2 bg-cyan-950 rounded-lg text-cyan-400">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">Step 1</p>
                  <p className="text-[11px] text-zinc-400">Safari ke neeche Share button (⎋) dabayein.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <div className="p-2 bg-indigo-950 rounded-lg text-indigo-400">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">Step 2</p>
                  <p className="text-[11px] text-zinc-400">Neeche scroll karke "Add to Home Screen" select karein.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-mono text-xs font-bold rounded-xl"
            >
              GOT IT!
            </button>
          </div>
        </div>
      )}
    </>
  );
};