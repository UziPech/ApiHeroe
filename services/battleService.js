import fs from 'fs-extra';
import Battle from '../models/battleModel.js';

const HEROES_PATH = './superheroes.json';
const VILLAINS_PATH = './villains.json';
const BATTLES_PATH = './📄 battles.json';

function getHeroes() {
  return fs.readJson(HEROES_PATH);
}

function getVillains() {
  return fs.readJson(VILLAINS_PATH);
}

async function getBattles() {
  try {
    return await fs.readJson(BATTLES_PATH);
  } catch (error) {
    return [];
  }
}

async function saveBattle(battle) {
  const battles = await getBattles();
  battles.push(battle);
  await fs.writeJson(BATTLES_PATH, battles, { spaces: 2 });
}

async function fight(heroId, villainId) {
  const heroes = await getHeroes();
  const villains = await getVillains();

  const hero = heroes.find(h => h.id === heroId);
  const villain = villains.find(v => v.id === villainId);

  if (!hero) {
    throw new Error(`Héroe con ID ${heroId} no encontrado`);
  }

  if (!villain) {
    throw new Error(`Villano con ID ${villainId} no encontrado`);
  }

  if (typeof hero?.power !== 'number' || typeof villain?.power !== 'number') {
    throw new Error('Ambos deben tener un atributo "power" numérico');
  }

  // Lógica de batalla mejorada
  const heroPower = hero.power;
  const villainPower = villain.power;
  
  // Factor de aleatoriedad para hacer las batallas más emocionantes
  const heroRandom = Math.random() * 10;
  const villainRandom = Math.random() * 10;
  
  const heroFinalPower = heroPower + heroRandom;
  const villainFinalPower = villainPower + villainRandom;

  const winner = heroFinalPower >= villainFinalPower ? hero : villain;
  const loser = heroFinalPower >= villainFinalPower ? villain : hero;
  
  const battleResult = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    hero: {
      id: hero.id,
      name: hero.name,
      alias: hero.alias,
      power: heroPower,
      finalPower: Math.round(heroFinalPower * 100) / 100
    },
    villain: {
      id: villain.id,
      name: villain.name,
      alias: villain.alias,
      power: villainPower,
      finalPower: Math.round(villainFinalPower * 100) / 100
    },
    winner: {
      id: winner.id,
      name: winner.name,
      alias: winner.alias,
      power: winner.power,
      finalPower: Math.round((winner === hero ? heroFinalPower : villainFinalPower) * 100) / 100
    },
    loser: {
      id: loser.id,
      name: loser.name,
      alias: loser.alias,
      power: loser.power,
      finalPower: Math.round((loser === hero ? heroFinalPower : villainFinalPower) * 100) / 100
    },
    message: `El ganador es: ${winner.alias} (${winner.name})`,
    powerDifference: Math.abs(heroFinalPower - villainFinalPower).toFixed(2),
    isCloseBattle: Math.abs(heroFinalPower - villainFinalPower) < 5
  };

  // Guardar la batalla en el historial
  await saveBattle(battleResult);

  return battleResult;
}

async function getBattleHistory() {
  return await getBattles();
}

async function getBattleById(battleId) {
  const battles = await getBattles();
  return battles.find(b => b.id === battleId);
}

// NUEVO: Crear batalla por equipos
async function createTeamBattle({ heroes, villains, userSide, firstHero, firstVillain, heroConfig = {}, villainConfig = {} }) {
  const id = Date.now();
  const battle = new Battle({ id, heroes, villains, userSide, firstHero, firstVillain });
  
  // Cargar datos completos de héroes y villanos para obtener nivel y defensa por defecto
  const heroesData = await getHeroes();
  const villainsData = await getVillains();
  
  // Asignar nivel y defensa inicial a cada personaje (usando configuración personalizada o valores por defecto)
  battle.teams.heroes.forEach(hero => {
    const heroData = heroesData.find(h => h.id === hero.id);
    const customConfig = heroConfig[hero.id];
    
    if (customConfig) {
      // Usar configuración personalizada
      hero.level = customConfig.level || 1;
      hero.defense = customConfig.defense || 0;
      hero.maxDefense = customConfig.defense || 0;
    } else if (heroData) {
      // Usar valores por defecto del archivo
      hero.level = heroData.level || 1;
      hero.defense = heroData.defense || 0;
      hero.maxDefense = heroData.defense || 0;
    } else {
      // Valores por defecto
      hero.level = 1;
      hero.defense = 0;
      hero.maxDefense = 0;
    }
  });
  
  battle.teams.villains.forEach(villain => {
    const villainData = villainsData.find(v => v.id === villain.id);
    const customConfig = villainConfig[villain.id];
    
    if (customConfig) {
      // Usar configuración personalizada
      villain.level = customConfig.level || 1;
      villain.defense = customConfig.defense || 0;
      villain.maxDefense = customConfig.defense || 0;
    } else if (villainData) {
      // Usar valores por defecto del archivo
      villain.level = villainData.level || 1;
      villain.defense = villainData.defense || 0;
      villain.maxDefense = villainData.defense || 0;
    } else {
      // Valores por defecto
      villain.level = 1;
      villain.defense = 0;
      villain.maxDefense = 0;
    }
  });
  
  await saveBattle(battle);
  return battle;
}

