import Hero from '../models/heroModel.js';
import Villain from '../models/villainModel.js';
import Duel from '../models/duelModel.js';

// Obtener siguiente ID para duelos
async function getNextDuelId() {
  const lastDuel = await Duel.findOne().sort({ id: -1 });
  return lastDuel ? lastDuel.id + 1 : 1;
}

// Crear duelo 1v1 con ganador aleatorio
async function createRandomDuel(heroId, villainId, userId) {
  // Buscar héroe y villano por ID numérico
  const hero = await Hero.findOne({ id: heroId });
  const villain = await Villain.findOne({ id: villainId });

  if (!hero) {
    throw new Error(`Héroe con ID ${heroId} no encontrado`);
  }

  if (!villain) {
    throw new Error(`Villano con ID ${villainId} no encontrado`);
  }

  // Factor aleatorio para decidir el ganador (0.0 - 1.0)
  const randomFactor = Math.random();
  
  // 50% probabilidad para cada uno
  const heroWins = randomFactor >= 0.5;
  
  let winner, loser, winnerType, loserType;
  
  if (heroWins) {
    winner = hero;
    loser = villain;
    winnerType = 'hero';
    loserType = 'villain';
  } else {
    winner = villain;
    loser = hero;
    winnerType = 'villain';
    loserType = 'hero';
  }

  const duelId = await getNextDuelId();

  // Crear registro de duelo
  const duelResult = {
    id: duelId,
    userId: userId,
    heroId: hero.id,
    villainId: villain.id,
    heroName: hero.name,
    heroAlias: hero.alias,
    villainName: villain.name,
    villainAlias: villain.alias,
    winnerId: winner.id,
    winnerType: winnerType,
    winnerName: winner.name,
    winnerAlias: winner.alias,
    loserId: loser.id,
    loserType: loserType,
    loserName: loser.name,
    loserAlias: loser.alias,
    randomFactor: Math.round(randomFactor * 1000) / 1000, // 3 decimales
    message: `¡${winner.alias} (${winner.name}) ganó el duelo contra ${loser.alias} (${loser.name})!`,
    timestamp: new Date()
  };

  // Guardar en MongoDB
  const newDuel = new Duel(duelResult);
  await newDuel.save();

  return duelResult;
}

// Obtener historial de duelos de un usuario
async function getDuelHistory(userId) {
  return await Duel.find({ userId }).sort({ timestamp: -1 });
}

// Obtener duelo específico de un usuario
async function getDuelById(duelId, userId) {
  return await Duel.findOne({ id: duelId, userId });
}

// Obtener estadísticas de duelos de un usuario
async function getDuelStats(userId) {
  const duels = await Duel.find({ userId });
  
  const heroWins = duels.filter(d => d.winnerType === 'hero').length;
  const villainWins = duels.filter(d => d.winnerType === 'villain').length;
  const totalDuels = duels.length;
  
  return {
    totalDuels,
    heroWins,
    villainWins,
    heroWinRate: totalDuels > 0 ? Math.round((heroWins / totalDuels) * 100) : 0,
    villainWinRate: totalDuels > 0 ? Math.round((villainWins / totalDuels) * 100) : 0
  };
}

export default {
  createRandomDuel,
  getDuelHistory,
  getDuelById,
  getDuelStats
};
