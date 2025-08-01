
import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import SelectCharacterPage from './pages/SelectCharacterPage';
import BattlePage from './pages/BattlePage';
import BattleHistoryPage from './pages/BattleHistoryPage';

export default function App() {
  // Simulación de navegación simple
  const [page, setPage] = useState('login');

  // Simulación de login y selección
  const handleLogin = () => setPage('select');
  const handleSelect = () => setPage('battle');
  const handleBackFromBattle = () => setPage('select');
  const handleGoToHistory = () => setPage('history');
  const handleBackFromHistory = () => setPage('select');

  if (page === 'login') return <LoginPage onLogin={handleLogin} />;
  if (page === 'select') return <SelectCharacterPage onSelect={handleSelect} onHistory={handleGoToHistory} />;
  if (page === 'battle') return <BattlePage onBack={handleBackFromBattle} />;
  if (page === 'history') return <BattleHistoryPage onBack={handleBackFromHistory} />;
}
