// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Notes } from './pages/Notes';
import { KnowledgeGraph } from './pages/KnowledgeGraph';
import { Journal } from './pages/Journal';
import { Resources } from './pages/Resources';
import { Collections } from './pages/Collections';
import { Settings } from './pages/Settings';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="notes" element={<Notes />} />
          <Route path="graph" element={<KnowledgeGraph />} />
          <Route path="journal" element={<Journal />} />
          <Route path="resources" element={<Resources />} />
          <Route path="collections" element={<Collections />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}