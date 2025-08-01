import Battle from '../models/battleModel.js';
import Hero from '../models/heroModel.js';
import Villain from '../models/villainModel.js';

// Función para obtener héroes desde MongoDB
async function getHeroes() {
  return await Hero.find();
}

// Función para obtener villanos desde MongoDB
async function getVillains() {
  return await Villain.find();
}

// Función para obtener héroe por ID desde MongoDB
async function getHeroById(id) {
  return await Hero.findOne({ id: parseInt(id) });
}

// Función para obtener villano por ID desde MongoDB
async function getVillainById(id) {
  return await Villain.findOne({ id: parseInt(id) });
}

// Función para obtener batallas desde MongoDB (con filtro por userId si se proporciona)
async function getBattles(userId = null) {
  try {
    if (userId) {
      return await Battle.find({ userId });
    }
    return await Battle.find();
  } catch (error) {
    return [];
  }
}

// Función para guardar batalla en MongoDB
async function saveBattle(battle) {
  const newBattle = new Battle(battle);
  await newBattle.save();
  return newBattle;
}



async function getBattleHistory(userId = null) {
  return await getBattles(userId);
}

async function getBattleById(battleId, userId = null) {
  let battle;
  if (userId) {
    battle = await Battle.findOne({ id: battleId, userId });
  } else {
    battle = await Battle.findOne({ id: battleId });
  }
  
  if (battle && !battle.finished) {
    // Verificar y actualizar personajes activos si están muertos
    let needsUpdate = false;
    
    // Verificar héroe activo
    if (battle.current?.hero) {
      const activeHero = battle.teams.heroes.find(h => h.id === battle.current.hero);
      if (!activeHero || activeHero.hp <= 0) {
        const aliveHeroes = battle.teams.heroes.filter(h => h.hp > 0);
        if (aliveHeroes.length > 0) {
          battle.current.hero = aliveHeroes[0].id;
          needsUpdate = true;
        }
      }
    }
    
    // Verificar villano activo
    if (battle.current?.villain) {
      const activeVillain = battle.teams.villains.find(v => v.id === battle.current.villain);
      if (!activeVillain || activeVillain.hp <= 0) {
        const aliveVillains = battle.teams.villains.filter(v => v.hp > 0);
        if (aliveVillains.length > 0) {
          battle.current.villain = aliveVillains[0].id;
          needsUpdate = true;
        }
      }
    }
    
    // Guardar si hubo cambios
    if (needsUpdate) {
      await battle.save();
    }
  }
  
  return battle;
}

// NUEVO: Crear batalla por equipos (usa id numérico y guarda correctamente en MongoDB)
async function createTeamBattle({ heroes, villains, userSide, firstHero, firstVillain, heroConfig = {}, villainConfig = {} }, userId = null) {
  // Forzar que los IDs sean numéricos
  const heroIds = heroes.map(id => Number(id));
  const villainIds = villains.map(id => Number(id));

  const id = Date.now();
  // Buscar los héroes y villanos por id numérico
  const heroesData = await Hero.find({ id: { $in: heroIds } });
  const villainsData = await Villain.find({ id: { $in: villainIds } });

  // Inicializar los equipos con los datos completos y hp
  const teams = {
    heroes: heroesData.map(hero => ({
      id: hero.id,
      name: hero.name,
      alias: hero.alias,
      power: hero.power,
      level: heroConfig[hero.id]?.level || 1,
      defense: heroConfig[hero.id]?.defense || 30,
      maxDefense: heroConfig[hero.id]?.defense || 30,
      hp: 100 // Inicializar vida
    })),
    villains: villainsData.map(villain => ({
      id: villain.id,
      name: villain.name,
      alias: villain.alias,
      power: villain.power,
      level: villainConfig[villain.id]?.level || 1,
      defense: villainConfig[villain.id]?.defense || 30,
      maxDefense: villainConfig[villain.id]?.defense || 30,
      hp: 100 // Inicializar vida
    }))
  };

  // Inicializar el estado de turno actual
  const current = {
    side: userSide,         // El usuario que inicia
    hero: Number(firstHero),        // Primer héroe activo
    villain: Number(firstVillain)   // Primer villano activo
  };

  // Guardar como objeto plano
  const battleData = {
    id,
    userId: userId, // Asociar batalla al usuario
    teams,
    userSide,
    firstHero: Number(firstHero),
    firstVillain: Number(firstVillain),
    current,
    defeated: [],
    nextTurn: null,
    actions: [],
    finished: false,
    winner: null
  };
  await saveBattle(battleData);
  // Devuelve el documento guardado
  return await Battle.findOne({ id, userId });
}

