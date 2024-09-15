class ProductManager {
  constructor() {
    this.products = [];
    this.currentId = 0;
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
}

const manager = new ProductManager();

manager.addProduct("Produto 1", "Descrição do produto 1", 100, "img1.png", "P001", 10);
manager.addProduct("Produto 2", "Descrição do produto 2", 200, "img2.png", "P002", 15);

console.log(manager.getProductById(1));
console.log(manager.getProductById(3));
