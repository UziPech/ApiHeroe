import mongoose from 'mongoose';

const duelSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: String, required: true }, // Cambiar a String para manejar ObjectId
  heroId: { type: Number, required: true },
  villainId: { type: Number, required: true },
  heroName: { type: String, required: true },
  heroAlias: { type: String, required: true },
  villainName: { type: String, required: true },
  villainAlias: { type: String, required: true },
  winnerId: { type: Number, required: true }, // ID del ganador (héroe o villano)
  winnerType: { type: String, enum: ['hero', 'villain'], required: true },
  winnerName: { type: String, required: true },
  winnerAlias: { type: String, required: true },
  loserId: { type: Number, required: true },
  loserType: { type: String, enum: ['hero', 'villain'], required: true },
  loserName: { type: String, required: true },
  loserAlias: { type: String, required: true },
  randomFactor: { type: Number, required: true }, // Factor aleatorio que decidió el ganador
  timestamp: { type: Date, default: Date.now },
  message: { type: String, required: true }
}, { collection: 'duels' });

export default mongoose.model('Duel', duelSchema);
