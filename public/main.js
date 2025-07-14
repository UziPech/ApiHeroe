// Utilidad para obtener alias/nombre por ID SOLO entre los participantes de la batalla
function getAliasById(id, participants) {
  const found = participants.find(x => x.id == id);
  return found ? (found.alias || found.name || found.id) : id;
}

// Cargar héroes y villanos al iniciar
let HEROES_CACHE = [];
let VILLAINS_CACHE = [];
async function loadHeroesAndVillains() {
  const [heroesRes, villainsRes] = await Promise.all([
    fetch('/api/heroes'),
    fetch('/api/villains')
  ]);
  const heroes = await heroesRes.json();
  const villains = await villainsRes.json();
  HEROES_CACHE = heroes;
  VILLAINS_CACHE = villains;

  // Listas para el formulario de equipos
  const heroesList = document.getElementById('heroes-list');
  const villainsList = document.getElementById('villains-list');
  const heroesSelect = document.getElementById('heroes-select');
  const villainsSelect = document.getElementById('villains-select');
  // Selects para el formulario individual
  const heroSelectIndividual = document.getElementById('hero-select-individual');
  const villainSelectIndividual = document.getElementById('villain-select-individual');

  heroesList.innerHTML = '';
  villainsList.innerHTML = '';
  heroesSelect.innerHTML = '';
  villainsSelect.innerHTML = '';
  heroSelectIndividual.innerHTML = '';
  villainSelectIndividual.innerHTML = '';

  heroes.forEach(hero => {
    const li = document.createElement('li');
    li.textContent = hero.alias || hero.name;
    heroesList.appendChild(li);
    const option = document.createElement('option');
    option.value = hero.id;
    option.textContent = hero.alias || hero.name;
    heroesSelect.appendChild(option);
    // Para individual
    const optionInd = document.createElement('option');
    optionInd.value = hero.id;
    optionInd.textContent = hero.alias || hero.name;
    heroSelectIndividual.appendChild(optionInd);
  });
  villains.forEach(villain => {
    const li = document.createElement('li');
    li.textContent = villain.alias || villain.name;
    villainsList.appendChild(li);
    const option = document.createElement('option');
    option.value = villain.id;
    option.textContent = villain.alias || villain.name;
    villainsSelect.appendChild(option);
    // Para individual
    const optionInd = document.createElement('option');
    optionInd.value = villain.id;
    optionInd.textContent = villain.alias || villain.name;
    villainSelectIndividual.appendChild(optionInd);
  });
}

// Cambiar tipo de batalla
const battleType = document.getElementById('battle-type');
battleType.addEventListener('change', function() {
  const type = battleType.value;
  document.getElementById('battle-form-individual').style.display = (type === 'individual') ? 'block' : 'none';
  document.getElementById('battle-form-team').style.display = (type === 'equipo') ? 'block' : 'none';
});

// Crear batalla individual
async function createBattleIndividual(e) {
  e.preventDefault();
  const heroId = document.getElementById('hero-select-individual').value;
  const villainId = document.getElementById('villain-select-individual').value;
  if (!heroId || !villainId) {
    alert('Selecciona un héroe y un villano.');
    return;
  }
  const res = await fetch(`/api/battle/duel/${heroId}/${villainId}`, {
    method: 'POST'
  });
  if (res.ok) {
    alert('¡Duelo creado!');
    loadBattles();
  } else {
    const error = await res.json().catch(() => ({}));
    alert('Error al crear duelo: ' + (error.error || res.statusText));
  }
}

// Crear batalla por equipos
async function createBattleTeam(e) {
  e.preventDefault();
  const heroes = Array.from(document.getElementById('heroes-select').selectedOptions).map(opt => opt.value);
  const villains = Array.from(document.getElementById('villains-select').selectedOptions).map(opt => opt.value);
  const userSide = document.getElementById('user-side').value;
  if (heroes.length === 0 || villains.length === 0) {
    alert('Selecciona al menos un héroe y un villano.');
    return;
  }
  const body = {
    heroes,
    villains,
    userSide,
    firstHero: heroes[0],
    firstVillain: villains[0]
  };
  const res = await fetch('/api/battle/team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    alert('¡Batalla por equipos creada!');
    loadBattles();
  } else {
    const error = await res.json().catch(() => ({}));
    alert('Error al crear batalla por equipos: ' + (error.error || res.statusText));
  }
}

