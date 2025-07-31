
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

  // Función para cargar el estado de la batalla
  const fetchBattleState = async () => {
    try {
      const token = localStorage.getItem('token');
      const battleId = localStorage.getItem('currentBattleId');
      if (!battleId) {
        setError('No hay batalla activa');
        setLoading(false);
        return;
      }
      const res = await fetch(`https://apiheroe.vercel.app/api/battles/${battleId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('No se pudo cargar la batalla');
      const data = await res.json();
      setBattle(data);
    } catch (e) {
      // Mostrar mensaje de error detallado
      setError(
        (e.message || 'Error desconocido') +
        (current ? ` | Turno backend: ${current.side} (ID: ${current.side === 'heroes' ? current.heroId : current.villainId})` : '')
      );
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar el estado inicial y hacer polling cuando no es nuestro turno
  useEffect(() => {
    fetchBattleState(); // Carga inicial

    // Polling solo si hay batalla y no es nuestro turno y no hay ganador
    const intervalId = setInterval(() => {
      if (battle && battle.current?.side !== battle.userSide && !battle.winner) {
        fetchBattleState();
      }
    }, 3000); // cada 3 segundos

    return () => clearInterval(intervalId);
  }, [battle?.current?.side, battle?.userSide, battle?.winner]);

  if (loading) return <div className="battle-bg">Cargando batalla...</div>;
  if (!battle) return <div className="battle-bg">No hay batalla activa.</div>;

  // Determinar personajes activos
  const { teams, current, winner } = battle;
  console.log('Estado de batalla:', battle); // Debug


  // Determinar personajes activos basándose en el turno actual
  let activeHero = null;
  let activeVillain = null;
  
  // Buscar personajes activos según el turno actual
  // El backend usa 'hero' y 'villain' en lugar de 'heroId' y 'villainId'
  if (current?.side === 'heroes' && current?.hero) {
    activeHero = teams?.heroes?.find(h => h.id === current.hero);
  } else if (current?.side === 'villains' && current?.villain) {
    activeVillain = teams?.villains?.find(v => v.id === current.villain);
  }
  
  // Si no se encuentra el personaje activo, usar el que dice el backend
  if (!activeHero) {
    activeHero = teams?.heroes?.find(h => h.id === current?.hero) || teams?.heroes?.find(h => h.hp > 0) || teams?.heroes?.[0];
  }
  if (!activeVillain) {
    activeVillain = teams?.villains?.find(v => v.id === current?.villain) || teams?.villains?.find(v => v.hp > 0) || teams?.villains?.[0];
  }
  


  // Defensa mínima visual
  const heroDefense = Math.max(activeHero?.defense ?? 0, 30);
  const villainDefense = Math.max(activeVillain?.defense ?? 0, 30);

  // Debug de personajes activos
  console.log('Héroe activo:', activeHero);
  console.log('Villano activo:', activeVillain);
  console.log('Turno actual:', current);
  console.log('UserSide:', battle.userSide);
  console.log('¿Es nuestro turno?', current?.side === (battle.userSide || 'heroes'));
  
  // Contar personajes vivos
  const aliveHeroes = teams?.heroes?.filter(h => h.hp > 0) || [];
  const aliveVillains = teams?.villains?.filter(v => v.hp > 0) || [];

  // Realizar ataque
  const handleAttack = async (attackType) => {
    setActionLoading(true);
    setError('');

    // Calcular siempre los equipos y el turno actual
    const currentTeam = battle?.current?.side || 'heroes';
    const userTeam = battle?.userSide || 'heroes';

    if (currentTeam !== userTeam) {
      setError(`¡No es tu turno! Actualmente es el turno de ${currentTeam === 'heroes' ? 'Héroes' : 'Villanos'}, pero tú juegas como ${userTeam === 'heroes' ? 'Héroes' : 'Villanos'}.`);
      setActionLoading(false);
      return;
    }

    let attackerId = undefined;
    try {
      const token = localStorage.getItem('token');
      // El atacante debe ser el personaje que tiene el turno según el backend
      attackerId = userTeam === 'heroes' ? current?.hero : current?.villain;


      
      const res = await fetch(`https://apiheroe.vercel.app/api/battles/${battle.id}/attack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          attacker: attackerId,
          attackType
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al atacar');
      
      setBattle(data.battle); // Solo actualizamos el estado en memoria
    } catch (e) {
      setError(
        (e.message || 'Error desconocido') +
        ` | Atacante enviado: ${attackerId ?? '--'}`
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="battle-bg">
      <div className="battle-field">
        <div className="battle-zone player">
          <div className="circle-zone" />
          <div className={`stats ${activeHero?.hp <= 0 ? 'defeated' : ''}`}>
            <span className="character-name">
              {activeHero?.name || 'Héroe'}
              {activeHero?.hp <= 0 && <span style={{color: '#ff4444', fontSize: '0.8em'}}> (DERROTADO)</span>}
            </span>
            <div style={{fontSize: '0.8em', color: '#666', marginBottom: '0.5rem'}}>
              Héroes vivos: {aliveHeroes.length}/3
            </div>
            <div className="stat-row">
              <span>HP:</span>
              <div className="hp-bar">
                <div 
                  className="hp-fill" 
                  style={{width: `${(activeHero?.hp ?? 0)}%`}}
                />
                <span className="hp-text">{activeHero?.hp ?? 0}/100</span>
              </div>
            </div>
            <div className="stat-row">
              <span>DEF:</span>
              <span className="stat-value">{heroDefense}</span>
            </div>
            <div className="stat-row">
              <span>LVL:</span>
              <span className="stat-value">{activeHero?.level ?? '--'}</span>
            </div>
          </div>
        </div>
        <div className="battle-zone enemy">
          <div className="circle-zone" />
          <div className={`stats ${activeVillain?.hp <= 0 ? 'defeated' : ''}`}>
            <span className="character-name">
              {activeVillain?.name || 'Villano'}
              {activeVillain?.hp <= 0 && <span style={{color: '#ff4444', fontSize: '0.8em'}}> (DERROTADO)</span>}
            </span>
            <div style={{fontSize: '0.8em', color: '#666', marginBottom: '0.5rem'}}>
              Villanos vivos: {aliveVillains.length}/3
            </div>
            <div className="stat-row">
              <span>HP:</span>
              <div className="hp-bar">
                <div 
                  className="hp-fill" 
                  style={{width: `${(activeVillain?.hp ?? 0)}%`}}
                />
                <span className="hp-text">{activeVillain?.hp ?? 0}/100</span>
              </div>
            </div>
            <div className="stat-row">
              <span>DEF:</span>
              <span className="stat-value">{villainDefense}</span>
            </div>
            <div className="stat-row">
              <span>LVL:</span>
              <span className="stat-value">{activeVillain?.level ?? '--'}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="battle-status">
        {/* Mostrar de quién es el turno */}
        {!winner && (
          <div className={`turn-indicator ${current?.side || 'heroes'}`}>
            Turno de: {current?.side === 'villains' ? 'Villanos' : 'Héroes'}
            <span className="current-character">
              ({current?.side === 'villains' ? activeVillain?.name : activeHero?.name})
            </span>
            {current?.side !== (battle.userSide || 'heroes') && (
              <div className="waiting-turn">
                Esperando el turno del oponente...
              </div>
            )}
          </div>
        )}
      </div>

      <div className="battle-menu">
        {winner ? (
          <div style={{ color: winner === 'heroes' ? '#7bb661' : winner === 'villains' ? '#b94a48' : '#b2b2b2', fontWeight: 'bold', fontSize: '1.3rem' }}>
            {winner === 'heroes' && '¡Ganaste la batalla!'}
            {winner === 'villains' && '¡Perdiste la batalla!'}
            {winner === 'empate' && '¡Empate!'}
          </div>
        ) : (
          ATTACKS.map(a => {
            // Verificar si es nuestro turno
            const isOurTurn = current?.side === (battle.userSide || 'heroes');
            
            const isCorrectCharacter = (battle.userSide === 'heroes' && current?.hero && activeHero?.id === current?.hero) ||
                                     (battle.userSide === 'villains' && current?.villain && activeVillain?.id === current?.villain);
            
            return (
              <button
                key={a.type}
                onClick={() => handleAttack(a.type)}
                disabled={actionLoading || !isOurTurn}
                className={actionLoading ? 'disabled' : ''}
              >
                {a.label}
              </button>
            );
          })
        )}
      </div>
      {error && (
        <div style={{ color: '#ffbaba', marginTop: 8 }}>
          {error}
          <br />
          <span style={{ fontSize: '0.9em', color: '#fff6' }}>
            Debug: Turno={current?.side}, UserSide={battle.userSide}, HeroId={current?.heroId}, VillainId={current?.villainId}
          </span>
        </div>
      )}
    </div>
  );
}
