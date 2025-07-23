import villainRepository from '../repositories/villainRepository.js';

async function getAllVillains() {
    return await villainRepository.getVillains();
}

async function addVillain(villain) {
    if (!villain.name || !villain.alias) {
        throw new Error("El villano debe tener un nombre y un alias.");
    }
    return await villainRepository.saveVillain(villain);
}

async function updateVillain(id, updatedVillain) {
    const updated = await villainRepository.updateVillain(id, updatedVillain);
    if (!updated) {
        throw new Error('Villano no encontrado');
    }
    return updated;
}

async function deleteVillain(id) {
    const deleted = await villainRepository.deleteVillain(id);
    if (!deleted) {
        throw new Error('Villano no encontrado');
    }
    return { message: 'Villano eliminado' };
}

async function findVillainsByCity(city) {
    const villains = await villainRepository.getVillains();
    return villains.filter(villain => villain.city && villain.city.toLowerCase() === city.toLowerCase());
}

export default {
    getAllVillains,
    addVillain,
    updateVillain,
    deleteVillain,
    findVillainsByCity
};
