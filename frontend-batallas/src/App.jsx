
import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import SelectCharacterPage from './pages/SelectCharacterPage';
import BattlePage from './pages/BattlePage';

export default function App() {
  // Simulación de navegación simple
  const [page, setPage] = useState('login');

  // Simulación de login y selección
  const handleLogin = () => setPage('select');
  const handleSelect = () => setPage('battle');

  if (page === 'login') return <LoginPage onLogin={handleLogin} />;
  if (page === 'select') return <SelectCharacterPage onSelect={handleSelect} />;
  return <BattlePage />;
}
