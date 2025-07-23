import mongoose from 'mongoose';
import Battle from '../models/battleModel.js';

async function validateAndAdaptBattles() {
  try {
    // Conectar a MongoDB
    await mongoose.connect('mongodb://localhost:27017/yourDatabaseName', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Conectado a MongoDB');

    // Obtener todas las batallas
    const battles = await Battle.find();

    for (const battle of battles) {
      let updated = false;

      // Validar y agregar campos faltantes
      if (!battle.defeated) {
        battle.defeated = [];
        updated = true;
      }

      if (!battle.nextTurn) {
        battle.nextTurn = null;
        updated = true;
      }

      if (!battle.current) {
        battle.current = {
          hero: null,
          villain: null,
          side: null
        };
        updated = true;
      }

      if (updated) {
        await battle.save();
        console.log(`Batalla con ID ${battle.id} actualizada.`);
      }
    }

    console.log('Validación y adaptación completadas.');

    // Cerrar conexión
    await mongoose.disconnect();
    console.log('Conexión cerrada.');
  } catch (error) {
    console.error('Error durante la validación y adaptación:', error);
  }
}

validateAndAdaptBattles();
