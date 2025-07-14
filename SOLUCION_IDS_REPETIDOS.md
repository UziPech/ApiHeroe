# 🎯 Solución para Conflictos de IDs Repetidos en API de Combates

## 📋 Resumen del Problema

Cuando una API de superhéroes tiene IDs repetidos entre héroes y villanos, se generan conflictos en las batallas por equipos porque el sistema no puede distinguir entre personajes con el mismo ID.

### Ejemplo del Problema:
```json
{
  "heroes": [
    {"id": 1, "name": "Superman"},
    {"id": 2, "name": "Iron Man"},    // ID 2
    {"id": 3, "name": "Spider-Man"}
  ],
  "villains": [
    {"id": 2, "name": "Villano X"},   // ID 2 (conflicto)
    {"id": 3, "name": "Villano Y"},   // ID 3 (conflicto)
    {"id": 4, "name": "Thanos"}
  ]
}
```

---

## 🛠️ Solución Implementada

### 1. IDs Únicos por Batalla

**Problema:** Batallas con IDs duplicados
**Solución:** Usar timestamps únicos para cada batalla

```javascript
// En battleService.js
const battleResult = {
  id: Date.now(), // Garantiza ID único
  timestamp: new Date().toISOString(),
  // resto de datos de la batalla
};
```

### 2. Identificación por Contexto de Equipo

**Problema:** No se puede distinguir entre héroes y villanos con mismo ID
**Solución:** Usar contexto de equipo + ID

```javascript
// En battleModel.js
class Battle {
  constructor({ id, heroes, villains, userSide, firstHero, firstVillain }) {
    this.id = id;
    this.teams = {
      heroes: heroes.map(heroId => ({ 
        id: heroId, 
        hp: 100,
        team: 'heroes' 
      })),
      villains: villains.map(villainId => ({ 
        id: villainId, 
        hp: 100,
        team: 'villains' 
      })),
    };
    this.current = {
      hero: firstHero,
      villain: firstVillain,
      side: userSide
    };
  }
}
```

### 3. Validación Estricta por Equipo

**Problema:** Ataques entre personajes incorrectos
**Solución:** Validar que solo se ataque con personajes activos del equipo correcto

```javascript
// En battleService.js
function validateAttack(battle, attackerId, defenderId, userTeam) {
  const activeHero = battle.current.hero;
  const activeVillain = battle.current.villain;
  
  if (userTeam === 'heroes' && battle.current.side === 'heroes') {
    if (attackerId !== activeHero || defenderId !== activeVillain) {
      throw new Error('Solo puedes atacar con tu héroe activo al villano activo');
    }
  } else if (userTeam === 'villains' && battle.current.side === 'villains') {
    if (attackerId !== activeVillain || defenderId !== activeHero) {
      throw new Error('Solo puedes atacar con tu villano activo al héroe activo');
    }
  } else {
    throw new Error('No es el turno de tu equipo');
  }
}
```

### 4. Función de Búsqueda por Contexto

**Problema:** No se puede encontrar personajes específicos
**Solución:** Función que busca por equipo + ID

```javascript
// Función auxiliar para encontrar personajes
function findCharacter(battle, characterId, team) {
  return battle.teams[team].find(char => char.id === characterId);
}

// Uso:
const hero = findCharacter(battle, 2, 'heroes');     // ID 2 en héroes
const villain = findCharacter(battle, 2, 'villains'); // ID 2 en villanos
```

---

## 📊 Estructura de Datos Final

### Ejemplo de Batalla con IDs Repetidos

```json
{
  "id": 1752205760910,
  "timestamp": "2025-07-11T03:49:20.911Z",
  "teams": {
    "heroes": [
      {"id": 1, "hp": 100, "team": "heroes"},
      {"id": 2, "hp": 100, "team": "heroes"},    // Iron Man
      {"id": 3, "hp": 100, "team": "heroes"}
    ],
    "villains": [
      {"id": 2, "hp": 100, "team": "villains"},  // Diferente personaje
      {"id": 3, "hp": 100, "team": "villains"},  // Diferente personaje
      {"id": 4, "hp": 100, "team": "villains"}
    ]
  },
  "userSide": "villains",
  "turn": 1,
  "current": {
    "hero": 2,    // Se refiere al héroe con ID 2
    "villain": 3, // Se refiere al villano con ID 3
    "side": "heroes"
  },
  "finished": false,
  "winner": null,
  "actions": []
}
```

