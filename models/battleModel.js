import mongoose from 'mongoose';

// Definir el esquema de un miembro de equipo con todos los datos relevantes
const teamMemberSchema = new mongoose.Schema({
  id: Number,
  name: String, // Nombre del personaje
  alias: String, // Alias del personaje
  power: Number, // Poder base
  hp: { type: Number, default: 100 }, // Vida
  defense: { type: Number, default: 0 },
  maxDefense: { type: Number, default: 0 },
  level: { type: Number, default: 1 }
}, { _id: false });

const battleSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  hero: { type: Object },
  villain: { type: Object },
  winner: { 
    type: mongoose.Schema.Types.Mixed, // Permite tanto Object (para batallas 1v1) como String (para batallas 3v3)
    validate: {
      validator: function(value) {
        // Para batallas por equipos, winner debe ser string: 'heroes', 'villains', 'empate', o null
        // Para batallas 1v1, winner puede ser un objeto con datos del ganador
        return value === null || 
               value === 'heroes' || 
               value === 'villains' || 
               value === 'empate' ||
               (typeof value === 'object' && value !== null);
      },
      message: 'Winner debe ser null, "heroes", "villains", "empate", o un objeto (para batallas 1v1)'
    }
  },
  loser: { type: Object },
  message: { type: String },
  timestamp: { type: String },
  userId: { type: String, required: true },
  teams: {
    heroes: [teamMemberSchema],
    villains: [teamMemberSchema]
  },
  // Campos para batallas por equipos
  userSide: { type: String },
  firstHero: { type: Number },
  firstVillain: { type: Number },
  current: { type: Object },
  actions: { type: Array },
  finished: { type: Boolean },
  defeated: { type: Array, default: [] },
  nextTurn: { type: Object, default: null },
}, { collection: 'battles' });

export default mongoose.model('Battle', battleSchema);