// Mostrar detalles de una batalla
async function showBattleDetails(battleId, container) {
  // Determinar endpoint correcto
  let url = `/api/battles/${battleId}`;
  let res = await fetch(url);
  let battle = await res.json();
  if (!battle || battle.error) {
    url = `/api/battle/${battleId}`;
    res = await fetch(url);
    battle = await res.json();
  }
  // Participantes actuales
  let battleHeroes = [];
  let battleVillains = [];
  if (battle.teams && battle.teams.heroes && battle.teams.villains) {
    battleHeroes = battle.teams.heroes.map(h => {
      const full = HEROES_CACHE.find(x => x.id == h.id) || {};
      return { ...full, ...h };
    });
    battleVillains = battle.teams.villains.map(v => {
      const full = VILLAINS_CACHE.find(x => x.id == v.id) || {};
      return { ...full, ...v };
    });
  }
  // Crear detalles
  let html = '<div style="margin-top:1em;padding:1em;background:#f8fafc;border-radius:8px;">';
  html += `<strong>Turno actual:</strong> ${battle.turn || '-'}<br>`;
  if (battle.teams && battle.teams.heroes && battle.teams.villains) {
    html += '<strong>HP Héroes:</strong><ul>';
    battleHeroes.forEach(h => {
      if (h.hp > 0) {
        html += `<li>${h.alias || h.name || h.id}: ${h.hp} HP</li>`;
      } else {
        html += `<li style='color:#888;text-decoration:line-through;'>${h.alias || h.name || h.id}: 0 HP (derrotado)</li>`;
      }
    });
    html += '</ul>';
    html += '<strong>HP Villanos:</strong><ul>';
    battleVillains.forEach(v => {
      if (v.hp > 0) {
        html += `<li>${v.alias || v.name || v.id}: ${v.hp} HP</li>`;
      } else {
        html += `<li style='color:#888;text-decoration:line-through;'>${v.alias || v.name || v.id}: 0 HP (derrotado)</li>`;
      }
    });
    html += '</ul>';
    // Formulario de ataque solo si la batalla no ha terminado
    if (!battle.finished) {
      // Determinar lado activo y personaje activo
      const activeSide = battle.current?.side;
      const activeHero = battle.current?.hero;
      const activeVillain = battle.current?.villain;
      let attackerId, defenderId, attackerName, defenderName;
      if (activeSide === 'heroes') {
        attackerId = activeHero;
        defenderId = activeVillain;
        attackerName = getAliasById(attackerId, battleHeroes);
        defenderName = getAliasById(defenderId, battleVillains);
      } else {
        attackerId = activeVillain;
        defenderId = activeHero;
        attackerName = getAliasById(attackerId, battleVillains);
        defenderName = getAliasById(defenderId, battleHeroes);
      }
      html += `<div style='margin-bottom:0.5em;'><strong>Atacante actual:</strong> ${attackerName} <br><strong>Defensor actual:</strong> ${defenderName}</div>`;
      html += `<form class="attack-form" data-battle-id="${battleId}" style="margin-top:1em;">
        <input type="hidden" name="attacker" value="${attackerId}">
        <input type="hidden" name="defender" value="${defenderId}">
        <button type="submit">Atacar</button>
      </form>`;
    } else {
      // Batalla finalizada
      let winnerText = '';
      if (battle.winner) {
        if (battle.winner === 'heroes' || battle.winner === 'villains') {
          winnerText = `<div style='margin:1em 0;color:#2a7;font-weight:bold;'>¡Ganó el equipo ${battle.winner === 'heroes' ? 'de Héroes' : 'de Villanos'}!</div>`;
        } else {
          winnerText = `<div style='margin:1em 0;color:#2a7;font-weight:bold;'>¡Ganador: ${battle.winner.alias || battle.winner.name || battle.winner}!</div>`;
        }
      } else {
        winnerText = `<div style='margin:1em 0;color:#a22;font-weight:bold;'>Batalla finalizada</div>`;
      }
      html += winnerText;
    }
  }
  if (battle.actions && battle.actions.length > 0) {
    html += '<strong>Acciones:</strong><ul>';
    battle.actions.forEach((a, i) => {
      // Mostrar acción en texto legible SOLO con participantes de la batalla
      let desc = `Turno ${a.turn || i+1}: `;
      if (a.attacker && a.defender) {
        const attackerName = getAliasById(a.attacker, battleHeroes.concat(battleVillains));
        const defenderName = getAliasById(a.defender, battleHeroes.concat(battleVillains));
        desc += `${attackerName} atacó a ${defenderName}`;
        if (a.type) desc += ` con un ataque ${a.type}`;
        if (a.damage) desc += `. Daño: ${a.damage}`;
        if (a.remainingHP !== undefined) desc += `. HP restante del defensor: ${a.remainingHP}`;
      } else {
        desc += JSON.stringify(a);
      }
      html += `<li>${desc}</li>`;
    });
    html += '</ul>';
  } else {
    html += '<em>No hay acciones registradas.</em>';
  }
  html += '</div>';
  // Mostrar detalles
  let detailsDiv = container.querySelector('.battle-details');
  if (!detailsDiv) {
    detailsDiv = document.createElement('div');
    detailsDiv.className = 'battle-details';
    container.appendChild(detailsDiv);
  }
  detailsDiv.innerHTML = html;

  // Agregar listener al formulario de ataque
  const attackForm = detailsDiv.querySelector('.attack-form');
  if (attackForm) {
    attackForm.onsubmit = async function(e) {
      e.preventDefault();
      const attacker = attackForm.elements['attacker'].value;
      const defender = attackForm.elements['defender'].value;
      if (!attacker || !defender) return;
      const res = await fetch(`/api/battle/${battleId}/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attacker, defender })
      });
      if (res.ok) {
        showBattleDetails(battleId, container);
        loadBattles();
      } else {
        const error = await res.json().catch(() => ({}));
        alert('Error al atacar: ' + (error.error || res.statusText));
      }
    };
  }
}

// Listar batallas
async function loadBattles() {
  const res = await fetch('/api/battles');
  const battles = await res.json();
  const battlesList = document.getElementById('battles-list');
  battlesList.innerHTML = '';
  // Separar batallas en curso y finalizadas
  const ongoing = battles.filter(b => !b.finished);
  const finished = battles.filter(b => b.finished);
  // Mostrar primero la batalla en curso más reciente
  if (ongoing.length > 0) {
    const battle = ongoing[ongoing.length-1];
    const div = document.createElement('div');
    div.className = 'battle';
    let heroes = '-';
    let villains = '-';
    if (battle.teams && battle.teams.heroes && battle.teams.villains) {
      // Mostrar alias en vez de nombre
      heroes = battle.teams.heroes.map(h => getAliasById(h.id, HEROES_CACHE)).join(', ');
      villains = battle.teams.villains.map(v => getAliasById(v.id, VILLAINS_CACHE)).join(', ');
    } else if (battle.hero && battle.villain) {
      heroes = getAliasById(battle.hero.id || battle.hero, HEROES_CACHE);
      villains = getAliasById(battle.villain.id || battle.villain, VILLAINS_CACHE);
    }
    div.innerHTML = `<strong>ID:</strong> ${battle.id || '-'}<br>
      <strong>Héroes:</strong> ${heroes}<br>
      <strong>Villanos:</strong> ${villains}<br>
      <strong>Turno:</strong> ${battle.turn || '-'}<br>
      <strong>Estado:</strong> <span style='color:#2a7;'>En curso</span><br>
      <strong>Ganador:</strong> ${(battle.winner && battle.winner.alias) ? battle.winner.alias : (battle.winner && battle.winner.name) ? battle.winner.name : (battle.winner || '-')}`;
    const btn = document.createElement('button');
    btn.textContent = 'Ver detalles';
    btn.style.marginTop = '0.7em';
    btn.onclick = () => {
      showBattleDetails(battle.id, div);
    };
    div.appendChild(btn);
    battlesList.appendChild(div);
  }
  // Mostrar batallas finalizadas
  if (finished.length > 0) {
    const sep = document.createElement('div');
    sep.innerHTML = '<hr style="margin:2em 0;"> <h2 style="color:#888;font-size:1.1em;">Batallas finalizadas</h2>';
    battlesList.appendChild(sep);
    finished.reverse().forEach(battle => {
      const div = document.createElement('div');
      div.className = 'battle';
      let heroes = '-';
      let villains = '-';
      if (battle.teams && battle.teams.heroes && battle.teams.villains) {
        heroes = battle.teams.heroes.map(h => getAliasById(h.id, HEROES_CACHE)).join(', ');
        villains = battle.teams.villains.map(v => getAliasById(v.id, VILLAINS_CACHE)).join(', ');
      } else if (battle.hero && battle.villain) {
        heroes = getAliasById(battle.hero.id || battle.hero, HEROES_CACHE);
        villains = getAliasById(battle.villain.id || battle.villain, VILLAINS_CACHE);
      }
      div.innerHTML = `<strong>ID:</strong> ${battle.id || '-'}<br>
        <strong>Héroes:</strong> ${heroes}<br>
        <strong>Villanos:</strong> ${villains}<br>
        <strong>Turno:</strong> ${battle.turn || '-'}<br>
        <strong>Estado:</strong> <span style='color:#a22;'>Finalizada</span><br>
        <strong>Ganador:</strong> ${(battle.winner && battle.winner.alias) ? battle.winner.alias : (battle.winner && battle.winner.name) ? battle.winner.name : (battle.winner || '-')}`;
      const btn = document.createElement('button');
      btn.textContent = 'Ver detalles';
      btn.style.marginTop = '0.7em';
      btn.onclick = () => {
        showBattleDetails(battle.id, div);
      };
      div.appendChild(btn);
      battlesList.appendChild(div);
    });
  }
}

document.getElementById('battle-form-individual').addEventListener('submit', createBattleIndividual);
document.getElementById('battle-form-team').addEventListener('submit', createBattleTeam);

// Inicializar
loadHeroesAndVillains();
loadBattles(); 