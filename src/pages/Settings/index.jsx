// src/pages/Settings/index.jsx
import React, { useState } from 'react';
import { User, HardDrive, Download, Upload, Trash2, CheckCircle2, ShieldAlert, Palette } from 'lucide-react';
import { useVaultStore } from '../../stores/useVaultStore';

export const Settings = () => {
  const store = useVaultStore();
  const { userProfile, updateProfile, restoreBackup, clearAllData, accentTheme, setAccentTheme, user } = store;

  const currentName = user?.displayName || userProfile?.name || 'Architect';
  const currentEmail = user?.email || userProfile?.email || 'architect@nexusvault.local';

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [notification, setNotification] = useState('');

  const rawData = localStorage.getItem('nexus-vault-storage') || '';
  const storageKb = (new Blob([rawData]).size / 1024).toFixed(2);

  const handleSaveProfile = () => {
    updateProfile(name, email);
    setIsEditing(false);
    showNotice('Profile updated successfully!');
  };

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      userProfile: { name: currentName, email: currentEmail },
      notes: store.notes,
      resources: store.resources,
      journalEntries: store.journalEntries,
      collections: store.collections,
      accentTheme: store.accentTheme,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus_vault_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice('Full Vault backup exported!');
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        restoreBackup(imported);
        showNotice('Vault restored successfully!');
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleWipeData = () => {
    if (window.confirm('WARNING: Are you sure you want to wipe all data?')) {
      clearAllData();
      showNotice('All data wiped.');
    }
  };

  const themes = [
    { id: 'cyan', label: 'Cyan Void', color: 'bg-cyan-500' },
    { id: 'matrix', label: 'Matrix Green', color: 'bg-emerald-500' },
    { id: 'amber', label: 'Cyber Amber', color: 'bg-amber-500' },
    { id: 'synthwave', label: 'Neon Pink', color: 'bg-pink-500' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {notification && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-cyan-950 border border-cyan-500 text-cyan-300 text-xs font-mono px-4 py-2 rounded-xl shadow-2xl">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{notification}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">SYSTEM CONFIGURATION</h2>
        <p className="text-sm text-zinc-400">Telemetry, backup controls, themes, and identity management.</p>
      </div>

      <div className="bg-[#0c0d14]/90 border border-zinc-800/80 rounded-2xl divide-y divide-zinc-900 shadow-2xl">
        {/* Profile Section */}
        <div className="p-6">
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-14 h-14 rounded-2xl border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                {currentName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono w-60"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-400 font-mono w-60 block"
                  />
                </div>
              ) : (
                <>
                  <h4 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    {currentName}
                    {user && (
                      <span className="text-[9px] bg-cyan-950 border border-cyan-500/40 text-cyan-400 px-1.5 py-0.5 rounded font-mono">
                        VERIFIED CLOUD
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-zinc-500 font-mono">{currentEmail}</p>
                </>
              )}
            </div>
            {isEditing ? (
              <button
                onClick={handleSaveProfile}
                className="text-xs font-mono bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl transition"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl transition"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Theme Matrix */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-2 text-zinc-300 font-semibold">
              <Palette className="w-4 h-4 text-cyan-400" /> ACCENT THEME MATRIX
            </span>
            <span className="text-zinc-500 uppercase">{accentTheme} MODE ACTIVE</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setAccentTheme(t.id);
                  showNotice(`Theme set to ${t.label}`);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-mono transition ${
                  accentTheme === t.id
                    ? 'bg-zinc-900 border-white text-white font-bold shadow-lg'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${t.color}`} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Storage Telemetry */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-2 text-zinc-300 font-semibold">
              <HardDrive className="w-4 h-4 text-cyan-400" /> STORAGE TELEMETRY
            </span>
            <span className="text-cyan-400">{storageKb} KB CACHED</span>
          </div>
          <div className="w-full bg-zinc-950 border border-zinc-800 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full w-[25%]" />
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="p-6 space-y-4">
          <h4 className="text-xs uppercase font-mono tracking-wider text-zinc-500 font-semibold">
            VAULT BACKUP & MIGRATION
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-mono py-3 rounded-xl transition shadow"
            >
              <Download className="w-4 h-4 text-cyan-400" /> EXPORT FULL VAULT (JSON)
            </button>

            <label className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-mono py-3 rounded-xl transition shadow cursor-pointer">
              <Upload className="w-4 h-4 text-indigo-400" /> RESTORE FROM BACKUP
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>

        {/* Wipe Data */}
        <div className="p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold">
              <ShieldAlert className="w-4 h-4" /> RESET LOCAL VAULT
            </div>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Permanently purges all current data from browser memory.
            </p>
          </div>
          <button
            onClick={handleWipeData}
            className="flex items-center gap-1.5 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 text-xs font-mono px-3.5 py-2 rounded-xl transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Purge All
          </button>
        </div>
      </div>
    </div>
  );
};