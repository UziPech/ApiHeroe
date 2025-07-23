// Servicio de lógica de negocio para héroes
import heroRepository from '../repositories/heroRepository.js';

async function getAllHeroes() {
    return await heroRepository.getHeroes();
}

async function addHero(hero) {
    if (!hero.name || !hero.alias) {
        throw new Error("El héroe debe tener un nombre y un alias.");
    }
    return await heroRepository.saveHero(hero);
}

async function updateHero(id, updatedHero) {
    const updated = await heroRepository.updateHero(id, updatedHero);
    if (!updated) {
        throw new Error('Héroe no encontrado');
    }
    return updated;
}

async function deleteHero(id) {
    const deleted = await heroRepository.deleteHero(id);
    if (!deleted) {
        throw new Error('Héroe no encontrado');
    }
    return { message: 'Héroe eliminado' };
}

async function findHeroesByCity(city) {
    const heroes = await heroRepository.getHeroes();
    return heroes.filter(hero => hero.city && hero.city.toLowerCase() === city.toLowerCase());
}

export default {
    getAllHeroes,
    addHero,
    updateHero,
    deleteHero,
    findHeroesByCity
};
