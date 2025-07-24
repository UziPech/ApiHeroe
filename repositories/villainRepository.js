import Villain from '../models/villainModel.js';

async function getVillains() {
    return await Villain.find();
}

async function getVillainById(id) {
    return await Villain.findOne({ id: parseInt(id) });
}

async function saveVillain(villainData) {
    const villain = new Villain(villainData);
    return await villain.save();
}

async function updateVillain(id, updatedVillain) {
    // No permitir modificar 'id' ni 'power' desde el body
    const { id: _ignoreId, power: _ignorePower, ...allowedFields } = updatedVillain;
    return await Villain.findOneAndUpdate({ id: parseInt(id) }, allowedFields, { new: true });
}

async function deleteVillain(id) {
    return await Villain.findOneAndDelete({ id: parseInt(id) });
}

export default {
    getVillains,
    getVillainById,
    saveVillain,
    updateVillain,
    deleteVillain
};
