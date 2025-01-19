const CartDAO = require('../dao/CartDAO');
const ProductDAO = require('../dao/productDao');
const TicketRepository = require('./TicketRepository');

class CartRepository {
    async createCart(products = []) {
        return await CartDAO.createCart(products);
    }

    async getCartById(cartId) {
        return await CartDAO.getCartById(cartId);
    }

    async addProductToCart(cartId, productId) {
        return await CartDAO.addProductToCart(cartId, productId);
    }

    async updateCart(cartId, products) {
        return await CartDAO.updateCart(cartId, products);
    }

    async updateProductQuantity(cartId, productId, quantity) {
        return await CartDAO.updateProductQuantity(cartId, productId, quantity);
    }

    async clearCart(cartId) {
        return await CartDAO.clearCart(cartId);
    }

    async finalizePurchase(cartId, purchaserEmail) {
        const cart = await CartDAO.getCartById(cartId);
        if (!cart) throw new Error('Carrinho não encontrado.');

        let totalAmount = 0;
        const productsNotPurchased = [];

        for (const item of cart.products) {
            const product = await ProductDAO.getProductById(item.product);
            
            if (product && product.stock >= item.quantity) {
                // Atualiza o estoque do produto
                product.stock -= item.quantity;
                await ProductDAO.updateProduct(product._id, { stock: product.stock });

                // Soma ao total da compra
                totalAmount += product.price * item.quantity;
            } else {
                // Produto sem estoque suficiente, não pode ser comprado
                productsNotPurchased.push(item.product);
            }
        }

        if (totalAmount > 0) {
            // Criar um ticket para os produtos comprados
            await TicketRepository.createTicket({
                amount: totalAmount,
                purchaser: purchaserEmail
            });

            // Atualizar o carrinho, removendo os produtos comprados
            const updatedProducts = cart.products.filter(item => 
                productsNotPurchased.includes(item.product)
            );
            await CartDAO.updateCart(cartId, updatedProducts);
        }

        return { success: true, productsNotPurchased };
    }
}

module.exports = new CartRepository();
