
import React, { useEffect, useState } from 'react';
import '../styles/select.css';

export default function SelectCharacterPage({ onSelect }) {
  const [heroes, setHeroes] = useState([]);
  const [villains, setVillains] = useState([]);
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  const [selectedVillains, setSelectedVillains] = useState([]);
  const [heroConfig, setHeroConfig] = useState({});
  const [villainConfig, setVillainConfig] = useState({});
  // Siempre jugar como héroes (equipo)
  const userSide = 'heroes';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
                 const hRes = await fetch('https://apiheroe-r9hz01hto-uziels-projects-fa4bbf7c.vercel.app/api/heroes', {
           headers: {
             'Content-Type': 'application/json'
           }
         });
         const vRes = await fetch('https://apiheroe-r9hz01hto-uziels-projects-fa4bbf7c.vercel.app/api/villains', {
           headers: {
             'Content-Type': 'application/json'
           }
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
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debug
      console.log('Datos a enviar:', {
        heroes: selectedHeroes,
        villains: selectedVillains,
        userSide: 'heroes',
        firstHero: selectedHeroes[0],
        firstVillain: selectedVillains[0],
        heroConfig,
        villainConfig
      }); // Debug

             const res = await fetch('https://apiheroe-r9hz01hto-uziels-projects-fa4bbf7c.vercel.app/api/battles/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Agregamos 'Bearer' al token
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
      // Solo guardamos el ID de la batalla
      localStorage.setItem('currentBattleId', data.id);
      onSelect();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="select-bg">
      <h2>Selecciona tu equipo (3 héroes) y rivales (3 villanos)</h2>
      {loading ? <div>Cargando personajes...</div> : (
        <>
          <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center' }}>
            <div>
              <h3>Tu Equipo (Héroes)</h3>
              <div className="cards-container">
                {heroes.map(hero => (
                  <div
                    className={`character-card${selectedHeroes.includes(hero.id) ? ' selected' : ''}`}
                    key={hero.id}
                    onClick={() => toggleSelect(hero.id, 'hero')}
                  >
                    <h4>{hero.name}</h4>
                    <div>Alias: {hero.alias}</div>
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
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3>Rivales (Villanos)</h3>
              <div className="cards-container">
                {villains.map(villain => (
                  <div
                    className={`character-card${selectedVillains.includes(villain.id) ? ' selected' : ''}`}
                    key={villain.id}
                    onClick={() => toggleSelect(villain.id, 'villain')}
                  >
                    <h4>{villain.name}</h4>
                    <div>Alias: {villain.alias}</div>
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
