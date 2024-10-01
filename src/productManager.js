const fs = require('fs').promises;

class ProductManager {
  constructor(path) {
    this.path = path;
    this.products = [];
    this.currentId = 0;
    this.init();
  }

  async init() {
    await this.loadProducts();
  }

  async loadProducts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      this.products = JSON.parse(data);
      if (this.products.length > 0) {
        this.currentId = this.products[this.products.length - 1].id;
      }
    } catch {
      this.products = [];
      await this.saveProducts();
    }
  }

  async saveProducts() {
    await fs.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf-8');
  }

  async getProducts() {
    return this.products;
  }

  async getProductById(id) {
    const product = this.products.find(product => product.id === id);
    return product || null;
  }
}

module.exports = ProductManager;
