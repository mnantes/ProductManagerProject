const Product = require('../models/Product'); // Importa o modelo Product

class ProductManager {
  async getProducts(limit) {
    try {
      return limit ? await Product.find().limit(limit) : await Product.find();
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const product = await Product.findById(id);
      if (!product) throw new Error("Produto não encontrado");
      return product;
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      throw error;
    }
  }

  async addProduct(data) {
    try {
      const newProduct = new Product(data);
      return await newProduct.save();
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      throw error;
    }
  }

  async updateProduct(id, data) {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true });
      if (!updatedProduct) throw new Error("Produto não encontrado");
      return updatedProduct;
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const deletedProduct = await Product.findByIdAndDelete(id);
      if (!deletedProduct) throw new Error("Produto não encontrado");
      return deletedProduct;
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      throw error;
    }
  }
}

module.exports = ProductManager;
