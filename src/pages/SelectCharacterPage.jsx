
import React, { useEffect, useState } from 'react';
import { buildApiUrl, getAuthHeaders, getPublicHeaders } from '../config/api';
import '../styles/select.css';

export default function SelectCharacterPage({ onSelect, onHistory }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload(); // Esto llevará al usuario de vuelta al login
  };
  const [heroes, setHeroes] = useState([]);
  const [villains, setVillains] = useState([]);
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  const [selectedVillains, setSelectedVillains] = useState([]);
  const [heroConfig, setHeroConfig] = useState({});
  const [villainConfig, setVillainConfig] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const hRes = await fetch(buildApiUrl('/api/heroes'), {
          headers: getPublicHeaders()
        });
        const vRes = await fetch(buildApiUrl('/api/villains'), {
          headers: getPublicHeaders()
        });
        const heroesData = await hRes.json();
        const villainsData = await vRes.json();
        setHeroes(Array.isArray(heroesData) ? heroesData.slice(0, 10) : []);
        setVillains(Array.isArray(villainsData) ? villainsData.slice(0, 10) : []);
      } catch {
        setError('Error al cargar personajes');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Selección múltiple (máx 3 por equipo)
  const toggleSelect = (id, type) => {
    if (type === 'hero') {
      setSelectedHeroes(prev => prev.includes(id)
        ? prev.filter(h => h !== id)
        : prev.length < 3 ? [...prev, id] : prev);
    } else {
      setSelectedVillains(prev => prev.includes(id)
        ? prev.filter(v => v !== id)
        : prev.length < 3 ? [...prev, id] : prev);
    }
  };

  // Edición de nivel y defensa
  const handleConfigChange = (e, id, type, field) => {
    e.stopPropagation(); // Evita que se active la selección al modificar los inputs
    const rawValue = parseInt(e.target.value) || 0;
    let value;
    
    if (field === 'level') {
      value = Math.max(1, Math.min(3, rawValue)); // Nivel entre 1 y 3
    } else {
      value = Math.max(30, Math.min(70, rawValue)); // Defensa entre 30 y 70
    }
    
    if (type === 'hero') {
      setHeroConfig(cfg => ({
        ...cfg,
        [id]: { ...cfg[id], [field]: value }
      }));
    } else {
      setVillainConfig(cfg => ({
        ...cfg,
        [id]: { ...cfg[id], [field]: value }
      }));
    }
  };

  // Función para obtener la clase CSS según el nivel del héroe
  const getHeroCardClass = (heroId) => {
    const level = heroConfig[heroId]?.level || 1;
    const isSelected = selectedHeroes.includes(heroId);
    return `character-card hero-level-${level}${isSelected ? ' selected' : ''}`;
  };

  // Función para obtener la clase CSS según el nivel del villano
  const getVillainCardClass = (villainId) => {
    const level = villainConfig[villainId]?.level || 1;
    const isSelected = selectedVillains.includes(villainId);
    return `character-card villain-level-${level}${isSelected ? ' selected' : ''}`;
  };

  // Enviar selección para crear batalla
  const handleStartBattle = async () => {
    setError('');
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      return;
    }

    if (selectedHeroes.length !== 3 || selectedVillains.length !== 3) {
      setError('Debes seleccionar 3 héroes y 3 villanos');
      return;
    }

    try {
      const res = await fetch(buildApiUrl('/api/battles/team'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          heroes: selectedHeroes,
          villains: selectedVillains,
          userSide: 'heroes', // Siempre jugar como héroes
          firstHero: selectedHeroes[0],
          firstVillain: selectedVillains[0],
          heroConfig,
          villainConfig
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear batalla');
      localStorage.setItem('currentBattleId', data.id);
      onSelect();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <div className="select-bg">
        <button onClick={handleLogout} className="logout-button">🚪 Salir</button>
        <div className="logo-container">
          <img src="/images/logo.png" alt="NOCT Logo" className="select-logo" />
        </div>
        <div style={{ color: '#ff3300', fontSize: '1.5rem', textAlign: 'center' }}>
          Cargando personajes...
        </div>
      </div>
    );
  }

  return (
    <div className="select-bg">
      <button onClick={handleLogout} className="logout-button">🚪 Salir</button>
      <div className="logo-container">
        <img src="/images/logo.png" alt="NOCT Logo" className="select-logo" />
      </div>
      <h2>Selecciona tu equipo (3 héroes) y rivales (3 villanos)</h2>
      
      {/* Sección de Héroes */}
      <div className="section-container">
        <h3 className="section-title heroes-title">TU EQUIPO - ALIADOS</h3>
        <div className="cards-container">
          {heroes.map(hero => (
            <div
              className={getHeroCardClass(hero.id)}
              key={hero.id}
              onClick={() => toggleSelect(hero.id, 'hero')}
            >
              <h3>{hero.name}</h3>
              <div style={{ marginBottom: '1rem', color: '#ff6600' }}>
                Alias: {hero.alias}
              </div>
              <label>
                Nivel: 
                <input 
                  type="number" 
                  min={1} 
                  max={3}
                  value={heroConfig[hero.id]?.level || 1}
                  onChange={e => handleConfigChange(e, hero.id, 'hero', 'level')}
                />
                <span className="input-hint">(1-3)</span>
              </label>
              <label>
                Defensa: 
                <input 
                  type="number" 
                  min={30} 
                  max={70}
                  value={heroConfig[hero.id]?.defense || 30}
                  onChange={e => handleConfigChange(e, hero.id, 'hero', 'defense')}
                />
                <span className="input-hint">(30-70)</span>
              </label>
              <button onClick={(e) => {
                e.stopPropagation();
                toggleSelect(hero.id, 'hero');
              }}>
                {selectedHeroes.includes(hero.id) ? 'Deseleccionar' : 'Seleccionar'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sección de Villanos */}
      <div className="section-container">
        <h3 className="section-title villains-title">RIVALES</h3>
        <div className="cards-container">
          {villains.map(villain => (
            <div
              className={getVillainCardClass(villain.id)}
              key={villain.id}
              onClick={() => toggleSelect(villain.id, 'villain')}
            >
              <h3>{villain.name}</h3>
              <div style={{ marginBottom: '1rem', color: '#ff6600' }}>
                Alias: {villain.alias}
              </div>
              <label>
                Nivel: 
                <input 
                  type="number" 
                  min={1} 
                  max={3}
                  value={villainConfig[villain.id]?.level || 1} 
                  onChange={e => handleConfigChange(e, villain.id, 'villain', 'level')}
                />
                <span className="input-hint">(1-3)</span>
              </label>
              <label>
                Defensa: 
                <input 
                  type="number" 
                  min={30} 
                  max={70} 
                  value={villainConfig[villain.id]?.defense || 30}
                  onChange={e => handleConfigChange(e, villain.id, 'villain', 'defense')}
                />
                <span className="input-hint">(30-70)</span>
              </label>
              <button onClick={(e) => {
                e.stopPropagation();
                toggleSelect(villain.id, 'villain');
              }}>
                {selectedVillains.includes(villain.id) ? 'Deseleccionar' : 'Seleccionar'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="action-buttons">
        <button className="history-btn" onClick={onHistory}>
          📜 Ver Historial
        </button>
        <button className="start-battle-btn" onClick={handleStartBattle}>
          ¡COMENZAR BATALLA!
        </button>
      </div>

      {/* Mensaje de error */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
