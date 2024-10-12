const fs = require('fs').promises;

class CartManager {
  constructor(path) {
    this.path = path;
    this.carts = [];
    this.currentId = 0;
    this.init();
  }

  async init() {
    await this.loadCarts();
  }

  async loadCarts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      this.carts = JSON.parse(data);
      if (this.carts.length > 0) {
        this.currentId = this.carts[this.carts.length - 1].id;
      }
    } catch {
      this.carts = [];
      await this.saveCarts();
    }
  }

  async saveCarts() {
    await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2), 'utf-8');
  }

  async createCart(products = []) {
    if (!Array.isArray(products)) {
      throw new Error("Os produtos devem ser um array.");
    }

    const newCart = {
      id: ++this.currentId,
      products
    };

    this.carts.push(newCart);
    await this.saveCarts();
    return newCart;
  }

  async getCartById(id) {
    const cart = this.carts.find(cart => cart.id === id);
    return cart || null;
  }

  async addProductToCart(cartId, productId) {
    const cart = await this.getCartById(cartId);

    if (!cart) {
      throw new Error("Carrinho não encontrado.");
    }

    const productInCart = cart.products.find(p => p.product === productId);
    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await this.saveCarts();
    return cart;
  }
}

module.exports = CartManager;
