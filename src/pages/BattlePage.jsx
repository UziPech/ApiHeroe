
import React, { useEffect, useState, useCallback } from 'react';
import { buildApiUrl, getAuthHeaders } from '../config/api';
import '../styles/battle.css';

const ATTACKS = [
  { type: 'basico', label: 'Ataque Básico', key: 'A' },
  { type: 'critico', label: 'Crítico', key: 'S' },
  { type: 'especial', label: 'Especial', key: 'D' }
];

// Mapeo de teclas para ataques
const KEY_MAPPING = {
  'KeyA': 'basico',
  'KeyS': 'critico', 
  'KeyD': 'especial'
};

export default function BattlePage({ onBack }) {
  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [damagedCharacters, setDamagedCharacters] = useState(new Set()); // Para efecto de daño
  const [pressedKey, setPressedKey] = useState(null); // Para efecto visual de tecla presionada

  // Función para cargar el estado de la batalla
  const fetchBattleState = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const battleId = localStorage.getItem('currentBattleId');
      if (!battleId) {
        setError('No hay batalla activa');
        setLoading(false);
        return;
      }
      const res = await fetch(buildApiUrl(`/api/battles/${battleId}`), {
        headers: getAuthHeaders(token)
      });
      if (!res.ok) throw new Error('No se pudo cargar la batalla');
      const data = await res.json();
      setBattle(data);
    } catch (err) {
      setError(
        (err.message || 'Error desconocido')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Sistema de controles de teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Solo procesar si no estamos cargando y es nuestro turno
      const isOurTurn = battle?.current?.side === (battle?.userSide || 'heroes');
      const hasActiveCharacter = (battle?.userSide === 'heroes' ? 
        (battle?.teams?.heroes?.find(h => h.id === battle?.current?.hero)?.hp > 0) :
        (battle?.teams?.villains?.find(v => v.id === battle?.current?.villain)?.hp > 0)
      );

      if (actionLoading || !isOurTurn || !hasActiveCharacter || battle?.winner) {
        return;
      }

      // Verificar si la tecla presionada está en nuestro mapeo
      const attackType = KEY_MAPPING[event.code];
      if (attackType) {
        event.preventDefault(); // Prevenir comportamiento por defecto
        
        // Efecto visual de tecla presionada
        setPressedKey(event.code);
        setTimeout(() => setPressedKey(null), 150);
        
        // Ejecutar ataque
        handleAttack(attackType);
      }
    };

    // Agregar event listener solo cuando el componente está montado
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [battle, actionLoading]); // Dependencias para que se actualice cuando cambie el estado

  // Efecto para cargar el estado inicial y hacer polling cuando no es nuestro turno
  useEffect(() => {
    fetchBattleState(); // Carga inicial

    // Polling solo si hay batalla, no es nuestro turno, no hay ganador y no estamos cargando una acción
    const intervalId = setInterval(() => {
      if (!actionLoading && battle && !battle.winner) { // Solo hacer polling si no estamos ejecutando una acción
        fetchBattleState();
      }
    }, 2000); // Reducido a 2 segundos para mejor respuesta

    return () => clearInterval(intervalId);
  }, [fetchBattleState, actionLoading, battle?.winner]); // Incluir winner en las dependencias

  // Función para volver a la selección de personajes
  const handleBackToSelection = () => {
    try {
      console.log('🔙 Volviendo a selección de personajes...');
      
      // Limpiar la batalla actual del localStorage
      localStorage.removeItem('currentBattleId');
      console.log('✅ currentBattleId eliminado del localStorage');
      
      // Verificar si la función onBack existe
      if (onBack && typeof onBack === 'function') {
        console.log('✅ Llamando a onBack()');
        onBack(); // Llamar a la función de navegación hacia atrás
      } else {
        console.error('❌ onBack no está definido o no es una función:', onBack);
        // Fallback: recargar la página para ir al login
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Error en handleBackToSelection:', error);
      // Fallback: recargar la página
      window.location.reload();
    }
  };

  if (loading) return <div className="battle-bg">Cargando batalla...</div>;
  if (!battle) return <div className="battle-bg">No hay batalla activa.</div>;

  // Determinar personajes activos
  const { teams, current, winner } = battle;
  console.log('Estado de batalla:', battle); // Debug

  // Buscar personajes activos según el backend
  let activeHero = null;
  let activeVillain = null;
  
  if (current?.hero) {
    activeHero = teams?.heroes?.find(h => h.id === current.hero);
  }
  if (current?.villain) {
    activeVillain = teams?.villains?.find(v => v.id === current.villain);
  }
  
  // Si no hay personaje activo o está muerto, buscar el primer vivo
  if (!activeHero || activeHero.hp <= 0) {
    const aliveHeroes = teams?.heroes?.filter(h => h.hp > 0) || [];
    if (aliveHeroes.length > 0) {
      activeHero = aliveHeroes[0];
    }
  }
  
  if (!activeVillain || activeVillain.hp <= 0) {
    const aliveVillains = teams?.villains?.filter(v => v.hp > 0) || [];
    if (aliveVillains.length > 0) {
      activeVillain = aliveVillains[0];
    }
  }

  // Defensa real del backend (puede reducirse a 0)
  const heroDefense = activeHero?.defense ?? 0;
  const villainDefense = activeVillain?.defense ?? 0;

  // Debug de personajes activos
  console.log('Héroe activo:', activeHero);
  console.log('Villano activo:', activeVillain);
  console.log('Turno actual:', current);
  console.log('UserSide:', battle.userSide);
  console.log('¿Es nuestro turno?', current?.side === (battle.userSide || 'heroes'));
  
  // Contar personajes vivos
  const aliveHeroes = teams?.heroes?.filter(h => h.hp > 0) || [];
  const aliveVillains = teams?.villains?.filter(v => v.hp > 0) || [];

  // Función para mostrar efecto de daño
  const showDamageEffect = (characterId) => {
    setDamagedCharacters(prev => new Set([...prev, characterId]));
    // Remover el efecto después de 1 segundo
    setTimeout(() => {
      setDamagedCharacters(prev => {
        const newSet = new Set(prev);
        newSet.delete(characterId);
        return newSet;
      });
    }, 1000);
  };

  // Realizar ataque
  const handleAttack = async (attackType) => {
    setActionLoading(true);
    setError('');

    // Verificar que sea nuestro turno
    const currentTeam = battle?.current?.side || 'heroes';
    const userTeam = battle?.userSide || 'heroes';

    if (currentTeam !== userTeam) {
      setError(`¡No es tu turno! Actualmente es el turno de ${currentTeam === 'heroes' ? 'Tu Equipo' : 'Rivales'}, pero tú juegas como Tu Equipo.`);
      setActionLoading(false);
      return;
    }

    // Usar el ID del personaje activo según el backend
    let attackerId = userTeam === 'heroes' ? current?.hero : current?.villain;
    
    // Verificar que el personaje activo esté vivo
    const activeCharacter = userTeam === 'heroes' ? 
      teams?.heroes?.find(h => h.id === attackerId) : 
      teams?.villains?.find(v => v.id === attackerId);
    
    if (!activeCharacter || activeCharacter.hp <= 0) {
      setError(`El personaje activo (ID: ${attackerId}) está derrotado. Espera a que se actualice el turno.`);
      setActionLoading(false);
      return;
    }
    
    // DEBUG: Mostrar qué ID estamos enviando
    console.log('Enviando ataque con ID:', attackerId);
    console.log('Personaje activo:', activeCharacter);
    console.log('Tipo de ataque:', attackType);
    
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(buildApiUrl(`/api/battles/${battle.id}/attack`), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          attacker: attackerId,
          attackType
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al atacar');
      }
      
      console.log('Respuesta del ataque:', data);
      
      // Mostrar efecto de daño en el objetivo
      const targetId = userTeam === 'heroes' ? 
        (data.battle?.teams?.villains?.find(v => v.hp < activeVillain?.hp)?.id) :
        (data.battle?.teams?.heroes?.find(h => h.hp < activeHero?.hp)?.id);
      
      if (targetId) {
        showDamageEffect(targetId);
      }
      
      // Actualizar el estado completo con la respuesta del backend
      setBattle(data.battle);
      
      // Delay más largo para asegurar que el backend procese
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recargar estado para asegurar sincronización
      await fetchBattleState();
      
    } catch (e) {
      console.error('Error en ataque:', e);
      setError(
        (e.message || 'Error desconocido') +
        ` | Atacante enviado: ${attackerId ?? '--'}`
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Función para obtener la imagen del personaje según su nivel
  const getCharacterImage = (character, isVillain = false) => {
    if (!character) return isVillain ? '/images/villano_comb_level1.png' : '/images/heroe_comb_level1.png'; // Fallback
    
    try {
      const level = character.level || 1;
      const characterType = isVillain ? 'villano' : 'heroe';
      const imagePath = `/images/${characterType}_comb_level${level}.png`;
      
      // Retornar directamente la ruta de la imagen según el nivel
      // El manejo de errores se hace en el onError del elemento img
      return imagePath;
    } catch (error) {
      console.warn('Error al obtener imagen del personaje:', error);
      return isVillain ? '/images/villano_comb_level1.png' : '/images/heroe_comb_level1.png'; // Fallback seguro
    }
  };

  return (
    <div className="battle-bg">
      <div className="battle-container">
        <div className="battle-field">
          {/* Zona del enemigo (esquina superior derecha) */}
          <div className="battle-zone enemy">
            <div className="stats">
              <span className="character-name">
                {activeVillain?.name || 'Villanos'}
                {activeVillain?.hp <= 0 && <span style={{color: '#ff4444', fontSize: '0.8em'}}> (DERROTADO)</span>}
              </span>
              <div className="team-status">
                Villanos vivos: {aliveVillains.length}/3
              </div>
              <div className="stat-row">
                <div className="stat-label">
                  <span className="hp-icon">❤️</span>
                  HP:
                </div>
                <div className="hp-container">
                  <div className="hp-bar">
                    <div 
                      className="hp-fill" 
                      style={{width: `${(activeVillain?.hp ?? 0)}%`}}
                    />
                    <span className="hp-text">{activeVillain?.hp ?? 0}/100</span>
                  </div>
                </div>
              </div>
              <div className="stat-row">
                <div className="stat-label">
                  <span className="defense-icon">🛡️</span>
                  DEF:
                </div>
                <div className="defense-container">
                  <div className="defense-bar">
                    <div 
                      className="defense-fill" 
                      style={{width: `${(villainDefense ?? 0)}%`}}
                    />
                    <span className="defense-text">{villainDefense ?? 0}/100</span>
                  </div>
                </div>
              </div>
              <div className="stat-row">
                <div className="stat-label">LVL:</div>
                <span className="stat-value">{activeVillain?.level ?? '--'}</span>
              </div>
            </div>
            
            {/* Imagen del personaje enemigo */}
            <div className={`character-image-container enemy ${activeVillain?.hp <= 0 ? 'defeated' : ''} ${battle?.currentTurn === 'villains' ? 'battling' : ''} ${damagedCharacters.has(activeVillain?.id) ? 'damaged' : ''}`}>
              <img 
                src={getCharacterImage(activeVillain, true)}
                alt={`Villano ${activeVillain?.name || 'Nivel 1'}`}
                className="character-image"
                onError={(e) => {
                  e.target.src = '/images/villano_comb_level1.png';
                  console.warn('Error cargando imagen del villano, usando fallback');
                }}
              />
            </div>
          </div>

          {/* Área central para efectos de batalla */}
          <div className="battle-center">
            {/* Aquí se pueden agregar efectos de batalla, animaciones, etc. */}
          </div>

          {/* Zona del jugador (parte inferior) */}
          <div className="battle-zone player">
            <div className="stats">
              <span className="character-name">
                {activeHero?.name || 'Equipo'}
                {activeHero?.hp <= 0 && <span style={{color: '#ff4444', fontSize: '0.8em'}}> (DERROTADO)</span>}
              </span>
              <div className="team-status">
                Equipo vivo: {aliveHeroes.length}/3
              </div>
              <div className="stat-row">
                <div className="stat-label">
                  <span className="hp-icon">❤️</span>
                  HP:
                </div>
                <div className="hp-container">
                  <div className="hp-bar">
                    <div 
                      className="hp-fill" 
                      style={{width: `${(activeHero?.hp ?? 0)}%`}}
                    />
                    <span className="hp-text">{activeHero?.hp ?? 0}/100</span>
                  </div>
                </div>
              </div>
              <div className="stat-row">
                <div className="stat-label">
                  <span className="defense-icon">🛡️</span>
                  DEF:
                </div>
                <div className="defense-container">
                  <div className="defense-bar">
                    <div 
                      className="defense-fill" 
                      style={{width: `${(heroDefense ?? 0)}%`}}
                    />
                    <span className="defense-text">{heroDefense ?? 0}/100</span>
                  </div>
                </div>
              </div>
              <div className="stat-row">
                <div className="stat-label">LVL:</div>
                <span className="stat-value">{activeHero?.level ?? '--'}</span>
              </div>
            </div>
            
            {/* Imagen del personaje jugador */}
            <div className={`character-image-container player ${activeHero?.hp <= 0 ? 'defeated' : ''} ${battle?.currentTurn === 'heroes' ? 'battling' : ''} ${damagedCharacters.has(activeHero?.id) ? 'damaged' : ''}`}>
              <img 
                src={getCharacterImage(activeHero, false)}
                alt={`Héroe ${activeHero?.name || 'Nivel 1'}`}
                className="character-image"
                onError={(e) => {
                  e.target.src = '/images/heroe_comb_level1.png';
                  console.warn('Error cargando imagen del héroe, usando fallback');
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="battle-status">
          {/* Mostrar de quién es el turno */}
          {!winner && (
            <div className={`turn-indicator ${current?.side || 'heroes'}`}>
              Turno de: {current?.side === 'villains' ? 'Rivales' : 'Tu Equipo'}
              <span className="current-character">
                ({current?.side === 'villains' ? activeVillain?.name : activeHero?.name})
              </span>
              {current?.side !== (battle.userSide || 'heroes') && (
                <div className="waiting-turn">
                  Esperando el turno del oponente...
                </div>
              )}
              {current?.side === (battle.userSide || 'heroes') && (
                <div className="keyboard-hint">
                  💡 Usa las teclas A, S, D para atacar rápidamente
                </div>
              )}
            </div>
          )}
        </div>

        <div className="battle-menu">
          {winner ? (
            <div className="battle-result">
              <div className="result-message" style={{ 
                color: winner === 'heroes' ? '#7bb661' : winner === 'villains' ? '#b94a48' : '#b2b2b2', 
                fontWeight: 'bold', 
                fontSize: '1.5rem',
                marginBottom: '20px'
              }}>
                {winner === 'heroes' && '🎉 ¡Ganaste la batalla! 🎉'}
                {winner === 'villains' && '💀 ¡Perdiste la batalla! 💀'}
                {winner === 'empate' && '🤝 ¡Empate! 🤝'}
              </div>
              <button 
                className="back-button victory-back-button"
                onClick={handleBackToSelection}
                type="button"
              >
                <span>🔙 Volver a Selección</span>
              </button>
            </div>
          ) : (
            ATTACKS.map(a => {
              // Verificar si es nuestro turno
              const isOurTurn = current?.side === (battle.userSide || 'heroes');
              
              // Verificar que el personaje activo esté vivo
              const activeCharacter = (battle.userSide === 'heroes' ? activeHero : activeVillain);
              const isActiveCharacterAlive = activeCharacter && activeCharacter.hp > 0;
              
              // DEBUG: Mostrar información del botón
              console.log(`Botón ${a.label}:`, {
                actionLoading,
                isOurTurn,
                activeCharacter: activeCharacter ? { id: activeCharacter.id, hp: activeCharacter.hp, name: activeCharacter.name } : null,
                isActiveCharacterAlive,
                disabled: actionLoading || !isOurTurn || !isActiveCharacterAlive
              });
              
              return (
                <button
                  key={a.type}
                  onClick={() => handleAttack(a.type)}
                  disabled={actionLoading || !isOurTurn || !isActiveCharacterAlive}
                  className={`attack-button ${actionLoading ? 'disabled' : ''} ${pressedKey === `Key${a.key}` ? 'key-pressed' : ''}`}
                >
                  <span className="attack-label">{a.label}</span>
                  <span className="key-indicator">({a.key})</span>
                </button>
              );
            })
          )}
        </div>
        
        {error && (
          <div style={{ color: '#ffbaba', marginTop: 8, textAlign: 'center', maxWidth: '600px' }}>
            {error}
            <br />
            <span style={{ fontSize: '0.9em', color: '#fff6' }}>
              Debug: Turno={current?.side}, UserSide={battle.userSide}, 
              HéroeActivo={activeHero?.id}({activeHero?.hp}HP), 
              VillanoActivo={activeVillain?.id}({activeVillain?.hp}HP)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
