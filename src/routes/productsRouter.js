const express = require('express');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productsController'); // Importa os métodos do controller

const { isAdmin } = require('../middlewares/authMiddleware'); // Middleware de autorização
const { faker } = require('@faker-js/faker'); // Biblioteca para gerar dados falsos

const router = express.Router();

// 📌 Rota para gerar 100 produtos falsos (/mockingproducts) - MOVIDA PARA CIMA
router.get('/mockingproducts', (req, res) => {
    try {
        const mockProducts = Array.from({ length: 100 }, () => ({
            _id: faker.database.mongodbObjectId(),
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: parseFloat(faker.commerce.price()),
            category: faker.commerce.department(),
            stock: faker.number.int({ min: 0, max: 100 }),
            status: faker.datatype.boolean(),
            thumbnails: [faker.image.url(), faker.image.url()] // Garantindo pelo menos 2 imagens
        }));

        res.json({ status: 'success', data: mockProducts });
    } catch (error) {
        console.error("Erro ao gerar produtos falsos:", error);
        res.status(500).json({ status: 'error', message: 'Erro ao gerar produtos mockados.' });
    }
});

// 📌 Rota para obter todos os produtos (com paginação e filtros)
router.get('/', getProducts);

// 📌 Rota para obter um produto pelo ID
router.get('/:pid', getProductById);

// 📌 Rota para criar um novo produto (Somente admin)
router.post('/', isAdmin, createProduct);

// 📌 Rota para atualizar um produto pelo ID (Somente admin)
router.put('/:pid', isAdmin, updateProduct);

// 📌 Rota para deletar um produto pelo ID (Somente admin)
router.delete('/:pid', isAdmin, deleteProduct);

module.exports = router; // Exporta o router para ser usado no app.js
