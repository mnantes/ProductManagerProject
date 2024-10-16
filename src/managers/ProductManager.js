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

  async getProducts(limit) {
    return limit ? this.products.slice(0, limit) : this.products;
  }

  async getProductById(id) {
    const product = this.products.find(product => product.id === id);
    return product || null;
  }

  async addProduct({ title, description, price, code, stock, category, thumbnails = [], status = true }) {
    // Validação dos campos obrigatórios
    if (!title || !description || !price || !code || !stock || !category) {
      throw new Error("Todos os campos são obrigatórios, exceto thumbnails.");
    }

    const codeExists = this.products.some(product => product.code === code);
    if (codeExists) {
      throw new Error(`O código ${code} já está em uso.`);
    }

    const newProduct = {
      id: ++this.currentId,
      title,
      description,
      price,
      code,
      stock,
      category,
      thumbnails,
      status
    };

    this.products.push(newProduct);
    await this.saveProducts();
    return newProduct;
  }

  async updateProduct(id, updatedFields) {
    const productIndex = this.products.findIndex(product => product.id === id);

    if (productIndex === -1) {
      throw new Error("Produto não encontrado.");
    }

    const { id: _, ...fieldsToUpdate } = updatedFields;
    this.products[productIndex] = { ...this.products[productIndex], ...fieldsToUpdate };
    await this.saveProducts();
    return this.products[productIndex];
  }

  async deleteProduct(id) {
    const productIndex = this.products.findIndex(product => product.id === id);

    if (productIndex === -1) {
      throw new Error("Produto não encontrado.");
    }

    this.products.splice(productIndex, 1);
    await this.saveProducts();
  }
}

module.exports = ProductManager;