// NUEVO: Obtener batalla por ID (con registro completo)
async function getTeamBattleById(battleId) {
  const battle = await Battle.findOne({ id: battleId });
  
  if (battle && !battle.finished) {
    // Verificar y actualizar personajes activos si están muertos
    let needsUpdate = false;
    
    // Verificar héroe activo
    if (battle.current?.hero) {
      const activeHero = battle.teams.heroes.find(h => h.id === battle.current.hero);
      if (!activeHero || activeHero.hp <= 0) {
        const aliveHeroes = battle.teams.heroes.filter(h => h.hp > 0);
        if (aliveHeroes.length > 0) {
          battle.current.hero = aliveHeroes[0].id;
          needsUpdate = true;
        }
      }
    }
    
    // Verificar villano activo
    if (battle.current?.villain) {
      const activeVillain = battle.teams.villains.find(v => v.id === battle.current.villain);
      if (!activeVillain || activeVillain.hp <= 0) {
        const aliveVillains = battle.teams.villains.filter(v => v.hp > 0);
        if (aliveVillains.length > 0) {
          battle.current.villain = aliveVillains[0].id;
          needsUpdate = true;
        }
      }
    }
    
    // Guardar si hubo cambios
    if (needsUpdate) {
      await battle.save();
    }
  }
  
  return battle;
}

