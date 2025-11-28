import React, { useState } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/Dashboard';

export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <div className="app-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      <Header />
      <main className="app-content">
        <DashboardView activeNav={activeNav} />
      </main>
    </div>
  );
}