// Script para importar batallas desde JSON a MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import Battle from '../models/battleModel.js';

dotenv.config();

const mongoURI = process.env.MONGODB_URI;

async function importBattles() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conectado a MongoDB');

    // Leer y parsear el archivo JSON de batallas
    let battles = await fs.readJson('./📄 battles.json');

    // Asignar userId 'imported' si no existe
    battles = battles.map(battle => ({ ...battle, userId: battle.userId || 'imported' }));

    // Limpiar colección antes de importar (opcional, puedes comentar si no quieres borrar las batallas actuales)
    // await Battle.deleteMany();

    // Insertar datos
    await Battle.insertMany(battles);

    console.log('Importación de batallas completada.');
    process.exit();
  } catch (error) {
    console.error('Error al importar batallas:', error);
    process.exit(1);
  }
}

importBattles(); 