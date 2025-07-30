
import React, { useEffect, useState } from 'react';
import '../styles/select.css';

export default function SelectCharacterPage({ onSelect }) {
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
        const token = localStorage.getItem('token');
        const API = 'https://apiheroe-b8h7mqk6t-uziels-projects-fa4bbf7c.vercel.app';
        const [hRes, vRes] = await Promise.all([
          fetch(`${API}/heroes`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/villains`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const heroesData = await hRes.json();
        const villainsData = await vRes.json();
        setHeroes(heroesData);
        setVillains(villainsData);
      } catch (e) {
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
  const handleConfigChange = (id, type, field, value) => {
    if (type === 'hero') {
      setHeroConfig(cfg => ({ ...cfg, [id]: { ...cfg[id], [field]: Number(value) } }));
    } else {
      setVillainConfig(cfg => ({ ...cfg, [id]: { ...cfg[id], [field]: Number(value) } }));
    }
  };

  // Enviar selección para crear batalla
  const handleStartBattle = async () => {
    setError('');
    if (selectedHeroes.length !== 3 || selectedVillains.length !== 3) {
      setError('Debes seleccionar 3 héroes y 3 villanos');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const API = 'https://apiheroe-b8h7mqk6t-uziels-projects-fa4bbf7c.vercel.app';
      const res = await fetch(`${API}/battles/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          heroes: selectedHeroes,
          villains: selectedVillains,
          userSide: 'heroes',
          firstHero: selectedHeroes[0],
          firstVillain: selectedVillains[0],
          heroConfig,
          villainConfig
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear batalla');
      // Guardar el estado inicial de la batalla para la siguiente pantalla
      localStorage.setItem('battle', JSON.stringify(data));
      onSelect();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="select-bg">
      <h2>Selecciona tu equipo (3 héroes y 3 villanos)</h2>
      {loading ? <div>Cargando personajes...</div> : (
        <>
          <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center' }}>
            <div>
              <h3>Héroes</h3>
              <div className="cards-container">
                {heroes.map(hero => (
                  <div
                    className={`character-card${selectedHeroes.includes(hero.id) ? ' selected' : ''}`}
                    key={hero.id}
                    onClick={() => toggleSelect(hero.id, 'hero')}
                  >
                    <h4>{hero.name}</h4>
                    <div>Alias: {hero.alias}</div>
                    <label>Nivel: <input type="number" min={1} max={100} value={heroConfig[hero.id]?.level || 1} onChange={e => handleConfigChange(hero.id, 'hero', 'level', e.target.value)} /></label>
                    <label>Defensa: <input type="number" min={0} max={999} value={heroConfig[hero.id]?.defense || 0} onChange={e => handleConfigChange(hero.id, 'hero', 'defense', e.target.value)} /></label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3>Villanos</h3>
              <div className="cards-container">
                {villains.map(villain => (
                  <div
                    className={`character-card${selectedVillains.includes(villain.id) ? ' selected' : ''}`}
                    key={villain.id}
                    onClick={() => toggleSelect(villain.id, 'villain')}
                  >
                    <h4>{villain.name}</h4>
                    <div>Alias: {villain.alias}</div>
                    <label>Nivel: <input type="number" min={1} max={100} value={villainConfig[villain.id]?.level || 1} onChange={e => handleConfigChange(villain.id, 'villain', 'level', e.target.value)} /></label>
                    <label>Defensa: <input type="number" min={0} max={999} value={villainConfig[villain.id]?.defense || 0} onChange={e => handleConfigChange(villain.id, 'villain', 'defense', e.target.value)} /></label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button style={{ marginTop: 32, fontSize: '1.2rem' }} onClick={handleStartBattle}>
            ¡Comenzar Batalla!
          </button>
          {error && <div style={{ color: '#ffbaba', marginTop: 8 }}>{error}</div>}
        </>
      )}
    </div>
  );
}
