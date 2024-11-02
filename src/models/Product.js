const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  code: { type: String, required: true, unique: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  thumbnails: { type: [String], default: [] },
  status: { type: Boolean, default: true },
});

module.exports = mongoose.model('Product', productSchema);
