// Servicio de lógica de negocio para héroes
import heroRepository from '../repositories/heroRepository.js';
import villainRepository from '../repositories/villainRepository.js';

async function getAllHeroes() {
    return await heroRepository.getHeroes();
}

async function addHero(hero) {
    if (!hero.name || !hero.alias) {
        throw new Error("El héroe debe tener un nombre y un alias.");
    }
    const heroes = await heroRepository.getHeroes();
    const newId = heroes.length > 0 ? Math.max(...heroes.map(h => h.id)) + 1 : 1;
    const newHero = { ...hero, id: newId };
    heroes.push(newHero);
    await heroRepository.saveHeroes(heroes);
    return newHero;
}

async function updateHero(id, updatedHero) {
    const heroes = await heroRepository.getHeroes();
    const index = heroes.findIndex(hero => hero.id === parseInt(id));
    if (index === -1) {
        throw new Error('Héroe no encontrado');
    }
    delete updatedHero.id;
    heroes[index] = { ...heroes[index], ...updatedHero };
    await heroRepository.saveHeroes(heroes);
    return heroes[index];
}

async function deleteHero(id) {
    const heroes = await heroRepository.getHeroes();
    const index = heroes.findIndex(hero => hero.id === parseInt(id));
    if (index === -1) {
        throw new Error('Héroe no encontrado');
    }
    const filteredHeroes = heroes.filter(hero => hero.id !== parseInt(id));
    await heroRepository.saveHeroes(filteredHeroes);
    return { message: 'Héroe eliminado' };
}

async function findHeroesByCity(city) {
    const heroes = await heroRepository.getHeroes();
    return heroes.filter(hero => hero.city && hero.city.toLowerCase() === city.toLowerCase());
}

// Adaptado: enfrentar varios héroes a un villano
async function faceVillain(heroIds, villain) {
    const heroes = await heroRepository.getHeroes();
    const ids = Array.isArray(heroIds) ? heroIds : [heroIds];
    const foundHeroes = heroes.filter(hero => ids.includes(hero.id) || ids.includes(parseInt(hero.id)));
    if (foundHeroes.length === 0) {
        throw new Error('Ningún héroe encontrado');
    }
    const nombres = foundHeroes.map(h => h.alias).join(', ');
    return `${nombres} enfrentan a ${villain}`;
}

// Enfrentar héroes vs villanos (solo 1 villano, 1 o varios héroes)
async function faceVillainVsHero(heroIds, villainIds) {
    const heroes = await heroRepository.getHeroes();
    const villains = await villainRepository.getVillains();
    const heroIdArr = Array.isArray(heroIds) ? heroIds : [heroIds];
    const villainIdArr = Array.isArray(villainIds) ? villainIds : [villainIds];

    // Solo se permite 1 villano
    if (villainIdArr.length !== 1) {
        throw new Error('Solo se permite enfrentar uno o varios héroes contra un solo villano. No se puede enfrentar un héroe a varios villanos, varios villanos a un solo héroe, ni varios héroes a varios villanos.');
    }

    // Debe haber al menos 1 héroe
    if (heroIdArr.length < 1) {
        throw new Error('Debes seleccionar al menos un héroe.');
    }

    // Buscar héroes y villano
    const foundHeroes = heroes.filter(h => heroIdArr.includes(h.id) || heroIdArr.includes(parseInt(h.id)));
    const foundVillain = villains.find(v => villainIdArr.includes(v.id) || villainIdArr.includes(parseInt(v.id)));

    if (foundHeroes.length === 0) {
        throw new Error('Ningún héroe encontrado.');
    }
    if (!foundVillain) {
        throw new Error('Villano no encontrado.');
    }

    const nombresHeroes = foundHeroes.map(h => h.alias).join(', ');
    return `${nombresHeroes} enfrentan a ${foundVillain.alias}`;
}

export default {
    getAllHeroes,
    addHero,
    updateHero,
    deleteHero,
    findHeroesByCity,
    faceVillain,
    faceVillainVsHero
};
