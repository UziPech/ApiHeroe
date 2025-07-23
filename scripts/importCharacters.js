// Script para importar héroes y villanos desde JSON a MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import Hero from '../models/heroModel.js';
import Villain from '../models/villainModel.js';

dotenv.config();

const mongoURI = process.env.MONGODB_URI;

async function importData() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conectado a MongoDB');

    // Leer y parsear los archivos JSON
    let heroes = await fs.readJson('./superheroes.json');
    let villains = await fs.readJson('./villains.json');

    // Asignar valor por defecto a 'power' si falta en algún héroe o villano
    heroes = heroes.map(hero => ({ ...hero, power: hero.power !== undefined ? hero.power : 50 }));
    villains = villains.map(villain => ({ ...villain, power: villain.power !== undefined ? villain.power : 50 }));

    // Limpiar colecciones antes de importar
    await Hero.deleteMany();
    await Villain.deleteMany();

    // Insertar datos
    await Hero.insertMany(heroes);
    await Villain.insertMany(villains);

    console.log('Importación completada.');
    process.exit();
  } catch (error) {
    console.error('Error al importar:', error);
    process.exit(1);
  }
}

importData(); 