---

## 🔧 Implementación Paso a Paso

### Paso 1: Modificar el Modelo de Batalla

```javascript
// models/battleModel.js
export default class Battle {
  constructor({ id, heroes, villains, userSide, firstHero, firstVillain }) {
    this.id = id || Date.now();
    this.teams = {
      heroes: heroes.map(heroId => ({ 
        id: heroId, 
        hp: 100,
        team: 'heroes' 
      })),
      villains: villains.map(villainId => ({ 
        id: villainId, 
        hp: 100,
        team: 'villains' 
      })),
    };
    this.userSide = userSide;
    this.turn = 1;
    this.actions = [];
    this.current = {
      hero: firstHero,
      villain: firstVillain,
      side: userSide
    };
    this.finished = false;
    this.winner = null;
    this.createdAt = new Date().toISOString();
  }
}
```

### Paso 2: Actualizar el Servicio de Batallas

```javascript
// services/battleService.js
async function createTeamBattle({ heroes, villains, userSide, firstHero, firstVillain }) {
  const id = Date.now();
  const battle = new Battle({ id, heroes, villains, userSide, firstHero, firstVillain });
  await saveBattle(battle);
  return battle;
}

async function teamAttack(battleId, attackerId, defenderId) {
  const battles = await getBattles();
  const battle = battles.find(b => b.id === battleId);
  
  if (!battle || battle.finished) {
    throw new Error('Batalla no encontrada o ya finalizada');
  }

  // Determinar IDs activos
  const activeHero = battle.current.hero;
  const activeVillain = battle.current.villain;
  const userTeam = battle.userSide;

  // Validar que el usuario solo pueda atacar con su personaje activo
  if (userTeam === 'heroes' && battle.current.side === 'heroes') {
    if (attackerId !== activeHero || defenderId !== activeVillain) {
      throw new Error('Solo puedes atacar con tu héroe activo al villano activo');
    }
  } else if (userTeam === 'villains' && battle.current.side === 'villains') {
    if (attackerId !== activeVillain || defenderId !== activeHero) {
      throw new Error('Solo puedes atacar con tu villano activo al héroe activo');
    }
  } else {
    throw new Error('No es el turno de tu equipo');
  }

  // Realizar ataque
  const attacker = findCharacter(battle, attackerId, userTeam);
  const defender = findCharacter(battle, defenderId, userTeam === 'heroes' ? 'villains' : 'heroes');
  
  if (!attacker || attacker.hp === 0) {
    throw new Error('Atacante no válido o muerto');
  }
  
  if (!defender || defender.hp === 0) {
    throw new Error('Defensor no válido o muerto');
  }

  // Lógica de ataque
  const damage = Math.floor(Math.random() * 30) + 5;
  defender.hp = Math.max(0, defender.hp - damage);
  
  // Registrar acción
  battle.actions.push({
    turn: battle.turn,
    attacker: attackerId,
    attackerTeam: userTeam,
    defender: defenderId,
    defenderTeam: userTeam === 'heroes' ? 'villains' : 'heroes',
    damage: damage,
    remainingHP: defender.hp,
    timestamp: new Date().toISOString()
  });

  // Verificar si el defensor murió
  if (defender.hp === 0) {
    const defenderTeam = userTeam === 'heroes' ? 'villains' : 'heroes';
    const nextDefender = battle.teams[defenderTeam].find(p => p.hp > 0);
    
    if (!nextDefender) {
      battle.finished = true;
      battle.winner = userTeam;
    } else {
      battle.current[defenderTeam.slice(0, -1)] = nextDefender.id;
    }
  }

  battle.turn++;
  battle.current.side = battle.current.side === 'heroes' ? 'villains' : 'heroes';
  
  await fs.writeJson(BATTLES_PATH, battles, { spaces: 2 });
  return battle;
}

// Función auxiliar para encontrar personajes
function findCharacter(battle, characterId, team) {
  return battle.teams[team].find(char => char.id === characterId);
}
```

