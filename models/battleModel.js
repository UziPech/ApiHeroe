// models/battleModel.js
export default class Battle {
  constructor({ id, heroes, villains, userSide, firstHero, firstVillain }) {
    this.id = id;
    this.teams = {
      heroes: heroes.map(heroId => ({ id: heroId, hp: 100 })),
      villains: villains.map(villainId => ({ id: villainId, hp: 100 })),
    };
    this.userSide = userSide; // 'heroes' o 'villains'
    this.turn = 1;
    this.actions = [];
    this.current = {
      hero: firstHero,
      villain: firstVillain,
      side: userSide, // El primer turno es del equipo que el usuario elija
    };
    this.finished = false;
    this.winner = null;
    this.createdAt = new Date().toISOString();
  }
}