// Función para realizar un ataque en una batalla existente
async function performAttack(battleId, attackerId, attackType) {
  const battle = await Battle.findOne({ id: battleId });
  if (!battle) {
    throw new Error(`Batalla con ID ${battleId} no encontrada`);
  }

  if (battle.finished) {
    throw new Error('La batalla ya ha terminado.');
  }

  // PASO 1: ACTUALIZAR PERSONAJES ACTIVOS ANTES DE VALIDAR
  let needsUpdate = false;
  
  // Verificar héroe activo
  if (battle.current?.hero) {
    const activeHero = battle.teams.heroes.find(h => h.id === battle.current.hero);
    if (!activeHero || activeHero.hp <= 0) {
      const aliveHeroes = battle.teams.heroes.filter(h => h.hp > 0);
      if (aliveHeroes.length > 0) {
        battle.current.hero = aliveHeroes[0].id;
        needsUpdate = true;
      }
    }
  }
  
  // Verificar villano activo
  if (battle.current?.villain) {
    const activeVillain = battle.teams.villains.find(v => v.id === battle.current.villain);
    if (!activeVillain || activeVillain.hp <= 0) {
      const aliveVillains = battle.teams.villains.filter(v => v.hp > 0);
      if (aliveVillains.length > 0) {
        battle.current.villain = aliveVillains[0].id;
        needsUpdate = true;
      }
    }
  }
  
  // Guardar cambios si se actualizaron personajes activos
  if (needsUpdate) {
    await battle.save();
  }

  // PASO 2: VALIDACIÓN DESPUÉS DE ACTUALIZAR
  const currentSide = battle.current.side;
  const activeCharacterId = currentSide === 'heroes' ? battle.current.hero : battle.current.villain;
  
  // Validar que el atacante sea el personaje correcto del turno
  if (attackerId !== activeCharacterId) {
    throw new Error(`Turno incorrecto. Es el turno del personaje con ID ${activeCharacterId} del equipo ${currentSide}.`);
  }

  // PASO 2: Obtener equipos y verificar que el atacante esté vivo
  const attackerTeamName = currentSide === 'heroes' ? 'heroes' : 'villains';
  const defenderTeamName = currentSide === 'heroes' ? 'villains' : 'heroes';

  const attackerTeam = battle.teams[attackerTeamName];
  const defenderTeam = battle.teams[defenderTeamName];

  const attacker = attackerTeam.find(member => member.id === attackerId);
  
  // Verificar que el atacante exista y esté vivo
  if (!attacker) {
    throw new Error(`El atacante con ID ${attackerId} no existe en el equipo ${attackerTeamName}.`);
  }
  
  if (attacker.hp <= 0) {
    throw new Error(`El atacante ${attacker.alias} (ID: ${attackerId}) ya ha sido derrotado y no puede atacar.`);
  }

  // PASO 3: Verificar que haya defensores vivos y obtener el defensor correcto
  const activeDefenderId = currentSide === 'heroes' ? battle.current.villain : battle.current.hero;
  const defender = defenderTeam.find(member => member.id === activeDefenderId);
  
  if (!defender || defender.hp <= 0) {
    // Si el defensor activo está muerto, buscar el primer defensor vivo
    const aliveDefender = defenderTeam.find(member => member.hp > 0);
    if (!aliveDefender) {
      // Victoria automática si no hay defensores
      battle.finished = true;
      battle.winner = currentSide;
      battle.nextTurn = null;
      await battle.save();
      return {
        current: battle.current,
        nextTurn: battle.nextTurn,
        defeated: battle.defeated,
        actions: battle.actions,
        winner: battle.winner,
        finished: battle.finished,
        teams: battle.teams
      };
    }
    
    // Actualizar el defensor activo
    if (currentSide === 'heroes') {
      battle.current.villain = aliveDefender.id;
    } else {
      battle.current.hero = aliveDefender.id;
    }
  }
  
  // Obtener el defensor final (actualizado si era necesario)
  const finalDefender = defenderTeam.find(member => member.id === (currentSide === 'heroes' ? battle.current.villain : battle.current.hero));

  // PASO 4: Calcular daño con sistema de escudo (defensa protege la vida)
  const hpBeforeAttack = finalDefender.hp;
  const defenseBeforeAttack = finalDefender.defense || 0;
  
  // Calcular daño base del atacante (con mínimo de 1)
  const baseDamage = Math.max(1, attacker.power || 0);
  
  // Sistema de escudo: primero reduce defensa, luego vida
  let remainingDamage = baseDamage;
  let damageToDefense = 0;
  let damageToHp = 0;
  
  // Primero atacar la defensa (escudo)
  if (finalDefender.defense > 0 && remainingDamage > 0) {
    damageToDefense = Math.min(finalDefender.defense, remainingDamage);
    finalDefender.defense = Math.max(0, finalDefender.defense - damageToDefense);
    remainingDamage -= damageToDefense;
  }
  
  // Si queda daño, atacar la vida
  if (remainingDamage > 0) {
    damageToHp = remainingDamage;
    finalDefender.hp = Math.max(0, finalDefender.hp - damageToHp);
  }
  
  const totalDamage = damageToDefense + damageToHp;
  
  // IMPORTANTE: Marcar el documento como modificado para que MongoDB persista los cambios
  battle.markModified('teams');
  
  // Debug log para verificar el daño
  console.log(`🎯 DAMAGE APPLIED:`, {
    attacker: attacker.alias,
    defender: finalDefender.alias,
    attackType,
    baseDamage,
    hpBefore: hpBeforeAttack,
    hpAfter: finalDefender.hp,
    defenseeBefore: defenseBeforeAttack,
    defenseAfter: finalDefender.defense,
    totalDamage,
    damageToDefense,
    damageToHp
  });

  // PASO 5: Registrar acción con más detalles (sistema de escudo)
  if (!battle.actions) battle.actions = [];
  battle.actions.push({
    attacker: attackerId,
    attackerName: attacker.alias,
    attackerTeam: attackerTeamName,
    defender: finalDefender.id,
    defenderName: finalDefender.alias,
    defenderTeam: defenderTeamName,
    attackType,
    totalDamage,
    damageToDefense,
    damageToHp,
    defenderHpBefore: hpBeforeAttack,
    defenderHpAfter: finalDefender.hp,
    defenderDefenseBefore: defenseBeforeAttack,
    defenderDefenseAfter: finalDefender.defense,
    isDefeated: finalDefender.hp <= 0
  });

  // PASO 6: Actualizar estado si el defensor es derrotado
  if (finalDefender.hp <= 0) {
    if (!battle.defeated) battle.defeated = [];
    battle.defeated.push({
      id: finalDefender.id,
      name: finalDefender.name,
      alias: finalDefender.alias,
      team: defenderTeamName
    });

    // Actualizar el personaje activo inmediatamente si murió
    if (defenderTeamName === 'villains') {
      // Si murió un villano, actualizar el villano activo
      const aliveVillains = battle.teams.villains.filter(v => v.hp > 0);
      if (aliveVillains.length > 0) {
        battle.current.villain = aliveVillains[0].id;
        battle.markModified('current');
      }
    } else if (defenderTeamName === 'heroes') {
      // Si murió un héroe, actualizar el héroe activo
      const aliveHeroes = battle.teams.heroes.filter(h => h.hp > 0);
      if (aliveHeroes.length > 0) {
        battle.current.hero = aliveHeroes[0].id;
        battle.markModified('current');
      }
    }
  }

  // PASO 7: Determinar el siguiente turno y contraataque
  const nextAttackerTeam = battle.teams[defenderTeamName].filter(m => m.hp > 0);
  const nextDefenderTeam = battle.teams[attackerTeamName].filter(m => m.hp > 0);

  // DETECTAR EMPATE: Si ambos equipos no tienen personajes vivos
  if (nextAttackerTeam.length === 0 && nextDefenderTeam.length === 0) {
    battle.finished = true;
    battle.winner = 'empate';
    battle.nextTurn = null;
  } else if (nextAttackerTeam.length === 0) {
    battle.finished = true;
    battle.winner = attackerTeamName;
    battle.nextTurn = null;
  } else if (nextDefenderTeam.length === 0) {
    battle.finished = true;
    battle.winner = defenderTeamName;
    battle.nextTurn = null;
  } else {
    // PASO 8: CONTRAATAQUE AUTOMÁTICO DE LA IA
    // Si el turno era del jugador (heroes), ahora la IA (villains) contraataca automáticamente
    if (currentSide === 'heroes' && nextAttackerTeam.length > 0 && nextDefenderTeam.length > 0) {
      // Obtener el villano activo (no solo el primero)
      const activeVillainId = battle.current.villain;
      let aiAttacker = nextAttackerTeam.find(v => v.id === activeVillainId);
      if (!aiAttacker || aiAttacker.hp <= 0) {
        aiAttacker = nextAttackerTeam[0]; // Fallback al primer villano vivo
      }
      
      // Obtener el héroe activo (no solo el primero)
      const activeHeroId = battle.current.hero;
      let playerDefender = nextDefenderTeam.find(h => h.id === activeHeroId);
      if (!playerDefender || playerDefender.hp <= 0) {
        playerDefender = nextDefenderTeam[0]; // Fallback al primer héroe vivo
      }
      
      // IA elige ataque aleatorio
      const aiAttackTypes = ['basico', 'critico', 'especial'];
      const aiAttackType = aiAttackTypes[Math.floor(Math.random() * aiAttackTypes.length)];
      
      // Calcular daño del contraataque de la IA con sistema de escudo
      const aiHpBeforeAttack = playerDefender.hp;
      const aiDefenseBeforeAttack = playerDefender.defense || 0;
      
      // Calcular daño base del atacante IA (con mínimo de 1)
      const aiBaseDamage = Math.max(1, aiAttacker.power || 0);
      
      // Sistema de escudo: primero reduce defensa, luego vida
      let aiRemainingDamage = aiBaseDamage;
      let aiDamageToDefense = 0;
      let aiDamageToHp = 0;
      
      // Primero atacar la defensa (escudo)
      if (playerDefender.defense > 0 && aiRemainingDamage > 0) {
        aiDamageToDefense = Math.min(playerDefender.defense, aiRemainingDamage);
        playerDefender.defense = Math.max(0, playerDefender.defense - aiDamageToDefense);
        aiRemainingDamage -= aiDamageToDefense;
      }
      
      // Si queda daño, atacar la vida
      if (aiRemainingDamage > 0) {
        aiDamageToHp = aiRemainingDamage;
        playerDefender.hp = Math.max(0, playerDefender.hp - aiDamageToHp);
      }
      
      const aiTotalDamage = aiDamageToDefense + aiDamageToHp;
      
      // IMPORTANTE: Marcar como modificado para persistir cambios
      battle.markModified('teams');

      // Registrar contraataque de la IA (sistema de escudo)
      battle.actions.push({
        attacker: aiAttacker.id,
        attackerName: aiAttacker.alias,
        attackerTeam: 'villains',
        defender: playerDefender.id,
        defenderName: playerDefender.alias,
        defenderTeam: 'heroes',
        attackType: aiAttackType,
        totalDamage: aiTotalDamage,
        damageToDefense: aiDamageToDefense,
        damageToHp: aiDamageToHp,
        defenderHpBefore: aiHpBeforeAttack,
        defenderHpAfter: playerDefender.hp,
        defenderDefenseBefore: aiDefenseBeforeAttack,
        defenderDefenseAfter: playerDefender.defense,
        isDefeated: playerDefender.hp <= 0
      });

      // Si el héroe fue derrotado por la IA
      if (playerDefender.hp <= 0) {
        if (!battle.defeated) battle.defeated = [];
        battle.defeated.push({
          id: playerDefender.id,
          name: playerDefender.name,
          alias: playerDefender.alias,
          team: 'heroes'
        });
        
        // Actualizar héroe activo si murió
        const aliveHeroes = battle.teams.heroes.filter(h => h.hp > 0);
        if (aliveHeroes.length > 0) {
          battle.current.hero = aliveHeroes[0].id;
          battle.markModified('current');
        }
      }
    }

    // PASO 9: Actualizar el siguiente turno (siempre vuelve al jugador después del contraataque)
    const finalNextAttackerTeam = battle.teams['heroes'].filter(m => m.hp > 0);
    const finalNextDefenderTeam = battle.teams['villains'].filter(m => m.hp > 0);
    
    // DETECTAR EMPATE: Si después del contraataque ambos equipos no tienen personajes vivos
    if (finalNextAttackerTeam.length === 0 && finalNextDefenderTeam.length === 0) {
      battle.finished = true;
      battle.winner = 'empate';
      battle.nextTurn = null;
    } else if (finalNextAttackerTeam.length === 0) {
      battle.finished = true;
      battle.winner = 'villains';
      battle.nextTurn = null;
    } else if (finalNextDefenderTeam.length === 0) {
      battle.finished = true;
      battle.winner = 'heroes';
      battle.nextTurn = null;
    } else {
      // Determinar el siguiente héroe activo
      let nextActiveHero = finalNextAttackerTeam.find(h => h.id === battle.current.hero);
      if (!nextActiveHero || nextActiveHero.hp <= 0) {
        // Si el héroe actual está muerto, usar el primer héroe vivo
        nextActiveHero = finalNextAttackerTeam[0];
      }
      
      // Determinar el siguiente villano activo  
      let nextActiveVillain = finalNextDefenderTeam.find(v => v.id === battle.current.villain);
      if (!nextActiveVillain || nextActiveVillain.hp <= 0) {
        // Si el villano actual está muerto, usar el primer villano vivo
        nextActiveVillain = finalNextDefenderTeam[0];
      }
      
      battle.current.side = 'heroes'; // El turno vuelve al jugador
      battle.current.hero = nextActiveHero.id;
      battle.current.villain = nextActiveVillain.id;

      battle.nextTurn = {
        attacker: {
          id: nextActiveHero.id,
          team: 'heroes',
          name: nextActiveHero.name,
          alias: nextActiveHero.alias
        },
        defender: {
          id: nextActiveVillain.id,
          team: 'villains',
          name: nextActiveVillain.name,
          alias: nextActiveVillain.alias
        }
      };
    }
  }

  await battle.save();
  
  return {
    current: battle.current,
    nextTurn: battle.nextTurn,
    defeated: battle.defeated,
    actions: battle.actions,
    winner: battle.winner || null,
    finished: battle.finished,
    teams: battle.teams
  };
}

export default { 
  getBattleHistory, 
  getBattleById, 
  createTeamBattle,
  performAttack,
  getTeamBattleById,
};
