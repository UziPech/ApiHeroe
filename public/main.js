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

  // Llenar selects y listas para el formulario de batallas (como antes)
  const heroesSelect = document.getElementById('heroes-select');
  const villainsSelect = document.getElementById('villains-select');
  const heroSelectIndividual = document.getElementById('hero-select-individual');
  const villainSelectIndividual = document.getElementById('villain-select-individual');
  if (heroesSelect) heroesSelect.innerHTML = '';
  if (villainsSelect) villainsSelect.innerHTML = '';
  if (heroSelectIndividual) heroSelectIndividual.innerHTML = '';
  if (villainSelectIndividual) villainSelectIndividual.innerHTML = '';
  heroes.forEach(hero => {
    if (heroesSelect) {
      const option = document.createElement('option');
      option.value = hero.id;
      option.textContent = hero.alias || hero.name;
      heroesSelect.appendChild(option);
    }
    if (heroSelectIndividual) {
      const optionInd = document.createElement('option');
      optionInd.value = hero.id;
      optionInd.textContent = hero.alias || hero.name;
      heroSelectIndividual.appendChild(optionInd);
    }
  });
  villains.forEach(villain => {
    if (villainsSelect) {
      const option = document.createElement('option');
      option.value = villain.id;
      option.textContent = villain.alias || villain.name;
      villainsSelect.appendChild(option);
    }
    if (villainSelectIndividual) {
      const optionInd = document.createElement('option');
      optionInd.value = villain.id;
      optionInd.textContent = villain.alias || villain.name;
      villainSelectIndividual.appendChild(optionInd);
    }
  });

  // Renderizar tabs de personajes
  renderPersonajesTabs(heroes, villains);
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
  const resultDiv = document.getElementById('duel-result');
  if (resultDiv) resultDiv.innerHTML = '';
  if (!heroId || !villainId) {
    alert('Selecciona un héroe y un villano.');
    return;
  }
  const res = await fetch(`/api/battle/duel/${heroId}/${villainId}`, {
    method: 'POST'
  });
  if (res.ok) {
    const data = await res.json();
    let msg = `<div style='margin-top:1em;padding:1em;background:#eafbe7;border-radius:8px;border:1px solid #b2e2b2;'>`;
    msg += `<strong>¡Duelo finalizado!</strong><br>`;
    if (data.winner && data.loser) {
      msg += `Ganador: <span style='color:#2a7;font-weight:bold;'>${data.winner.alias || data.winner.name || data.winner.id}</span><br>`;
      msg += `Perdedor: <span style='color:#a22;'>${data.loser.alias || data.loser.name || data.loser.id}</span><br>`;
    } else if (data.winner) {
      msg += `Ganador: <span style='color:#2a7;font-weight:bold;'>${data.winner.alias || data.winner.name || data.winner.id}</span><br>`;
    } else {
      msg += `No se pudo determinar el ganador.`;
    }
    msg += `</div>`;
    if (resultDiv) resultDiv.innerHTML = msg;
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
        // Mantener el detalle abierto y actualizado
        await showBattleDetails(battleId, container);
        // Solo recargar la lista si la batalla terminó
        const battleRes = await fetch(`/api/battle/${battleId}`);
        const battleData = await battleRes.json();
        if (battleData.finished || (battleData.winner && (!battleData.teams || !battleData.teams.heroes || !battleData.teams.villains))) {
          loadBattles();
        }
      } else {
        const error = await res.json().catch(() => ({}));
        alert('Error al atacar: ' + (error.error || res.statusText));
      }
    };
  }
}

