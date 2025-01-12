const mongoose = require('mongoose');

// Definição do esquema do carrinho
const cartSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // Referencia à coleção "Product"
                required: true // Garantir que o produto seja obrigatório
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
                min: [1, 'A quantidade deve ser pelo menos 1'] // Validação para quantidade mínima
            }
        }
    ]
}, {
    timestamps: true // Adiciona campos de "createdAt" e "updatedAt"
});

// Adicionar método para calcular o total de produtos no carrinho
cartSchema.methods.calculateTotal = function() {
    return this.products.reduce((total, item) => total + item.quantity, 0);
};

// Criar e exportar o modelo do carrinho
const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
