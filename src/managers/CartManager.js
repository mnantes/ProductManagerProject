const Cart = require('../models/Cart'); // Importa o modelo Cart

class CartManager {
  async createCart(products = []) {
    try {
      if (!Array.isArray(products)) {
        throw new Error("Os produtos devem ser um array.");
      }

      const newCart = new Cart({ products });
      return await newCart.save();
    } catch (error) {
      console.error("Erro ao criar carrinho:", error);
      throw error;
    }
  }

  async getCartById(id) {
    try {
      const cart = await Cart.findById(id).populate('products.product');
      if (!cart) throw new Error("Carrinho não encontrado");
      return cart;
    } catch (error) {
      console.error("Erro ao buscar carrinho:", error);
      throw error;
    }
  }

  async addProductToCart(cartId, productId) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) throw new Error("Carrinho não encontrado");

      const productInCart = cart.products.find(p => p.product.toString() === productId);
      if (productInCart) {
        productInCart.quantity += 1;
      } else {
        cart.products.push({ product: productId, quantity: 1 });
      }

      await cart.save();
      return cart;
    } catch (error) {
      console.error("Erro ao adicionar produto ao carrinho:", error);
      throw error;
    }
  }
}

module.exports = CartManager;
