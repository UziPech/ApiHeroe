import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  alias: { type: String, required: true },
  power: { type: Number, required: true },
  city: { type: String, default: '' },
  team: { type: String, default: '' }
}, { collection: 'heroes' });

export default mongoose.model('Hero', heroSchema);
