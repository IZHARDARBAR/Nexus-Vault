// src/components/shared/CountrySelect.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { COUNTRIES } from '../../utils/countries';

export const CountrySelect = ({ selectedCountry, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  );

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Trigger Button with Flag */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-2 bg-zinc-900 hover:bg-zinc-800 border-r border-zinc-800 text-xs font-mono text-zinc-200 transition"
      >
        <img
          src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`}
          alt={selectedCountry.name}
          className="w-4 h-3 object-cover rounded-sm shadow-sm"
        />
        <span>{selectedCountry.code}</span>
        <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Cyberpunk Dropdown without white scrollbar */}
      {isOpen && (
        <div className="absolute top-12 left-0 z-50 w-72 bg-[#0c0d14] border border-cyan-500/40 rounded-2xl shadow-2xl p-2.5 backdrop-blur-xl animate-in fade-in space-y-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search country or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-cyan-500"
              autoFocus
            />
          </div>

          {/* 👉 COUNTRIES LIST (SCROLLBAR COMPLETELY HIDDEN) */}
          <div
            className="max-h-56 overflow-y-auto space-y-0.5 divide-y divide-zinc-900/60 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredCountries.length === 0 ? (
              <div className="text-[11px] font-mono text-zinc-500 p-3 text-center">No matching country.</div>
            ) : (
              filteredCountries.map((c) => (
                <div
                  key={c.name}
                  onClick={() => {
                    onSelect(c);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs font-mono transition ${
                    selectedCountry.name === c.name
                      ? 'bg-cyan-950/60 text-cyan-300 font-bold'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={`https://flagcdn.com/w40/${c.iso}.png`}
                      alt={c.name}
                      className="w-4 h-3 object-cover rounded-sm shadow-sm shrink-0"
                    />
                    <span className="truncate">{c.name}</span>
                  </div>
                  <span className="text-zinc-500 text-[10px] ml-2 shrink-0">{c.code}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};