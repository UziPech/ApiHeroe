
import React, { useEffect, useState } from 'react';
import '../styles/battle.css';

const ATTACKS = [
  { type: 'basico', label: 'Ataque Básico' },
  { type: 'critico', label: 'Crítico' },
  { type: 'especial', label: 'Especial' }
];

export default function BattlePage() {
  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Cargar estado inicial de la batalla
    const battleData = localStorage.getItem('battle');
    if (battleData) {
      setBattle(JSON.parse(battleData));
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="battle-bg">Cargando batalla...</div>;
  if (!battle) return <div className="battle-bg">No hay batalla activa.</div>;

  // Determinar personajes activos
  const { teams, current, winner } = battle;
  const activeHero = teams?.heroes?.find(h => h.id === current?.heroId);
  const activeVillain = teams?.villains?.find(v => v.id === current?.villainId);

  // Realizar ataque
  const handleAttack = async (attackType) => {
    setActionLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const API = 'https://apiheroe-b8h7mqk6t-uziels-projects-fa4bbf7c.vercel.app';
      const res = await fetch(`${API}/battles/${battle.id}/attack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          attacker: current.heroId,
          attackType
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al atacar');
      setBattle(data.battle);
      localStorage.setItem('battle', JSON.stringify(data.battle));
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="battle-bg">
      <div className="battle-field">
        <div className="battle-zone player">
          <div className="circle-zone" />
          <div className="stats">
            <span>{activeHero?.name || 'Héroe'}</span>
            <span>Vida: {activeHero?.hp ?? '--'}</span>
            <span>Defensa: {activeHero?.defense ?? '--'}</span>
            <span>Nivel: {activeHero?.level ?? '--'}</span>
          </div>
        </div>
        <div className="battle-zone enemy">
          <div className="circle-zone" />
          <div className="stats">
            <span>{activeVillain?.name || 'Villano'}</span>
            <span>Vida: {activeVillain?.hp ?? '--'}</span>
            <span>Defensa: {activeVillain?.defense ?? '--'}</span>
            <span>Nivel: {activeVillain?.level ?? '--'}</span>
          </div>
        </div>
      </div>
      <div className="battle-menu">
        {winner ? (
          <div style={{ color: winner === 'heroes' ? '#7bb661' : winner === 'villains' ? '#b94a48' : '#b2b2b2', fontWeight: 'bold', fontSize: '1.3rem' }}>
            {winner === 'heroes' && '¡Ganaste la batalla!'}
            {winner === 'villains' && '¡Perdiste la batalla!'}
            {winner === 'empate' && '¡Empate!'}
          </div>
        ) : (
          ATTACKS.map(a => (
            <button key={a.type} onClick={() => handleAttack(a.type)} disabled={actionLoading}>
              {a.label}
            </button>
          ))
        )}
      </div>
      {error && <div style={{ color: '#ffbaba', marginTop: 8 }}>{error}</div>}
    </div>
  );
}
