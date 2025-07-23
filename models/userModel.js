import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Debe ser el hash, no el texto plano
  createdAt: { type: Date, default: Date.now }
}, { collection: 'users' });

export default mongoose.model('User', userSchema); 