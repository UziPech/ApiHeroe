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
  // Cargar todas las batallas
  const battles = await getBattles();
  // Buscar la batalla correspondiente
  const battle = battles.find(b => b.id === battleId);
  // Si la batalla no existe o ya terminó, lanzar error
  if (!battle || battle.finished) throw new Error('Batalla no encontrada o ya finalizada');

  // Cargar datos de héroes y villanos para obtener nombres y detalles
  const heroesData = await getHeroes();
  const villainsData = await getVillains();

  // Determinar los IDs activos de héroe y villano
  const activeHero = battle.current.hero;
  const activeVillain = battle.current.villain;
  // Determinar de qué equipo es el usuario
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

  // Función para actualizar los personajes activos de cada equipo
  function actualizarActivos() {
    // Buscar el siguiente héroe vivo
    battle.current.hero = siguienteVivo('heroes', battle.current.hero);
    // Buscar el siguiente villano vivo
    battle.current.villain = siguienteVivo('villains', battle.current.villain);
    // Eliminar campo mal escrito si existe
    if (battle.current.heroe !== undefined) delete battle.current.heroe;
  }

  // Función para encontrar el siguiente personaje vivo de un equipo
  function siguienteVivo(equipo, actualId) {
    // Filtrar personajes vivos
    const vivos = battle.teams[equipo].filter(p => p.hp > 0);
    if (vivos.length === 0) return null;
    // Si el personaje actual está muerto, devolver el primer vivo
    const actual = battle.teams[equipo].find(p => p.id === actualId);
    if (!actual || actual.hp === 0) {
      return vivos[0].id;
    }
    // Si el personaje actual está vivo, mantenerlo
    return actualId;
  }

  // Array para registrar el resultado de ambos ataques (usuario y enemigo)
  const turnResults = [];
  let defeatedInfo = [];
  let winnerInfo = null;

  // Función para realizar un ataque y registrar la acción
  function realizarAtaque(attackerId, defenderId, attackType = null, side) {
    let atacante, defensor;
    let defenderTeamName;
    // Determinar quién ataca y quién defiende según el lado
    if (side === 'heroes') {
      atacante = battle.teams.heroes.find(h => h.id === attackerId);
      defensor = battle.teams.villains.find(v => v.id === defenderId);
      defenderTeamName = 'villains';
    } else {
      atacante = battle.teams.villains.find(v => v.id === attackerId);
      defensor = battle.teams.heroes.find(h => h.id === defenderId);
      defenderTeamName = 'heroes';
    }
    // Si el atacante o defensor está muerto, no hacer nada
    if (!atacante || atacante.hp === 0) return false;
    if (!defensor || defensor.hp === 0) return false;
    // Definir tipos de ataques disponibles
    const ataques = {
      'basico': { tipo: 'Básico', damage: 5 },
      'especial': { tipo: 'Especial', damage: 30 },
      'critico': { tipo: 'Crítico', damage: 45 }
    };
    let golpe;
    if (attackType && ataques[attackType]) {
      // Si el usuario eligió un ataque específico
      golpe = ataques[attackType];
    } else {
      // Si es la IA, elegir ataque aleatorio
      const ataquesIA = ['basico', 'especial', 'critico'];
      const ataqueAleatorio = ataquesIA[Math.floor(Math.random() * ataquesIA.length)];
      golpe = ataques[ataqueAleatorio];
    }
    // Calcular daño según el nivel del atacante
    const nivelMultiplicador = atacante.level || 1;
    const dañoBase = golpe.damage;
    const dañoFinal = dañoBase * nivelMultiplicador;
    // Sistema de defensa: primero reducir defensa, luego vida
    let dañoRestante = dañoFinal;
    let defensaReducida = 0;
    let vidaReducida = 0;
    // Reducir defensa primero
    if (defensor.defense > 0) {
      defensaReducida = Math.min(defensor.defense, dañoRestante);
      defensor.defense = Math.max(0, defensor.defense - defensaReducida);
      dañoRestante -= defensaReducida;
    }
    // Si queda daño, reducir vida
    if (dañoRestante > 0) {
      vidaReducida = dañoRestante;
      defensor.hp = Math.max(0, defensor.hp - vidaReducida);
    }
    // Regenerar defensa al final del turno (si aplica)
    if (defensor.maxDefense) {
      const regeneracion = Math.floor(defensor.maxDefense * 0.1);
      defensor.defense = Math.min(defensor.maxDefense, defensor.defense + regeneracion);
    }
    // Registrar la acción en el historial
    const action = {
      turn: battle.turn,
      attacker: atacante.id,
      attackerTeam: side,
      defender: defensor.id,
      defenderTeam: defenderTeamName,
      type: golpe.tipo,
      damage: dañoFinal,
      damageToDefense: defensaReducida,
      damageToHP: vidaReducida,
      attackerLevel: atacante.level,
      defenderDefense: defensor.defense,
      remainingHP: defensor.hp,
      timestamp: new Date().toISOString(),
    };
    battle.actions.push(action);
    turnResults.push(action);
    // Verificar si el defensor fue derrotado
    if (defensor.hp === 0) {
      // Guardar info del derrotado
      let defeatedData = null;
      if (defenderTeamName === 'heroes') {
        defeatedData = heroesData.find(h => h.id === defensor.id);
      } else {
        defeatedData = villainsData.find(v => v.id === defensor.id);
      }
      defeatedInfo.push({
        id: defensor.id,
        team: defenderTeamName,
        name: defeatedData ? defeatedData.name : undefined,
        alias: defeatedData ? defeatedData.alias : undefined
      });
      const defenderTeam = defenderTeamName;
      // Buscar si hay otro personaje vivo en el equipo defensor
      const next = battle.teams[defenderTeam].find(p => p.hp > 0);
      if (!next) {
        // Si no hay más personajes vivos, la batalla termina
        battle.finished = true;
        battle.winner = defenderTeam === 'heroes' ? 'villains' : 'heroes';
        winnerInfo = battle.winner;
        return false; // Termina la batalla
      } else {
        // Si hay otro personaje, actualizar el activo
        battle.current[defenderTeam.slice(0, -1)] = next.id;
      }
    }
    return true; // Continúa la batalla
  }

  // 1. Ataque del usuario (solo entre activos)
  if (!realizarAtaque(attackerId, defenderId, attackType, battle.current.side)) {
    // Si el defensor murió, actualizar activos y guardar
    actualizarActivos();
    await fs.writeJson(BATTLES_PATH, battles, { spaces: 2 });
    return {
      battle,
      turnResults,
      defeated: defeatedInfo,
      winner: winnerInfo,
      nextTurn: {
        side: battle.current.side,
        hero: battle.current.hero,
        villain: battle.current.villain
      }
    };
  }
  // Incrementar el turno
  battle.turn++;
  // Actualizar activos después del ataque
  actualizarActivos();

  // Si la batalla terminó tras el ataque del usuario
  if (battle.finished) {
    await fs.writeJson(BATTLES_PATH, battles, { spaces: 2 });
    return {
      battle,
      turnResults,
      defeated: defeatedInfo,
      winner: winnerInfo,
      nextTurn: null
    };
  }

  // Cambiar el turno al equipo contrario
  battle.current.side = (userTeam === 'heroes') ? 'villains' : 'heroes';
  actualizarActivos();

  // 2. Ataque automático del enemigo (IA) si sigue vivo
  const enemySide = battle.current.side;
  const autoAttacker = enemySide === 'heroes' ? battle.current.hero : battle.current.villain;
  const autoDefender = enemySide === 'heroes' ? battle.current.villain : battle.current.hero;
  // Solo atacar si ambos están vivos y la batalla no ha terminado
  if (autoAttacker && autoDefender && !battle.finished) {
    realizarAtaque(autoAttacker, autoDefender, null, enemySide);
    battle.turn++;
    actualizarActivos();
  }

  // Si la batalla terminó tras el ataque automático
  if (battle.finished) {
    await fs.writeJson(BATTLES_PATH, battles, { spaces: 2 });
    return {
      battle,
      turnResults,
      defeated: defeatedInfo,
      winner: winnerInfo,
      nextTurn: null
    };
  }

  // Cambiar el turno de vuelta al usuario
  battle.current.side = userTeam;
  actualizarActivos();

  // Guardar el estado actualizado de la batalla
  await fs.writeJson(BATTLES_PATH, battles, { spaces: 2 });
  // Retornar el estado de la batalla, el resultado de ambos ataques, derrotados y el siguiente turno
  return {
    battle,
    turnResults,
    defeated: defeatedInfo,
    winner: winnerInfo,
    nextTurn: {
      side: battle.current.side,
      hero: battle.current.hero,
      villain: battle.current.villain
    }
  };
}

