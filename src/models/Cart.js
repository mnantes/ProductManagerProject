const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = new Schema({
  products: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, default: 1 }
    }
  ]
});

module.exports = mongoose.model('Cart', cartSchema);
