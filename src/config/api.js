// Configuración centralizada de la API
const API_CONFIG = {
  // URL del backend - cambiar aquí cuando se haga un nuevo deploy
  BASE_URL: 'https://apiheroe.vercel.app',
  
  // Endpoints
  ENDPOINTS: {
    HEROES: '/api/heroes',
    VILLAINS: '/api/villains',
    BATTLES: '/api/battles',
    TEAM_BATTLE: '/api/battles/team',
    ATTACK: (battleId) => `/api/battles/${battleId}/attack`,
    BATTLE_STATE: (battleId) => `/api/battles/${battleId}`
  }
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función helper para headers con autenticación
export const getAuthHeaders = (token) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Función helper para headers sin autenticación (para endpoints públicos)
export const getPublicHeaders = () => {
  return {
    'Content-Type': 'application/json'
  };
};

export default API_CONFIG; 