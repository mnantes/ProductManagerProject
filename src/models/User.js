const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // 🔥 Garante que o _id seja tratado corretamente
  email: { type: String, required: true, unique: true },
  password: { type: String }, // 🔥 Agora permite usuários sem senha (para GitHub)
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

// 🔥 Garante que o modelo seja criado corretamente
const User = mongoose.model('User', userSchema);

module.exports = User;
