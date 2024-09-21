const fs = require('fs');

class ProductManager {
  constructor(path) {
    this.path = path;
    this.products = [];
    this.currentId = 0;
    this.loadProducts();
  }

  loadProducts() {
    if (fs.existsSync(this.path)) {
      const data = fs.readFileSync(this.path, 'utf-8');
      this.products = JSON.parse(data);
      if (this.products.length > 0) {
        this.currentId = this.products[this.products.length - 1].id;
      }
    } else {
      this.saveProducts();
    }
  }

  saveProducts() {
    fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2), 'utf-8');
  }

  addProduct(title, description, price, thumbnail, code, stock) {
    if (!title || !description || !price || !thumbnail || !code || !stock) {
      console.error("Todos os campos são obrigatórios.");
      return;
    }

    const codeExists = this.products.some(product => product.code === code);
    if (codeExists) {
      console.error(`O código ${code} já está em uso.`);
      return;
    }

    const newProduct = {
      id: ++this.currentId,
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
    };

    this.products.push(newProduct);
    this.saveProducts();
    console.log("Produto adicionado com sucesso:", newProduct);
  }

  getProductById(id) {
    const product = this.products.find(product => product.id === id);

    if (!product) {
      console.error("Produto não encontrado.");
      return null;
    }

    return product;
  }

  updateProduct(id, updatedFields) {
    const productIndex = this.products.findIndex(product => product.id === id);

    if (productIndex === -1) {
      console.error("Produto não encontrado.");
      return;
    }

    this.products[productIndex] = { ...this.products[productIndex], ...updatedFields };
    this.saveProducts();
    console.log("Produto atualizado com sucesso:", this.products[productIndex]);
  }

  deleteProduct(id) {
    const productIndex = this.products.findIndex(product => product.id === id);

    if (productIndex === -1) {
      console.error("Produto não encontrado.");
      return;
    }

    this.products.splice(productIndex, 1);
    this.saveProducts();
    console.log("Produto deletado com sucesso.");
  }
}

const manager = new ProductManager('products.json');

manager.addProduct("Produto 1", "Descrição do produto 1", 100, "img1.png", "P001", 10);
manager.addProduct("Produto 2", "Descrição do produto 2", 200, "img2.png", "P002", 15);

console.log(manager.getProductById(1));

manager.updateProduct(1, { price: 120, stock: 8 });

manager.deleteProduct(2);
