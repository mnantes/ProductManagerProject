const Product = require('../models/Product');

class ProductDAO {
    async getProducts(filter = {}, options = {}) {
        try {
            return await Product.paginate(filter, options);
        } catch (error) {
            throw new Error('Erro ao buscar produtos: ' + error.message);
        }
    }

    async getProductById(productId) {
        try {
            // ✅ Agora validamos se o ID é do MongoDB antes de buscar
            if (!productId || productId.length !== 24) {
                return null; // Se for inválido, retorna null e não gera erro
            }

            return await Product.findById(productId);
        } catch (error) {
            throw new Error('Erro ao buscar produto: ' + error.message);
        }
    }

    async createProduct(productData) {
        try {
            const product = new Product(productData);
            return await product.save();
        } catch (error) {
            throw new Error('Erro ao criar produto: ' + error.message);
        }
    }

    async updateProduct(productId, productData) {
        try {
            if (!productId || productId.length !== 24) {
                throw new Error('ID inválido para atualização.');
            }
            return await Product.findByIdAndUpdate(productId, productData, { new: true });
        } catch (error) {
            throw new Error('Erro ao atualizar produto: ' + error.message);
        }
    }

    async deleteProduct(productId) {
        try {
            if (!productId || productId.length !== 24) {
                throw new Error('ID inválido para exclusão.');
            }
            return await Product.findByIdAndDelete(productId);
        } catch (error) {
            throw new Error('Erro ao deletar produto: ' + error.message);
        }
    }
}

module.exports = new ProductDAO();