// Mostrar batallas finalizadas con tabs
function renderFinalizadasTabs(finishedIndividual, finishedTeam) {
  const tabsDiv = document.getElementById('finalizadas-tabs');
  const contentDiv = document.getElementById('finalizadas-content');
  if (!tabsDiv || !contentDiv) return;
  tabsDiv.innerHTML = '';
  contentDiv.innerHTML = '';
  // Crear botones
  const btnInd = document.createElement('button');
  btnInd.textContent = `Individuales (${finishedIndividual.length})`;
  btnInd.style.marginRight = '1em';
  btnInd.className = 'tab-btn';
  const btnTeam = document.createElement('button');
  btnTeam.textContent = `Por equipos (${finishedTeam.length})`;
  btnTeam.className = 'tab-btn';
  tabsDiv.appendChild(btnInd);
  tabsDiv.appendChild(btnTeam);
  // Renderizar lista de botones
  function renderList(type) {
    contentDiv.innerHTML = '';
    let list = type === 'individual' ? finishedIndividual : finishedTeam;
    if (list.length === 0) {
      contentDiv.innerHTML = '<div style="color:#888;">No hay batallas finalizadas de este tipo.</div>';
      return;
    }
    list.slice().reverse().forEach(battle => {
      const div = document.createElement('div');
      div.className = 'battle';
      let heroes = '-';
      let villains = '-';
      if (type === 'individual') {
        heroes = getAliasById(battle.hero.id || battle.hero, HEROES_CACHE);
        villains = getAliasById(battle.villain.id || battle.villain, VILLAINS_CACHE);
      } else {
        heroes = battle.teams.heroes.map(h => getAliasById(h.id, HEROES_CACHE)).join(', ');
        villains = battle.teams.villains.map(v => getAliasById(v.id, VILLAINS_CACHE)).join(', ');
      }
      div.innerHTML = `<strong>ID:</strong> ${battle.id || '-'}<br>
        <strong>Héroes:</strong> ${heroes}<br>
        <strong>Villanos:</strong> ${villains}<br>`;
      const btn = document.createElement('button');
      btn.textContent = 'Ver detalles';
      btn.style.marginTop = '0.7em';
      btn.onclick = () => {
        // Mostrar detalles al hacer clic
        if (div.querySelector('.battle-details')) {
          div.querySelector('.battle-details').remove();
          return;
        }
        // Ocultar otros detalles abiertos
        contentDiv.querySelectorAll('.battle-details').forEach(el => el.remove());
        // Mostrar detalles
        let detailsDiv = document.createElement('div');
        detailsDiv.className = 'battle-details';
        detailsDiv.style.marginTop = '1em';
        detailsDiv.style.background = '#f8fafc';
        detailsDiv.style.borderRadius = '8px';
        detailsDiv.style.padding = '1em';
        detailsDiv.innerHTML = `<strong>Turno:</strong> ${battle.turn || '-'}<br>
          <strong>Estado:</strong> <span style='color:#a22;'>Finalizada</span><br>
          <strong>Ganador:</strong> ${(battle.winner && battle.winner.alias) ? battle.winner.alias : (battle.winner && battle.winner.name) ? battle.winner.name : (battle.winner || '-')}`;
        div.appendChild(detailsDiv);
        // Mostrar historial de acciones si existen
        if (battle.actions && battle.actions.length > 0) {
          let actionsHtml = '<strong>Acciones:</strong><ul>';
          battle.actions.forEach((a, i) => {
            let desc = `Turno ${a.turn || i+1}: `;
            if (a.attacker && a.defender) {
              const attackerName = getAliasById(a.attacker, HEROES_CACHE.concat(VILLAINS_CACHE));
              const defenderName = getAliasById(a.defender, HEROES_CACHE.concat(VILLAINS_CACHE));
              desc += `${attackerName} atacó a ${defenderName}`;
              if (a.type) desc += ` con un ataque ${a.type}`;
              if (a.damage) desc += `. Daño: ${a.damage}`;
              if (a.remainingHP !== undefined) desc += `. HP restante del defensor: ${a.remainingHP}`;
            } else {
              desc += JSON.stringify(a);
            }
            actionsHtml += `<li>${desc}</li>`;
          });
          actionsHtml += '</ul>';
          detailsDiv.innerHTML += actionsHtml;
        }
      };
      div.appendChild(btn);
      contentDiv.appendChild(div);
    });
  }
  // Eventos
  btnInd.onclick = () => {
    btnInd.className = 'tab-btn active';
    btnTeam.className = 'tab-btn';
    renderList('individual');
  };
  btnTeam.onclick = () => {
    btnInd.className = 'tab-btn';
    btnTeam.className = 'tab-btn active';
    renderList('team');
  };
  // No mostrar ninguna lista por defecto
}

