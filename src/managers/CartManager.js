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

  // Novo método para atualizar o carrinho com uma lista completa de produtos
  async updateCart(cartId, products) {
    try {
      return await Cart.findByIdAndUpdate(cartId, { products }, { new: true });
    } catch (error) {
      console.error("Erro ao atualizar carrinho:", error);
      throw error;
    }
  }

  // Novo método para atualizar a quantidade de um produto específico no carrinho
  async updateProductQuantity(cartId, productId, quantity) {
    try {
      const cart = await this.getCartById(cartId);
      if (!cart) throw new Error("Carrinho não encontrado");

      const productInCart = cart.products.find(p => p.product.toString() === productId);
      if (!productInCart) throw new Error("Produto não encontrado no carrinho");

      productInCart.quantity = quantity;
      await cart.save();
      return cart;
    } catch (error) {
      console.error("Erro ao atualizar quantidade do produto no carrinho:", error);
      throw error;
    }
  }

  // Novo método para limpar todos os produtos do carrinho
  async clearCart(cartId) {
    try {
      return await Cart.findByIdAndUpdate(cartId, { products: [] }, { new: true });
    } catch (error) {
      console.error("Erro ao limpar o carrinho:", error);
      throw error;
    }
  }
}

module.exports = CartManager;
