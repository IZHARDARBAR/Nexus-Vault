// src/pages/Notes/index.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Tag,
  Calendar,
  Search,
  Bold,
  Italic,
  Heading1,
  Code,
  CheckSquare,
  Quote,
  Columns,
  Eye,
  Edit3,
  Pin,
  Download,
  Mic,
  MicOff,
  Radio,
  Link2,
  ArrowLeft,
} from 'lucide-react';
import { useVaultStore } from '../../stores/useVaultStore';

export const Notes = () => {
  const { notes, selectedNoteId, setSelectedNoteId, addNote, updateNote, deleteNote, togglePinNote } =
    useVaultStore();

  const [tagInput, setTagInput] = useState('');
  const [filterText, setFilterText] = useState('');
  const [viewMode, setViewMode] = useState('split'); // 'edit' | 'split' | 'preview'

  // 👉 MOBILE TAB STATE: 'list' ya 'editor'
  const [mobileTab, setMobileTab] = useState(selectedNoteId ? 'editor' : 'list');

  // Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Wiki-Links State
  const [showWikiMenu, setShowWikiMenu] = useState(false);
  const [wikiQuery, setWikiQuery] = useState('');
  const textareaRef = useRef(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  // Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (selectedNote) {
          updateNote(selectedNote.id, {
            content: (selectedNote.content ? selectedNote.content + ' ' : '') + transcript,
          });
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [selectedNote, updateNote]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleContentChange = (e) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;
    updateNote(selectedNote.id, { content: val });

    const textBeforeCursor = val.slice(0, cursor);
    const match = textBeforeCursor.match(/\[\[([^\]]*)$/);

    if (match) {
      setShowWikiMenu(true);
      setWikiQuery(match[1].toLowerCase());
    } else {
      setShowWikiMenu(false);
    }
  };

  const insertWikiLink = (targetTitle) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursor = textarea.selectionStart;
    const val = selectedNote.content;
    const textBeforeCursor = val.slice(0, cursor);
    const textAfterCursor = val.slice(cursor);

    const lastBracketIndex = textBeforeCursor.lastIndexOf('[[');
    if (lastBracketIndex !== -1) {
      const newContent =
        textBeforeCursor.slice(0, lastBracketIndex) + `[[${targetTitle}]] ` + textAfterCursor;
      updateNote(selectedNote.id, { content: newContent });
    }

    setShowWikiMenu(false);
    setTimeout(() => textarea.focus(), 10);
  };

  const handleJumpToWikiNote = (title) => {
    const target = notes.find((n) => n.title.toLowerCase() === title.toLowerCase());
    if (target) {
      setSelectedNoteId(target.id);
      setMobileTab('editor');
    } else {
      addNote(title);
      setMobileTab('editor');
    }
  };

  // Filter & Sort
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(filterText.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(filterText.toLowerCase()))
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const handleExportMarkdown = () => {
    if (!selectedNote) return;

    const fileData = `---
title: "${selectedNote.title}"
tags: [${selectedNote.tags.join(', ')}]
date: "${selectedNote.updatedAt}"
---

# ${selectedNote.title}

${selectedNote.content}
`;
    const blob = new Blob([fileData], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanFileName = (selectedNote.title || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${cleanFileName}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const insertMarkdown = (prefix, suffix = '') => {
    if (!selectedNote || !textareaRef.current) return;
    const textarea = textareaRef.current;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = selectedNote.content;
    const selected = text.substring(start, end);

    const replacement = prefix + selected + suffix;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    updateNote(selectedNote.id, { content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!selectedNote.tags.includes(tagInput.trim())) {
        updateNote(selectedNote.id, {
          tags: [...selectedNote.tags, tagInput.trim().toLowerCase()],
        });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    updateNote(selectedNote.id, {
      tags: selectedNote.tags.filter((t) => t !== tagToRemove),
    });
  };

  const renderSimpleMarkdown = (text) => {
    if (!text) return <p className="text-zinc-600 italic font-mono text-xs">No content to preview.</p>;

    return text.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-xl font-bold text-white border-b border-zinc-800 pb-1 mt-4 mb-2">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-semibold text-cyan-300 mt-3 mb-1.5">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
        const isChecked = line.startsWith('- [x] ');
        return (
          <div key={idx} className="flex items-center gap-2 my-1 text-sm text-zinc-300">
            <input type="checkbox" checked={isChecked} readOnly className="accent-cyan-500 rounded" />
            <span className={isChecked ? 'line-through text-zinc-500' : ''}>{line.slice(6)}</span>
          </div>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-2 border-cyan-500 pl-3 my-2 text-zinc-400 italic text-sm">
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      if (line.startsWith('```') || line.endsWith('```')) {
        return (
          <pre key={idx} className="bg-zinc-900 border border-zinc-800 rounded p-2 text-xs font-mono text-cyan-400 my-1 overflow-x-auto">
            {line.replaceAll('```', '')}
          </pre>
        );
      }

      const parts = line.split(/(\[\[.*?\]\])/g);

      return (
        <p key={idx} className="text-sm text-zinc-300 leading-relaxed min-h-[1.25rem] my-0.5">
          {parts.map((part, pIdx) => {
            if (part.startsWith('[[') && part.endsWith(']]')) {
              const linkTitle = part.slice(2, -2);
              return (
                <button
                  key={pIdx}
                  onClick={() => handleJumpToWikiNote(linkTitle)}
                  className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium hover:bg-cyan-900/60 hover:text-white transition shadow-sm"
                  title={`Jump to note: ${linkTitle}`}
                >
                  <Link2 className="w-3 h-3 text-cyan-400" />
                  <span>{linkTitle}</span>
                </button>
              );
            }

            const formatted = part
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
              .replace(/\*(.*?)\*/g, '<em class="text-zinc-300 italic">$1</em>');

            return <span key={pIdx} dangerouslySetInnerHTML={{ __html: formatted }} />;
          })}
        </p>
      );
    });
  };

  const wikiSuggestions = notes.filter(
    (n) => n.id !== selectedNote?.id && n.title.toLowerCase().includes(wikiQuery)
  );

  return (
    <div className="h-[calc(100vh-7rem)] flex border border-zinc-800/80 rounded-2xl overflow-hidden bg-zinc-950/80 backdrop-blur-xl shadow-2xl relative">
      
      {/* ---------------------------------------------------- */}
      {/* 1. LEFT COLUMN: NOTES LIST (RESPONSIVE) */}
      {/* ---------------------------------------------------- */}
      <div
        className={`${
          mobileTab === 'list' ? 'flex' : 'hidden'
        } md:flex w-full md:w-80 border-r border-zinc-800/80 flex-col bg-zinc-950/50 shrink-0 h-full`}
      >
        <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-lg pl-8 pr-2 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 font-mono"
            />
          </div>
          <button
            onClick={() => {
              addNote('New Thought');
              setMobileTab('editor'); // Auto-switch to editor on mobile
            }}
            className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0"
            title="Create Note"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
          {sortedNotes.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 font-mono">No neural nodes found.</div>
          ) : (
            sortedNotes.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    setMobileTab('editor'); // Switch to editor on mobile tap
                  }}
                  className={`p-3.5 cursor-pointer transition flex flex-col gap-1 relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/30 to-transparent border-l-2 border-cyan-400'
                      : 'hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-semibold text-zinc-200 truncate flex-1">{note.title || 'Untitled'}</h4>
                    {note.isPinned && (
                      <Pin className="w-3 h-3 text-cyan-400 shrink-0 fill-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 truncate font-light">
                    {note.content ? note.content.replace(/[#*`]/g, '') : 'Empty thought...'}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-600 font-mono">{note.updatedAt}</span>
                    <div className="flex gap-1 overflow-hidden">
                      {note.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[9px] font-mono bg-zinc-900 text-zinc-400 px-1.5 py-0.2 rounded border border-zinc-800">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. RIGHT COLUMN: PRO EDITOR WORKSPACE (RESPONSIVE) */}
      {/* ---------------------------------------------------- */}
      <div
        className={`${
          mobileTab === 'editor' ? 'flex' : 'hidden'
        } md:flex flex-1 flex-col bg-zinc-950/30 min-w-0 h-full`}
      >
        {selectedNote ? (
          <>
            {/* Top Workspace Bar (Scrollable on Mobile) */}
            <div className="h-12 border-b border-zinc-800/80 px-2 sm:px-4 flex items-center justify-between bg-zinc-950/60 shrink-0 gap-2">
              
              <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink">
                {/* 👉 MOBILE BACK BUTTON */}
                <button
                  onClick={() => setMobileTab('list')}
                  className="md:hidden flex items-center gap-1 px-2 py-1 bg-zinc-900 text-cyan-400 border border-zinc-800 rounded-lg text-xs font-mono shrink-0 mr-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Notes
                </button>

                {/* Markdown Tools */}
                <button onClick={() => insertMarkdown('**', '**')} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white shrink-0" title="Bold">
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => insertMarkdown('*', '*')} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white shrink-0" title="Italic">
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => insertMarkdown('# ')} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white shrink-0" title="Heading">
                  <Heading1 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => insertMarkdown('```\n', '\n```')} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white shrink-0" title="Code Block">
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => insertMarkdown('- [ ] ')} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white shrink-0" title="Task Checklist">
                  <CheckSquare className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => insertMarkdown('> ')} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white shrink-0" title="Quote">
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => insertMarkdown('[[', ']]')} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-cyan-400 flex items-center gap-1 text-xs font-mono shrink-0" title="Insert Wiki Link">
                  <Link2 className="w-3.5 h-3.5" /> [[]]
                </button>
              </div>

              {/* Action Cluster */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Voice Dictation Button */}
                <button
                  onClick={toggleSpeechRecognition}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-mono transition duration-300 shrink-0 ${
                    isListening
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-cyan-400'
                  }`}
                  title={isListening ? 'Click to stop voice recording' : 'Dictate with Voice'}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-[10px] hidden sm:inline">REC</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span className="text-[10px] hidden sm:inline">VOICE</span>
                    </>
                  )}
                </button>

                {/* Pin Button */}
                <button
                  onClick={() => togglePinNote(selectedNote.id)}
                  className={`p-1.5 rounded-lg border transition shrink-0 ${
                    selectedNote.isPinned
                      ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-400'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-200'
                  }`}
                  title={selectedNote.isPinned ? 'Unpin note' : 'Pin note'}
                >
                  <Pin className={`w-3.5 h-3.5 ${selectedNote.isPinned ? 'fill-cyan-400' : ''}`} />
                </button>

                {/* Export .md */}
                <button
                  onClick={handleExportMarkdown}
                  className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-cyan-400 transition shrink-0"
                  title="Export .md"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                {/* View Switchers */}
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs shrink-0">
                  <button
                    onClick={() => setViewMode('edit')}
                    className={`p-1.5 rounded-md flex items-center ${viewMode === 'edit' ? 'bg-zinc-800 text-cyan-400' : 'text-zinc-500'}`}
                    title="Write only"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`hidden sm:flex p-1.5 rounded-md items-center ${viewMode === 'split' ? 'bg-zinc-800 text-cyan-400' : 'text-zinc-500'}`}
                    title="Split View"
                  >
                    <Columns className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`p-1.5 rounded-md flex items-center ${viewMode === 'preview' ? 'bg-zinc-800 text-cyan-400' : 'text-zinc-500'}`}
                    title="Preview only"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    deleteNote(selectedNote.id);
                    setMobileTab('list'); // Return to list after delete
                  }}
                  className="p-1.5 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 rounded-lg transition shrink-0"
                  title="Delete Note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Note Meta Header */}
            <div className="p-4 sm:p-6 pb-2 space-y-2 sm:space-y-3">
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                placeholder="Node Title..."
                className="w-full text-xl sm:text-2xl font-black bg-transparent text-white focus:outline-none tracking-tight font-sans"
              />
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="w-3 h-3 text-cyan-400 mr-1" />
                {selectedNote.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 px-2 py-0.5 rounded flex items-center gap-1 group"
                  >
                    #{t}
                    <button onClick={() => handleRemoveTag(t)} className="hover:text-rose-400 opacity-60 group-hover:opacity-100">
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ tag (enter)"
                  className="bg-transparent text-xs text-zinc-400 placeholder-zinc-600 focus:outline-none w-24 ml-1 font-mono"
                />
              </div>
            </div>

            {/* Write / Preview Panels */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 px-4 sm:px-6 pb-4 gap-4 sm:gap-6">
              {(viewMode === 'edit' || viewMode === 'split') && (
                <div className="flex-1 flex flex-col relative h-full">
                  <textarea
                    ref={textareaRef}
                    id="note-editor-area"
                    value={selectedNote.content}
                    onChange={handleContentChange}
                    placeholder="Type [[ to link another note, or write markdown..."
                    className="w-full flex-1 bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/40 font-mono leading-relaxed resize-none"
                  />

                  {/* Floating Wiki-Links Dropdown */}
                  {showWikiMenu && (
                    <div className="absolute top-12 left-4 z-30 w-64 sm:w-72 bg-[#0c0d14]/95 border border-cyan-500/50 rounded-xl shadow-2xl p-2 backdrop-blur-md animate-in fade-in">
                      <div className="text-[10px] font-mono text-cyan-400 uppercase px-2 py-1 border-b border-zinc-800 mb-1 flex items-center gap-1.5">
                        <Link2 className="w-3 h-3" /> LINK SYNAPSE NODE
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {wikiSuggestions.length === 0 ? (
                          <div className="text-[11px] font-mono text-zinc-500 p-2">No matching nodes.</div>
                        ) : (
                          wikiSuggestions.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => insertWikiLink(n.title)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-cyan-950/50 cursor-pointer text-xs font-mono text-zinc-300 hover:text-cyan-300 transition flex items-center justify-between"
                            >
                              <span className="truncate">{n.title}</span>
                              <span className="text-[9px] text-zinc-600">Select</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {isListening && (
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-rose-950/90 border border-rose-500 text-rose-300 text-[10px] font-mono px-3 py-1.5 rounded-full shadow-lg animate-bounce">
                      <Radio className="w-3 h-3 text-rose-400 animate-spin" /> RECORDING VOICE...
                    </div>
                  )}
                </div>
              )}

              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className="flex-1 flex flex-col bg-zinc-950/20 border border-zinc-800/50 rounded-xl p-3 sm:p-4 overflow-y-auto h-full">
                  <div className="text-[10px] uppercase font-mono text-cyan-400/80 mb-2 pb-1 border-b border-zinc-900 font-semibold tracking-wider">
                    LIVE RENDERED OUTPUT
                  </div>
                  <div className="space-y-2">{renderSimpleMarkdown(selectedNote.content)}</div>
                </div>
              )}
            </div>

            {/* Status Bar */}
            <div className="h-7 border-t border-zinc-800/60 bg-zinc-950 px-4 sm:px-6 flex items-center justify-between text-[10px] font-mono text-zinc-500 shrink-0">
              <span className="flex items-center gap-1.5 truncate">
                <Calendar className="w-3 h-3 text-cyan-400 shrink-0" /> {selectedNote.updatedAt}
              </span>
              <span>
                {selectedNote.content.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
            <p className="text-sm font-mono">No node active.</p>
            <button
              onClick={() => setMobileTab('list')}
              className="md:hidden text-xs bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-cyan-400"
            >
              View Notes List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};