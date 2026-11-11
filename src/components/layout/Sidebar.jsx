// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Share2,
  BookOpen,
  FolderOpen,
  Calendar,
  Settings,
  Cpu,
  PanelLeftClose,
  ShieldAlert,
  LogOut,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useVaultStore } from '../../stores/useVaultStore';
import { isUserAdmin } from '../../firebase/firestore';
import { logoutUser } from '../../firebase/auth';

const navigation = [
  { name: 'Core Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Neural Notes', href: '/notes', icon: FileText },
  { name: 'Knowledge Graph', href: '/graph', icon: Share2 },
  { name: 'Chronicle Log', href: '/journal', icon: Calendar },
  { name: 'Resource Vault', href: '/resources', icon: BookOpen },
  { name: 'Collections', href: '/collections', icon: FolderOpen },
  { name: 'System Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar, closeSidebar, user } = useVaultStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const hasAdminAccess = isUserAdmin(user?.email);

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    if (window.innerWidth < 1024) closeSidebar();
    await logoutUser();
  };

  return (
    <>
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#0a0a0e]/95 lg:bg-[#0a0a0e]/80 border-r border-zinc-800/80 backdrop-blur-2xl flex flex-col h-screen select-none transition-all duration-300 ease-in-out ${
          isSidebarOpen
            ? 'w-64 translate-x-0'
            : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:border-none pointer-events-none lg:pointer-events-none'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800/60 bg-gradient-to-r from-zinc-950 via-zinc-900/50 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-[0.2em] text-white uppercase flex items-center gap-1.5">
                NEXUS <span className="text-cyan-400 font-mono text-[9px]">OS</span>
              </h1>
              <p className="text-[8px] text-zinc-500 tracking-widest font-mono">NEURAL VAULT</p>
            </div>
          </div>

          <button
            onClick={toggleSidebar}
            className="pointer-events-auto p-1.5 hover:bg-zinc-800/60 rounded-lg text-zinc-400 hover:text-white transition"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto pointer-events-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) closeSidebar();
                }}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-transparent text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-zinc-500'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Super Admin Tab */}
          {hasAdminAccess && (
            <div className="pt-2">
              <NavLink
                to="/admin"
                onClick={() => {
                  if (window.innerWidth < 1024) closeSidebar();
                }}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all duration-200 ${
                    isActive
                      ? 'bg-rose-950/30 border border-rose-500/40 text-rose-300 shadow font-bold'
                      : 'text-zinc-500 hover:text-rose-300 hover:bg-rose-950/20'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Admin Console</span>
                </div>
                <span className="text-[9px] bg-rose-950/80 text-rose-400 border border-rose-500/30 px-1 rounded">
                  ROOT
                </span>
              </NavLink>
            </div>
          )}

          {/* 👉 BIG UNMISSABLE LOGOUT BUTTON INSIDE MENU (PERFECT FOR MOBILE) */}
          {user && (
            <div className="pt-4 mt-2 border-t border-zinc-900">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30 border border-zinc-900 hover:border-rose-500/30 transition"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Disconnect Vault</span>
                </div>
                <span className="text-[10px] bg-rose-950/60 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30">
                  EXIT
                </span>
              </button>
            </div>
          )}
        </nav>

        {/* Footer Identity */}
        <div className="p-4 border-t border-zinc-800/60 bg-zinc-950/60 pointer-events-auto shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-7 h-7 rounded-full shrink-0 border border-cyan-500/40" />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500 text-cyan-300 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.email?.slice(0, 2).toUpperCase() || 'NV'}
              </div>
            )}
            <div className="truncate">
              <p className="text-[10px] font-mono font-semibold text-zinc-200 truncate">
                {user ? user.displayName || user.email : 'GUEST OPERATOR'}
              </p>
              <p className="text-[8px] text-zinc-500 font-mono">
                {hasAdminAccess ? 'SUPER ADMIN' : 'CONNECTED'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0c0d14] border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
                TERMINATE SESSION?
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Are you sure you want to log out of Nexus Vault? Your local encryption buffer will be locked.
              </p>
            </div>

            <div className="flex gap-2 pt-2 font-mono text-xs">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition shadow-[0_0_15px_rgba(244,63,94,0.4)]"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};