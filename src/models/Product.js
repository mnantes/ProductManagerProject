const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2'); // para paginação

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  thumbnails: [String],
  code: String,
  status: Boolean
});

productSchema.plugin(mongoosePaginate); // plugin para paginação

module.exports = mongoose.model('Product', productSchema);
