import mongoose from 'mongoose';


const villainSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  alias: { type: String, required: true, unique: true },
  power: { type: Number, required: true },
  city: { type: String, default: '' },
  team: { type: String, default: '' }
}, { collection: 'villains' });

export default mongoose.model('Villain', villainSchema);