// NUEVO: Obtener batalla por ID (con registro completo)
async function getTeamBattleById(battleId) {
  // Obtener todas las batallas
  const battles = await getBattles();
  // Buscar la batalla por ID
  const battle = battles.find(b => b.id === battleId);
  if (!battle) return null;

  // Obtener datos de héroes y villanos usando funciones asíncronas
  const heroesData = await getHeroes();
  const villainsData = await getVillains();

  // Calcular héroes y villanos vivos y derrotados
  const heroesAlive = (battle.teams.heroes || []).filter(h => h.hp > 0).map(h => h.id);
  const villainsAlive = (battle.teams.villains || []).filter(v => v.hp > 0).map(v => v.id);
  const heroesDefeated = (battle.teams.heroes || []).filter(h => h.hp === 0).map(h => h.id);
  const villainsDefeated = (battle.teams.villains || []).filter(v => v.hp === 0).map(v => v.id);

  // Siguiente en turno (los activos actuales)
  const nextHero = battle.current?.hero || null;
  const nextVillain = battle.current?.villain || null;

  // Obtener datos de los personajes activos para mostrar nombre y alias
  let attacker = null;
  let defender = null;
  let side = battle.current?.side || null;
  if (side === 'heroes') {
    attacker = heroesData.find(h => h.id === nextHero) || null;
    defender = villainsData.find(v => v.id === nextVillain) || null;
  } else if (side === 'villains') {
    attacker = villainsData.find(v => v.id === nextVillain) || null;
    defender = heroesData.find(h => h.id === nextHero) || null;
  }

  const currentTurn = {
    side,
    attacker: attacker ? { id: attacker.id, name: attacker.name, alias: attacker.alias } : null,
    defender: defender ? { id: defender.id, name: defender.name, alias: defender.alias } : null
  };

  // Determinar el ganador o empate
  let winner = battle.winner;
  // Si la batalla terminó pero no hay ganador, verificar si ambos equipos quedaron sin personajes vivos
  if (battle.finished && !winner) {
    if (heroesAlive.length === 0 && villainsAlive.length === 0) {
      winner = 'empate';
    }
  }

  return {
    ...battle,
    heroesAlive,
    villainsAlive,
    heroesDefeated,
    villainsDefeated,
    nextHero,
    nextVillain,
    currentTurn,
    winner // Siempre mostrar el bando ganador o empate si aplica
  };
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
