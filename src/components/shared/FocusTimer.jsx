// src/components/shared/FocusTimer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Flame, Coffee, Sparkles, Sliders } from 'lucide-react';

export const FocusTimer = () => {
  const [mode, setMode] = useState('focus'); // 'focus' | 'short' | 'long' | 'custom'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [customMinutes, setCustomMinutes] = useState('45');
  const [isRunning, setIsRunning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const timerRef = useRef(null);

  const modes = {
    focus: { label: 'DEEP WORK', duration: 25 * 60 },
    short: { label: 'SHORT BREAK', duration: 5 * 60 },
    long: { label: 'RECHARGE', duration: 15 * 60 },
  };

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {}
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playAlertSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setShowCustomInput(false);
    setIsRunning(false);
    setTimeLeft(modes[newMode].duration);
  };

  // 👉 Custom Time Setter
  const applyCustomMinutes = (e) => {
    e.preventDefault();
    const mins = parseInt(customMinutes, 10);
    if (!isNaN(mins) && mins > 0) {
      setMode('custom');
      setIsRunning(false);
      setTimeLeft(mins * 60);
      setShowCustomInput(false);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'custom') {
      const mins = parseInt(customMinutes, 10) || 25;
      setTimeLeft(mins * 60);
    } else {
      setTimeLeft(modes[mode].duration);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs transition duration-200 shadow-sm ${
          isRunning
            ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
            : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
        }`}
      >
        <Timer className={`w-3.5 h-3.5 ${isRunning ? 'text-cyan-400 animate-spin' : 'text-zinc-400'}`} />
        <span className="font-bold tracking-wider">{formatTime(timeLeft)}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 z-50 w-72 bg-[#0c0d14]/95 border border-cyan-500/40 rounded-2xl p-5 shadow-[0_0_40px_rgba(6,182,212,0.2)] backdrop-blur-xl animate-in fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5" /> FOCUS PROTOCOL
            </span>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white text-xs font-mono">
              ×
            </button>
          </div>

          {/* Mode Switchers */}
          <div className="grid grid-cols-3 gap-1 bg-zinc-950 border border-zinc-800/80 p-1 rounded-xl text-[10px] font-mono">
            {['focus', 'short', 'long'].map((mKey) => (
              <button
                key={mKey}
                onClick={() => switchMode(mKey)}
                className={`py-1 rounded-lg transition capitalize ${
                  mode === mKey && !showCustomInput
                    ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40 shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {mKey}
              </button>
            ))}
          </div>

          {/* Custom Time Toggle */}
          <div className="text-center">
            {showCustomInput ? (
              <form onSubmit={applyCustomMinutes} className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder="Minutes"
                  className="w-full bg-zinc-950 border border-cyan-500/50 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-cyan-600 text-white text-[10px] font-mono px-3 py-1 rounded-lg hover:bg-cyan-500 transition"
                >
                  SET
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowCustomInput(true)}
                className="text-[10px] font-mono text-zinc-500 hover:text-cyan-400 flex items-center justify-center gap-1 mx-auto transition"
              >
                <Sliders className="w-3 h-3" /> Set Custom Minutes
              </button>
            )}
          </div>

          {/* Big Time Display */}
          <div className="text-center py-1">
            <div className="text-4xl font-black font-mono tracking-tight text-white">
              {formatTime(timeLeft)}
            </div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase mt-1">
              {mode === 'custom' ? `CUSTOM: ${customMinutes}M` : modes[mode]?.label}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setIsRunning((prev) => !prev)}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 text-white text-xs font-mono font-semibold py-2 rounded-xl transition shadow"
            >
              {isRunning ? <><Pause className="w-3.5 h-3.5" /> PAUSE</> : <><Play className="w-3.5 h-3.5" /> START FOCUS</>}
            </button>
            <button
              onClick={resetTimer}
              className="p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl transition"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};