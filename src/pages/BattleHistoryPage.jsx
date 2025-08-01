import React, { useState, useEffect } from 'react';
import { buildApiUrl, getAuthHeaders } from '../config/api';
import '../styles/battle-history.css';

export default function BattleHistoryPage({ onBack }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload(); // Esto llevará al usuario de vuelta al login
  };
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBattleHistory();
  }, []);

  const fetchBattleHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const response = await fetch(buildApiUrl('/api/battles'), {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Error al cargar el historial');
      }

      const data = await response.json();
      setBattles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    return new Date(timestamp).toLocaleString('es-ES');
  };

  const getWinnerText = (battle) => {
    if (!battle.winner) return 'EN PROGRESO';
    if (battle.winner === 'heroes') return 'HÉROES';
    if (battle.winner === 'villains') return 'VILLANOS';
    if (battle.winner === 'empate') return 'EMPATE';
    return 'FINALIZADA';
  };

  const getWinnerClass = (battle) => {
    if (!battle.winner) return 'in-progress';
    if (battle.winner === 'heroes') return 'heroes-win';
    if (battle.winner === 'villains') return 'villains-win';
    if (battle.winner === 'empate') return 'draw';
    return 'finished';
  };

  if (loading) {
    return (
      <div className="battle-history-container">
        <button onClick={handleLogout} className="logout-button">🚪 Salir</button>
        <div className="loading">Cargando historial de batallas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="battle-history-container">
        <button onClick={handleLogout} className="logout-button">🚪 Salir</button>
        <div className="error-message">{error}</div>
        <button onClick={onBack} className="back-button">Volver</button>
      </div>
    );
  }

  return (
    <div className="battle-history-container">
      <button onClick={handleLogout} className="logout-button">🚪 Salir</button>
      <div className="history-header">
        <h1>📜 Historial de Batallas</h1>
        <button onClick={onBack} className="back-button">← Volver</button>
      </div>

      {battles.length === 0 ? (
        <div className="no-battles">
          <p>No tienes batallas registradas aún.</p>
          <p>¡Comienza una batalla para ver tu historial!</p>
        </div>
      ) : (
        <div className="battles-grid">
          {battles.map((battle) => (
            <div key={battle.id} className={`battle-card ${getWinnerClass(battle)}`}>
              <div className="battle-header">
                <h3>Batalla #{battle.id}</h3>
                <span className={`winner-badge ${getWinnerClass(battle)}`}>
                  {getWinnerText(battle)}
                </span>
              </div>

              <div className="battle-teams">
                <div className="team heroes-team">
                  <h4>🦸 Héroes</h4>
                  <div className="team-members">
                    {battle.teams?.heroes?.map((hero, index) => (
                      <div key={index} className="team-member">
                        <span className="member-name">{hero.name}</span>
                        <span className="member-level">Nv.{hero.level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="team villains-team">
                  <h4>🦹 Villanos</h4>
                  <div className="team-members">
                    {battle.teams?.villains?.map((villain, index) => (
                      <div key={index} className="team-member">
                        <span className="member-name">{villain.name}</span>
                        <span className="member-level">Nv.{villain.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="battle-footer">
                <span className="battle-date">{formatDate(battle.timestamp)}</span>
                {battle.userSide && (
                  <span className="user-side">
                    Jugaste como: {battle.userSide === 'heroes' ? '🦸 Héroes' : '🦹 Villanos'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 