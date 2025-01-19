const ProductDAO = require('../dao/productDao');

class ProductRepository {
    async getProducts(filter = {}, options = {}) {
        return await ProductDAO.getProducts(filter, options);
    }

    async getProductById(productId) {
        return await ProductDAO.getProductById(productId);
    }

    async createProduct(productData) {
        return await ProductDAO.createProduct(productData);
    }

    async updateProduct(productId, productData) {
        return await ProductDAO.updateProduct(productId, productData);
    }

    async deleteProduct(productId) {
        return await ProductDAO.deleteProduct(productId);
    }
}

module.exports = new ProductRepository();
