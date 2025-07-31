import Hero from '../models/heroModel.js';

async function getHeroes() {
    // Devuelve solo los primeros 10 héroes reales de la base de datos
    return await Hero.find().limit(10);
}

async function getHeroById(id) {
    return await Hero.findOne({ id: parseInt(id) });
}

async function saveHero(heroData) {
    const hero = new Hero(heroData);
    return await hero.save();
}

async function updateHero(id, updatedHero) {
    // No permitir modificar 'id' ni 'power' desde el body
    const { id: _ignoreId, power: _ignorePower, ...allowedFields } = updatedHero;
    return await Hero.findOneAndUpdate({ id: parseInt(id) }, allowedFields, { new: true });
}

async function deleteHero(id) {
    return await Hero.findOneAndDelete({ id: parseInt(id) });
}

export default {
    getHeroes,
    getHeroById,
    saveHero,
    updateHero,
    deleteHero
};
