import Hero from '../models/heroModel.js';

async function getHeroes() {
    return await Hero.find();
}

async function getHeroById(id) {
    return await Hero.findOne({ id: parseInt(id) });
}

async function saveHero(heroData) {
    const hero = new Hero(heroData);
    return await hero.save();
}

async function updateHero(id, updatedHero) {
    return await Hero.findOneAndUpdate({ id: parseInt(id) }, updatedHero, { new: true });
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
