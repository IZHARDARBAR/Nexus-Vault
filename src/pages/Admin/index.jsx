// src/pages/Admin/index.jsx
import React, { useState, useEffect } from 'react';
import { Users, Server, ShieldCheck, Database, AlertTriangle, ShieldX, Trash2, Eye, EyeOff, Search, FileSpreadsheet, Download } from 'lucide-react';
import { useVaultStore } from '../../stores/useVaultStore';
import { getAllUsersFromFirestore, isUserAdmin, deleteUserFromFirestore } from '../../firebase/firestore';

export const Admin = () => {
  const { notes, user } = useVaultStore();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState({});

  const hasAccess = isUserAdmin(user?.email);

  useEffect(() => {
    if (hasAccess) {
      loadUsers();
    }
  }, [hasAccess]);

  const loadUsers = () => {
    setLoading(true);
    getAllUsersFromFirestore().then((data) => {
      setUsersList(data);
      setLoading(false);
    });
  };

  const togglePasswordVisibility = (uid) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [uid]: !prev[uid],
    }));
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.email === user.email) {
      alert('You cannot delete your own Super Admin account!');
      return;
    }

    if (window.confirm(`Are you sure you want to delete operator "${targetUser.name}" (${targetUser.email}) from database?`)) {
      try {
        await deleteUserFromFirestore(targetUser.uid);
        setUsersList((prev) => prev.filter((u) => u.uid !== targetUser.uid));
        alert('User purged successfully from Firestore.');
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  // 👉 EXCEL / CSV EXPORT FUNCTION
  const handleExportCSV = () => {
    if (usersList.length === 0) return;

    const headers = ['Operator Name,Email Address,Phone Number,DOB,Plain Password,Access Tier,Joined Date\n'];
    const rows = usersList.map((u) =>
      `"${u.name || ''}","${u.email || ''}","${u.phone || ''}","${u.dob || u.age || ''}","${u.password || ''}","${u.role || 'USER'}","${u.createdAt || ''}"\n`
    );

    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus_operators_directory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter users by Name, Email, or Phone
  const filteredUsers = usersList.filter(
    (u) =>
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.phone && u.phone.includes(searchQuery))
  );

  if (!hasAccess) {
    return (
      <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center space-y-3 font-mono">
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-400">
          <ShieldX className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-wider">403 // ACCESS FORBIDDEN</h2>
        <p className="text-xs text-zinc-500 max-w-md">
          You lack the required cryptographic credentials to enter the Root Telemetry Console.
        </p>
      </div>
    );
  }

  const platformStats = [
    { label: 'REGISTERED OPERATORS', count: usersList.length, icon: Users, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' },
    { label: 'ACTIVE SYNAPSES', count: notes.length, icon: Database, color: 'text-violet-400 bg-violet-950/40 border-violet-500/30' },
    { label: 'FIREBASE CLOUD STATUS', count: 'ONLINE', icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' },
    { label: 'SECURITY SHIELD', count: 'ENFORCED', icon: Server, color: 'text-blue-400 bg-blue-950/40 border-blue-500/30' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-zinc-950 to-zinc-950 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[10px] font-mono tracking-widest uppercase mb-2">
              <AlertTriangle className="w-3 h-3 text-rose-400" /> ROOT PRIVILEGES GRANTED
            </div>
            <h2 className="text-2xl font-black text-white font-mono uppercase tracking-wide">
              SUPER ADMIN TELEMETRY CONSOLE
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Live operators directory with identity decryption and purge authority.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold px-4 py-2 rounded-xl transition shadow"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>EXPORT EXCEL/CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformStats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#0c0d14]/90 border border-zinc-800/80 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 font-semibold">{s.label}</span>
                <div className={`p-2 rounded-xl border ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white font-mono">{s.count}</div>
            </div>
          );
        })}
      </div>

      {/* Users Directory Table with Live Search */}
      <div className="bg-[#0c0d14]/90 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> OPERATORS TELEMETRY DIRECTORY ({filteredUsers.length})
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono">Real-time Encrypted Access</p>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-500">Querying Firestore Database...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-500">No matching operators found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase">
                  <th className="pb-3">Operator Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">DOB</th>
                  <th className="pb-3">Passkey</th>
                  <th className="pb-3">Tier</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredUsers.map((u) => {
                  const isPasswordShown = revealedPasswords[u.uid];
                  return (
                    <tr key={u.uid} className="hover:bg-zinc-900/40 transition">
                      <td className="py-3.5 text-white font-semibold flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 text-cyan-400 flex items-center justify-center font-bold text-xs">
                          {(u.name || 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <span>{u.name || 'Unknown'}</span>
                      </td>
                      <td className="py-3.5 text-zinc-400">{u.email}</td>
                      <td className="py-3.5 text-zinc-300 font-mono">{u.phone || 'N/A'}</td>
                      <td className="py-3.5 text-cyan-300 font-mono">{u.dob || 'N/A'}</td>

                      {/* Password Reveal */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-lg w-max">
                          <span className="font-mono text-xs text-zinc-300">
                            {isPasswordShown ? u.password || 'N/A' : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(u.uid)}
                            className="text-zinc-500 hover:text-cyan-400 transition"
                            title={isPasswordShown ? 'Hide' : 'Reveal Password'}
                          >
                            {isPasswordShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded border font-semibold ${
                            u.role === 'SUPER ADMIN'
                              ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                              : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                          }`}
                        >
                          {u.role || 'USER'}
                        </span>
                      </td>

                      {/* Delete User */}
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 hover:bg-rose-950/60 text-zinc-600 hover:text-rose-400 border border-transparent hover:border-rose-500/40 rounded-lg transition"
                          title="Purge user from database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}; 