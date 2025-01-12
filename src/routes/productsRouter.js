const express = require('express');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productsController'); // Importa os métodos do controller

const router = express.Router();

// Rota para obter todos os produtos (com paginação e filtros)
router.get('/', getProducts);

// Rota para obter um produto pelo ID
router.get('/:pid', getProductById);

// Rota para criar um novo produto
router.post('/', createProduct);

// Rota para atualizar um produto pelo ID
router.put('/:pid', updateProduct);

// Rota para deletar um produto pelo ID
router.delete('/:pid', deleteProduct);

module.exports = router; // Exporta o router para ser usado no app.js