### Paso 3: Actualizar el Controlador

```javascript
// controllers/battleController.js
router.post('/battle/team', async (req, res) => {
  try {
    const { heroes, villains, userSide, firstHero, firstVillain } = req.body;
    
    // Validaciones básicas
    if (!heroes || !villains || !userSide || !firstHero || !firstVillain) {
      return res.status(400).json({ 
        error: 'Faltan parámetros requeridos' 
      });
    }
    
    if (heroes.length !== 3 || villains.length !== 3) {
      return res.status(400).json({ 
        error: 'Deben ser exactamente 3 héroes y 3 villanos' 
      });
    }
    
    const battle = await battleService.createTeamBattle({ 
      heroes, villains, userSide, firstHero, firstVillain 
    });
    
    res.status(201).json(battle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/battle/:id/attack', async (req, res) => {
  try {
    const { id } = req.params;
    const { attacker, defender } = req.body;
    
    if (!attacker || !defender) {
      return res.status(400).json({ 
        error: 'Faltan parámetros attacker y defender' 
      });
    }
    
    const battle = await battleService.teamAttack(Number(id), attacker, defender);
    res.status(200).json(battle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

---

## 🧪 Casos de Prueba

### Caso 1: IDs Repetidos
```javascript
const testCase1 = {
  heroes: [1, 2, 3],
  villains: [2, 3, 4], // IDs 2 y 3 repetidos
  userSide: 'heroes',
  firstHero: 2,
  firstVillain: 3
};
```

### Caso 2: Sin IDs Repetidos
```javascript
const testCase2 = {
  heroes: [1, 2, 3],
  villains: [4, 5, 6], // Sin IDs repetidos
  userSide: 'villains',
  firstHero: 1,
  firstVillain: 4
};
```

### Caso 3: Todos los IDs Repetidos
```javascript
const testCase3 = {
  heroes: [1, 2, 3],
  villains: [1, 2, 3], // Todos los IDs repetidos
  userSide: 'heroes',
  firstHero: 1,
  firstVillain: 1
};
```

---

## ✅ Resultados Esperados

### ✅ Funcionalidades que Deben Funcionar:

1. **Creación de Batallas**: Debe permitir crear batallas con IDs repetidos
2. **Identificación Correcta**: Cada personaje debe identificarse por su contexto (equipo + ID)
3. **Ataques Válidos**: Solo debe permitir ataques entre personajes activos del equipo correcto
4. **Estado Persistente**: Cada batalla debe mantener su estado independiente
5. **Manejo de Errores**: Debe validar y rechazar ataques inválidos

### ❌ Problemas que Deben Resolverse:

1. **Conflictos de IDs**: No debe haber conflictos entre héroes y villanos con mismo ID
2. **Ataques Inválidos**: No debe permitir ataques entre personajes incorrectos
3. **Estado Inconsistente**: No debe perder el estado de la batalla
4. **Errores de Validación**: Debe validar correctamente la existencia de personajes

---

## 📝 Notas Importantes

### Consideraciones de Rendimiento:
- Los IDs únicos basados en timestamp pueden generar colisiones en casos extremos
- Considera usar UUID para mayor seguridad
- El archivo de batallas puede crecer mucho, considera implementar limpieza periódica

### Mejoras Futuras:
- Implementar base de datos para mejor rendimiento
- Añadir índices para búsquedas más rápidas
- Implementar paginación para el historial de batallas
- Añadir autenticación para batallas privadas

### Debugging:
- Usa logs detallados para rastrear el flujo de batallas
- Implementa validaciones adicionales en desarrollo
- Considera añadir tests unitarios para cada caso de uso

---

## 🎯 Conclusión

Esta solución permite que personajes con el mismo ID puedan coexistir en la misma batalla sin conflictos, identificándolos por su contexto (equipo) y aplicando validaciones estrictas para mantener la integridad del juego.

La clave está en:
1. **IDs únicos para batallas**
2. **Identificación por contexto de equipo**
3. **Validaciones estrictas**
4. **Estado persistente por batalla**

Con esta implementación, tu API debería funcionar correctamente incluso con IDs repetidos entre héroes y villanos. 