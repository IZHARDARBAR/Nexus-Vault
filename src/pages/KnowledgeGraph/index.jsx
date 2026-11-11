// src/pages/KnowledgeGraph/index.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RefreshCw, ArrowRight, Share2, Sparkles } from 'lucide-react';
import { useVaultStore } from '../../stores/useVaultStore';
import { useNavigate } from 'react-router-dom';

export const KnowledgeGraph = () => {
  const { notes, setSelectedNoteId } = useVaultStore();
  const navigate = useNavigate();
  const svgRef = useRef(null);

  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [draggingId, setDraggingId] = useState(null);

  // Initialize nodes positions in circular / orbit layout
  useEffect(() => {
    if (!notes.length) return;

    const centerX = 400;
    const centerY = 280;
    const radius = Math.min(220, 80 + notes.length * 20);

    const generatedNodes = notes.map((note, idx) => {
      const angle = (idx / notes.length) * 2 * Math.PI;
      return {
        id: note.id,
        title: note.title || 'Untitled',
        tags: note.tags || [],
        content: note.content || '',
        x: centerX + radius * Math.cos(angle) + (Math.random() * 30 - 15),
        y: centerY + radius * Math.sin(angle) + (Math.random() * 30 - 15),
      };
    });

    setNodes(generatedNodes);
  }, [notes]);

  // Compute links dynamically: Connect notes that share at least 1 tag
  const links = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const commonTags = nodes[i].tags.filter((t) => nodes[j].tags.includes(t));
      if (commonTags.length > 0) {
        links.push({ from: nodes[i].id, to: nodes[j].id });
      }
    }
  }

  // Dragging logic
  const handleMouseDown = (nodeId) => (e) => {
    e.stopPropagation();
    setDraggingId(nodeId);
  };

  const handleMouseMove = (e) => {
    if (!draggingId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingId ? { ...n, x, y } : n))
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleOpenNote = (id) => {
    setSelectedNoteId(id);
    navigate('/notes');
  };

  return (
    <div
      className="h-[calc(100vh-7rem)] flex flex-col bg-zinc-950/90 border border-zinc-800/80 rounded-2xl overflow-hidden relative shadow-2xl select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Controls Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#0a0a0e]/90 backdrop-blur-md border border-zinc-800 p-1.5 rounded-xl shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
          className="p-2 hover:bg-zinc-800 text-zinc-300 hover:text-cyan-400 rounded-lg transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
          className="p-2 hover:bg-zinc-800 text-zinc-300 hover:text-cyan-400 rounded-lg transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-2 hover:bg-zinc-800 text-zinc-300 hover:text-cyan-400 rounded-lg transition text-xs font-mono"
          title="Reset Zoom"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-zinc-800 mx-1" />
        <span className="text-[10px] font-mono text-cyan-400 px-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" /> {nodes.length} Synapses Connected
        </span>
      </div>

      {/* Node Inspector Drawer */}
      {selectedNode && (
        <div className="absolute bottom-5 right-5 z-10 w-72 bg-[#0c0d14]/95 border border-cyan-500/40 p-5 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.25)] backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase text-cyan-400 tracking-wider">NEURAL NODE DETAIL</span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-zinc-500 hover:text-zinc-200 text-xs"
            >
              ×
            </button>
          </div>
          <h4 className="text-sm font-bold text-white line-clamp-1">{selectedNode.title}</h4>
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-light">
            {selectedNode.content || 'Empty buffer...'}
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedNode.tags.map((t) => (
              <span key={t} className="text-[9px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 px-2 py-0.5 rounded">
                #{t}
              </span>
            ))}
          </div>
          <button
            onClick={() => handleOpenNote(selectedNode.id)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-mono font-semibold py-2 rounded-xl transition shadow-lg mt-2"
          >
            OPEN IN EDITOR <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interactive SVG Surface */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-crosshair"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: draggingId ? 'none' : 'transform 0.15s ease' }}
      >
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Dynamic Synaptic Links */}
        {links.map((link, idx) => {
          const fromNode = nodes.find((n) => n.id === link.from);
          const toNode = nodes.find((n) => n.id === link.to);
          if (!fromNode || !toNode) return null;

          return (
            <line
              key={idx}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              strokeDasharray="4 2"
            />
          );
        })}

        {/* Draggable Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseDown={handleMouseDown(node.id)}
              onClick={() => setSelectedNode(node)}
              className="cursor-pointer"
            >
              {/* Outer Halo */}
              <circle
                r={isSelected ? 22 : 16}
                fill="none"
                stroke={isSelected ? '#22d3ee' : '#6366f1'}
                strokeWidth={isSelected ? 2 : 1}
                strokeOpacity={isSelected ? 0.9 : 0.4}
                className="transition-all"
              />
              {/* Inner Core */}
              <circle
                r={isSelected ? 10 : 7}
                fill={isSelected ? '#22d3ee' : '#a855f7'}
                className="shadow-lg"
              />
              {/* Node Title Label */}
              <text
                y={26}
                fill="#cbd5e1"
                fontSize="11"
                fontFamily="monospace"
                textAnchor="middle"
                className="select-none pointer-events-none"
              >
                {node.title.slice(0, 16)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};