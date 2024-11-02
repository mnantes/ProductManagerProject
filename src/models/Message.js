const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  user: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