function renderEnCursoTabs(ongoingIndividual, ongoingTeam) {
  const tabsDiv = document.getElementById('en-curso-tabs');
  const contentDiv = document.getElementById('en-curso-content');
  if (!tabsDiv || !contentDiv) return;
  tabsDiv.innerHTML = '';
  contentDiv.innerHTML = '';
  // Crear botones
  const btnInd = document.createElement('button');
  btnInd.textContent = `Individuales (${ongoingIndividual.length})`;
  btnInd.style.marginRight = '1em';
  btnInd.className = 'tab-btn';
  const btnTeam = document.createElement('button');
  btnTeam.textContent = `Por equipos (${ongoingTeam.length})`;
  btnTeam.className = 'tab-btn';
  tabsDiv.appendChild(btnInd);
  tabsDiv.appendChild(btnTeam);
  // Renderizar lista de botones
  function renderList(type) {
    contentDiv.innerHTML = '';
    let list = type === 'individual' ? ongoingIndividual : ongoingTeam;
    if (list.length === 0) {
      contentDiv.innerHTML = '<div style="color:#888;">No hay batallas en curso de este tipo.</div>';
      return;
    }
    list.slice().reverse().forEach(battle => {
      const div = document.createElement('div');
      div.className = 'battle';
      let heroes = '-';
      let villains = '-';
      if (type === 'individual') {
        heroes = getAliasById(battle.hero.id || battle.hero, HEROES_CACHE);
        villains = getAliasById(battle.villain.id || battle.villain, VILLAINS_CACHE);
      } else {
        heroes = battle.teams.heroes.map(h => getAliasById(h.id, HEROES_CACHE)).join(', ');
        villains = battle.teams.villains.map(v => getAliasById(v.id, VILLAINS_CACHE)).join(', ');
      }
      div.innerHTML = `<strong>ID:</strong> ${battle.id || '-'}<br>
        <strong>Héroes:</strong> ${heroes}<br>
        <strong>Villanos:</strong> ${villains}<br>`;
      const btn = document.createElement('button');
      btn.textContent = 'Ver detalles';
      btn.style.marginTop = '0.7em';
      btn.onclick = () => {
        // Mostrar detalles interactivos al hacer clic
        if (div.querySelector('.battle-details')) {
          div.querySelector('.battle-details').remove();
          return;
        }
        // Ocultar otros detalles abiertos
        contentDiv.querySelectorAll('.battle-details').forEach(el => el.remove());
        // Usar el mismo detalle interactivo que en la vista principal
        showBattleDetails(battle.id, div);
      };
      div.appendChild(btn);
      contentDiv.appendChild(div);
    });
  }
  // Eventos
  btnInd.onclick = () => {
    btnInd.className = 'tab-btn active';
    btnTeam.className = 'tab-btn';
    renderList('individual');
  };
  btnTeam.onclick = () => {
    btnInd.className = 'tab-btn';
    btnTeam.className = 'tab-btn active';
    renderList('team');
  };
  // No mostrar ninguna lista por defecto
}

