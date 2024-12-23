// dao/CartDAO.js
const Cart = require('../models/Cart');

class CartDAO {
  async createCart(products = []) {
    try {
      if (!Array.isArray(products)) {
        throw new Error("Os produtos devem ser um array.");
      }

      const newCart = new Cart({ products });
      return await newCart.save();
    } catch (error) {
      console.error("Erro ao criar carrinho:", error.message);
      throw new Error("Não foi possível criar o carrinho.");
    }
  }

  async getCartById(id) {
    try {
      const cart = await Cart.findById(id).populate('products.product');
      if (!cart) throw new Error("Carrinho não encontrado.");
      return cart;
    } catch (error) {
      console.error("Erro ao buscar carrinho:", error.message);
      throw new Error("Não foi possível buscar o carrinho.");
    }
  }

  async addProductToCart(cartId, productId) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) throw new Error("Carrinho não encontrado.");

      const productInCart = cart.products.find(p => p.product.toString() === productId);
      if (productInCart) {
        productInCart.quantity += 1;
      } else {
        cart.products.push({ product: productId, quantity: 1 });
      }

      await cart.save();
      return cart;
    } catch (error) {
      console.error("Erro ao adicionar produto ao carrinho:", error.message);
      throw new Error("Não foi possível adicionar o produto ao carrinho.");
    }
  }

  async updateCart(cartId, products) {
    try {
      const updatedCart = await Cart.findByIdAndUpdate(cartId, { products }, { new: true });
      if (!updatedCart) throw new Error("Carrinho não encontrado.");
      return updatedCart;
    } catch (error) {
      console.error("Erro ao atualizar carrinho:", error.message);
      throw new Error("Não foi possível atualizar o carrinho.");
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    try {
      const cart = await this.getCartById(cartId);
      const productInCart = cart.products.find(p => p.product.toString() === productId);
      if (!productInCart) throw new Error("Produto não encontrado no carrinho.");

      productInCart.quantity = quantity;
      await cart.save();
      return cart;
    } catch (error) {
      console.error("Erro ao atualizar quantidade do produto no carrinho:", error.message);
      throw new Error("Não foi possível atualizar a quantidade do produto no carrinho.");
    }
  }

  async clearCart(cartId) {
    try {
      const updatedCart = await Cart.findByIdAndUpdate(cartId, { products: [] }, { new: true });
      if (!updatedCart) throw new Error("Carrinho não encontrado.");
      return updatedCart;
    } catch (error) {
      console.error("Erro ao limpar o carrinho:", error.message);
      throw new Error("Não foi possível limpar o carrinho.");
    }
  }
}

module.exports = new CartDAO();
