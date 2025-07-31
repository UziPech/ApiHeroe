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
  if (userId) {
    return await Battle.findOne({ id: battleId, userId });
  }
  return await Battle.findOne({ id: battleId });
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
      defense: heroConfig[hero.id]?.defense || 0,
      maxDefense: heroConfig[hero.id]?.defense || 0,
      hp: 100 // Inicializar vida
    })),
    villains: villainsData.map(villain => ({
      id: villain.id,
      name: villain.name,
      alias: villain.alias,
      power: villain.power,
      level: villainConfig[villain.id]?.level || 1,
      defense: villainConfig[villain.id]?.defense || 0,
      maxDefense: villainConfig[villain.id]?.defense || 0,
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
  return await Battle.findOne({ id: battleId });
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

  // ACTUALIZAR PERSONAJES ACTIVOS ANTES DE VALIDAR (importante!)
  const aliveHeroes = battle.teams.heroes.filter(h => h.hp > 0);
  const aliveVillains = battle.teams.villains.filter(v => v.hp > 0);
  
  // Asegurar que el héroe activo esté vivo
  const currentHero = battle.teams.heroes.find(h => h.id === battle.current.hero);
  if (!currentHero || currentHero.hp <= 0) {
    if (aliveHeroes.length > 0) {
      battle.current.hero = aliveHeroes[0].id;
    }
  }
  
  // Asegurar que el villano activo esté vivo
  const currentVillain = battle.teams.villains.find(v => v.id === battle.current.villain);
  if (!currentVillain || currentVillain.hp <= 0) {
    if (aliveVillains.length > 0) {
      battle.current.villain = aliveVillains[0].id;
    }
  }

  const currentSide = battle.current.side;
  const attackerTeamName = currentSide === 'heroes' ? 'heroes' : 'villains';
  const defenderTeamName = currentSide === 'heroes' ? 'villains' : 'heroes';

  const attackerTeam = battle.teams[attackerTeamName];
  const defenderTeam = battle.teams[defenderTeamName];

  const attacker = attackerTeam.find(member => member.id === attackerId);
  
  // Verificar que el atacante sea el personaje correcto según el turno actual
  const activeCharacterId = currentSide === 'heroes' ? battle.current.hero : battle.current.villain;
  
  if (!attacker || attacker.id !== activeCharacterId) {
    throw new Error(`Turno incorrecto. Es el turno del personaje con ID ${activeCharacterId} del equipo ${currentSide}.`);
  }
  
  if (attacker.hp <= 0) {
    throw new Error(`El atacante ${attacker.alias} (ID: ${attackerId}) ya ha sido derrotado.`);
  }

  const defender = defenderTeam.find(member => member.hp > 0);
  if (!defender) {
    battle.finished = true;
    battle.nextTurn = null;
    battle.winner = currentSide;
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

  // Calcular daño y actualizar HP
  const hpBeforeAttack = defender.hp;
  const damage = Math.max(0, (attacker.power || 0) - (defender.defense || 0));
  const newHp = Math.max(0, defender.hp - damage);
  defender.hp = newHp;
  


  // Registrar acción con más detalles
  if (!battle.actions) battle.actions = [];
  battle.actions.push({
    attacker: attackerId,
    attackerName: attacker.alias,
    attackerTeam: attackerTeamName,
    defender: defender.id,
    defenderName: defender.alias,
    defenderTeam: defenderTeamName,
    attackType,
    damage,
    defenderHpBefore: hpBeforeAttack,
    defenderHpAfter: newHp,
    isDefeated: newHp <= 0
  });

  // Actualizar estado si el defensor es derrotado
  if (defender.hp <= 0) {
    if (!battle.defeated) battle.defeated = [];
    battle.defeated.push({
      id: defender.id,
      name: defender.name,
      alias: defender.alias,
      team: defenderTeamName
    });

    // NO actualizar el personaje activo inmediatamente
    // Se actualizará cuando cambie el turno
  }

  // Determinar el siguiente turno
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
    // CONTRAATAQUE AUTOMÁTICO DE LA IA
    // Si el turno era del jugador (heroes), ahora la IA (villains) contraataca automáticamente
    if (currentSide === 'heroes' && nextAttackerTeam.length > 0 && nextDefenderTeam.length > 0) {
      const aiAttacker = nextAttackerTeam[0]; // Primer villano vivo
      const playerDefender = nextDefenderTeam[0]; // Primer héroe vivo
      
      // IA elige ataque aleatorio
      const aiAttackTypes = ['basico', 'critico', 'especial'];
      const aiAttackType = aiAttackTypes[Math.floor(Math.random() * aiAttackTypes.length)];
      
      // Calcular daño del contraataque de la IA
      const aiHpBeforeAttack = playerDefender.hp;
      const aiDamage = Math.max(0, (aiAttacker.power || 0) - (playerDefender.defense || 0));
      const aiNewHp = Math.max(0, playerDefender.hp - aiDamage);
      playerDefender.hp = aiNewHp;

      // Registrar contraataque de la IA
      battle.actions.push({
        attacker: aiAttacker.id,
        attackerName: aiAttacker.alias,
        attackerTeam: 'villains',
        defender: playerDefender.id,
        defenderName: playerDefender.alias,
        defenderTeam: 'heroes',
        attackType: aiAttackType,
        damage: aiDamage,
        defenderHpBefore: aiHpBeforeAttack,
        defenderHpAfter: aiNewHp,
        isDefeated: aiNewHp <= 0
      });

      // Si el héroe fue derrotado por la IA
      if (aiNewHp <= 0) {
        if (!battle.defeated) battle.defeated = [];
        battle.defeated.push({
          id: playerDefender.id,
          name: playerDefender.name,
          alias: playerDefender.alias,
          team: 'heroes'
        });
      }
    }

    // Actualizar el siguiente turno (siempre vuelve al jugador después del contraataque)
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