function renderPersonajesTabs(heroes, villains) {
  const tabsDiv = document.getElementById('personajes-tabs');
  const listDiv = document.getElementById('personajes-list');
  const detailDiv = document.getElementById('personaje-detail');
  if (!tabsDiv || !listDiv || !detailDiv) return;
  tabsDiv.innerHTML = '';
  listDiv.innerHTML = '';
  detailDiv.innerHTML = '';
  // Crear botones
  const btnHeroes = document.createElement('button');
  btnHeroes.textContent = `Héroes (${heroes.length})`;
  btnHeroes.style.marginRight = '1em';
  btnHeroes.className = 'tab-btn active';
  const btnVillains = document.createElement('button');
  btnVillains.textContent = `Villanos (${villains.length})`;
  btnVillains.className = 'tab-btn';
  tabsDiv.appendChild(btnHeroes);
  tabsDiv.appendChild(btnVillains);
  // Renderizar lista
  function renderList(type) {
    listDiv.innerHTML = '';
    detailDiv.innerHTML = '';
    let list = type === 'heroes' ? heroes : villains;
    if (list.length === 0) {
      listDiv.innerHTML = '<div style="color:#888;">No hay personajes de este tipo.</div>';
      return;
    }
    const ul = document.createElement('ul');
    list.forEach(personaje => {
      const li = document.createElement('li');
      li.textContent = personaje.alias || personaje.name;
      li.style.cursor = 'pointer';
      li.onclick = () => {
        // Mostrar/ocultar detalles
        if (detailDiv.innerHTML && detailDiv.dataset.id == personaje.id) {
          detailDiv.innerHTML = '';
          detailDiv.dataset.id = '';
          return;
        }
        detailDiv.innerHTML = `<div style='background:#f8fafc;padding:1em;border-radius:8px;margin-top:0.5em;box-shadow:0 1px 6px rgba(60,60,100,0.06);'>
          <strong>Alias:</strong> ${personaje.alias || '-'}<br>
          <strong>Nombre:</strong> ${personaje.name || '-'}<br>
          <strong>Ciudad:</strong> ${personaje.city || '-'}<br>
          <strong>Equipo:</strong> ${personaje.team || '-'}<br>
          <strong>Poder:</strong> ${personaje.power !== undefined ? personaje.power : '-'}
        </div>`;
        detailDiv.dataset.id = personaje.id;
      };
      ul.appendChild(li);
    });
    listDiv.appendChild(ul);
  }
  // Eventos
  btnHeroes.onclick = () => {
    btnHeroes.className = 'tab-btn active';
    btnVillains.className = 'tab-btn';
    renderList('heroes');
  };
  btnVillains.onclick = () => {
    btnHeroes.className = 'tab-btn';
    btnVillains.className = 'tab-btn active';
    renderList('villains');
  };
  // Mostrar héroes por defecto
  renderList('heroes');
}

// Listar batallas
async function loadBattles() {
  const res = await fetch('/api/battles');
  const battles = await res.json();
  // Separar batallas en curso y finalizadas
  const ongoing = battles.filter(b => !b.finished && !b.winner);
  // Subdividir en curso en individuales y equipos
  const ongoingIndividual = ongoing.filter(b => b.hero && b.villain);
  const ongoingTeam = ongoing.filter(b => b.teams && b.teams.heroes && b.teams.villains);
  // Considerar finalizadas las que tienen winner aunque no tengan finished
  const finished = battles.filter(b => b.finished || (b.winner && (!b.teams || !b.teams.heroes || !b.teams.villains)));
  // Subdividir finalizadas en individuales y equipos
  const finishedIndividual = finished.filter(b => b.hero && b.villain);
  const finishedTeam = finished.filter(b => b.teams && b.teams.heroes && b.teams.villains);
  // Mostrar batallas en curso con tabs
  renderEnCursoTabs(ongoingIndividual, ongoingTeam);
  // Mostrar batallas finalizadas con tabs
  renderFinalizadasTabs(finishedIndividual, finishedTeam);
}

document.getElementById('battle-form-individual').addEventListener('submit', createBattleIndividual);
document.getElementById('battle-form-team').addEventListener('submit', createBattleTeam);

// Inicializar
loadHeroesAndVillains();
loadBattles();

// Agregar estilos para los botones de tabs
const style = document.createElement('style');
style.innerHTML = `.tab-btn { padding: 0.5em 1.2em; border: none; border-radius: 6px 6px 0 0; background: #e0e4ea; color: #222; font-weight: 600; cursor: pointer; margin-right: 0.5em; transition: background 0.2s; }
.tab-btn.active { background: #4f8cff; color: #fff; }`;
document.head.appendChild(style); 