// NUEVO: Realizar ataque por turnos en batalla por equipos
async function teamAttack(battleId, attackerId, defenderId, attackType = null) {
  const battles = await getBattles();
  const battle = battles.find(b => b.id === battleId);
  if (!battle || battle.finished) throw new Error('Batalla no encontrada o ya finalizada');

  // Determinar IDs activos
  const activeHero = battle.current.hero;
  const activeVillain = battle.current.villain;
  const userTeam = battle.userSide;

  // Validar que el usuario solo pueda atacar con su personaje activo y al rival activo
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

  // Función para actualizar los personajes activos
  function actualizarActivos() {
    battle.current.hero = siguienteVivo('heroes', battle.current.hero);
    battle.current.villain = siguienteVivo('villains', battle.current.villain);
    if (battle.current.heroe !== undefined) delete battle.current.heroe;
  }

  // Función para cambiar al siguiente personaje vivo de un equipo
  function siguienteVivo(equipo, actualId) {
    const vivos = battle.teams[equipo].filter(p => p.hp > 0);
    if (vivos.length === 0) return null;
    
    // Si el personaje actual está muerto, cambiar al primer vivo
    const actual = battle.teams[equipo].find(p => p.id === actualId);
    if (!actual || actual.hp === 0) {
      return vivos[0].id;
    }
    
    // Si el personaje actual está vivo, mantenerlo
    return actualId;
  }

  // Función para realizar un ataque entre los activos
  function realizarAtaque(attackerId, defenderId, attackType = null) {
    let atacante, defensor;
    if (battle.current.side === 'heroes') {
      atacante = battle.teams.heroes.find(h => h.id === attackerId);
      defensor = battle.teams.villains.find(v => v.id === defenderId);
    } else {
      atacante = battle.teams.villains.find(v => v.id === attackerId);
      defensor = battle.teams.heroes.find(h => h.id === defenderId);
    }
    if (!atacante || atacante.hp === 0) return false;
    if (!defensor || defensor.hp === 0) return false;
    
    // Definir tipos de ataques disponibles (los 3 originales)
    const ataques = {
      'basico': { tipo: 'Básico', damage: 5 },
      'especial': { tipo: 'Especial', damage: 30 },
      'critico': { tipo: 'Crítico', damage: 45 }
    };
    
    let golpe;
    if (attackType && ataques[attackType]) {
      // Usuario eligió un ataque específico
      golpe = ataques[attackType];
    } else {
      // Ataque aleatorio para la IA (solo entre los 3 originales)
      const ataquesIA = ['basico', 'especial', 'critico'];
      const ataqueAleatorio = ataquesIA[Math.floor(Math.random() * ataquesIA.length)];
      golpe = ataques[ataqueAleatorio];
    }
    
    // Calcular daño basado en el nivel del atacante
    const nivelMultiplicador = atacante.level || 1;
    const dañoBase = golpe.damage;
    const dañoFinal = dañoBase * nivelMultiplicador;
    
    // Sistema de defensa: primero reducir defensa, luego vida
    let dañoRestante = dañoFinal;
    let defensaReducida = 0;
    let vidaReducida = 0;
    
    // Si hay defensa, reducirla primero
    if (defensor.defense > 0) {
      defensaReducida = Math.min(defensor.defense, dañoRestante);
      defensor.defense = Math.max(0, defensor.defense - defensaReducida);
      dañoRestante -= defensaReducida;
    }
    
    // Si queda daño después de reducir defensa, reducir vida
    if (dañoRestante > 0) {
      vidaReducida = dañoRestante;
      defensor.hp = Math.max(0, defensor.hp - vidaReducida);
    }
    
    // Regenerar un poco de defensa al final del turno (máximo 10% de la defensa máxima)
    if (defensor.maxDefense) {
      const regeneracion = Math.floor(defensor.maxDefense * 0.1);
      defensor.defense = Math.min(defensor.maxDefense, defensor.defense + regeneracion);
    }
    
    battle.actions.push({
      turn: battle.turn,
      attacker: attackerId,
      attackerTeam: battle.current.side,
      defender: defenderId,
      defenderTeam: battle.current.side === 'heroes' ? 'villains' : 'heroes',
      type: golpe.tipo,
      damage: dañoFinal,
      damageToDefense: defensaReducida,
      damageToHP: vidaReducida,
      attackerLevel: atacante.level,
      defenderDefense: defensor.defense,
      remainingHP: defensor.hp,
      timestamp: new Date().toISOString(),
    });
    
    // Verificar si el defensor fue derrotado
    if (defensor.hp === 0) {
      const defenderTeam = battle.current.side === 'heroes' ? 'villains' : 'heroes';
      const next = battle.teams[defenderTeam].find(p => p.hp > 0);
      if (!next) {
        battle.finished = true;
        battle.winner = defenderTeam === 'heroes' ? 'villains' : 'heroes';
        return false; // Termina la batalla
      } else {
        battle.current[defenderTeam.slice(0, -1)] = next.id;
      }
    }
    return true; // Continúa la batalla
  }

  // 1. Ataque del usuario (solo entre activos)
  if (!realizarAtaque(attackerId, defenderId, attackType)) {
    // Actualizar los activos si alguno murió
    actualizarActivos();
    await fs.writeJson(BATTLES_PATH, battles, { spaces: 2 });
    return battle;
  }
  battle.turn++;

  // Actualizar activos después del ataque del usuario
  actualizarActivos();

  // Verificar si el defensor murió después del ataque del usuario
  const defenderTeam = battle.current.side === 'heroes' ? 'villains' : 'heroes';
  const defensor = battle.teams[defenderTeam].find(p => p.id === defenderId);
  
  // Si el defensor murió, terminar el turno sin ataque automático
  if (defensor && defensor.hp === 0) {
    // Verificar si el equipo del defensor tiene más personajes vivos
    const nextDefender = battle.teams[defenderTeam].find(p => p.hp > 0);
    if (!nextDefender) {
      // No hay más personajes vivos en el equipo del defensor
      battle.finished = true;
      battle.winner = battle.current.side;
      await fs.writeJson(BATTLES_PATH, battles, { spaces: 2 });
      return battle;
    } else {
      // Cambiar al siguiente personaje vivo del equipo del defensor
      battle.current[defenderTeam.slice(0, -1)] = nextDefender.id;
      // Alternar turno al equipo del usuario
      battle.current.side = userTeam;
      actualizarActivos();
      await fs.writeJson(BATTLES_PATH, battles, { spaces: 2 });
      return battle;
    }
  }

  // Alternar turno solo si el equipo contrario tiene personajes vivos
  const nextSide = battle.current.side === 'heroes' ? 'villains' : 'heroes';
  const nextActive = battle.teams[nextSide].find(p => p.hp > 0);
  if (nextActive) {
    battle.current.side = nextSide;
    // Actualizar los activos si alguno murió
    actualizarActivos();
  } else {
    // Si no hay personajes vivos en el equipo contrario, termina la batalla
    battle.finished = true;
    battle.winner = battle.current.side;
    await fs.writeJson(BATTLES_PATH, battles, { spaces: 2 });
    return battle;
  }

  // 2. Ataques automáticos del bando contrario (solo entre activos) hasta que vuelva el turno del usuario o termine la batalla
  while (!battle.finished && battle.current.side !== userTeam) {
    const autoAttacker = battle.current.side === 'heroes' ? battle.current.hero : battle.current.villain;
    const autoDefender = battle.current.side === 'heroes' ? battle.current.villain : battle.current.hero;
    if (!realizarAtaque(autoAttacker, autoDefender)) break;
    battle.turn++;
    // Alternar turno solo si el equipo contrario tiene personajes vivos
    const nextAutoSide = battle.current.side === 'heroes' ? 'villains' : 'heroes';
    const nextAutoActive = battle.teams[nextAutoSide].find(p => p.hp > 0);
    if (nextAutoActive) {
      battle.current.side = nextAutoSide;
      actualizarActivos();
    } else {
      battle.finished = true;
      battle.winner = battle.current.side;
      break;
    }
  }

  await fs.writeJson(BATTLES_PATH, battles, { spaces: 2 });
  return battle;
}

// NUEVO: Obtener batalla por ID (con registro completo)
async function getTeamBattleById(battleId) {
  const battles = await getBattles();
  return battles.find(b => b.id === battleId);
}

export default { 
  fight, 
  getBattleHistory, 
  getBattleById, 
  // NUEVO:
  createTeamBattle,
  teamAttack,
  getTeamBattleById,
};
