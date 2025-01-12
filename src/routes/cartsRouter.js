console.log('Carts Router carregado corretamente.');

const express = require('express');
const {
    getCartById,
    createCart,
    addProductToCart,
    updateCart,
    updateProductQuantity,
    clearCart
} = require('../controllers/CartController'); // Importa os métodos do CartController

const router = express.Router();

// Rotas para o carrinho
router.post('/', createCart); // Criar um novo carrinho
router.get('/:cid', getCartById); // Buscar um carrinho por ID
router.post('/:cid/product/:pid', addProductToCart); // Adicionar produto ao carrinho
router.put('/:cid', updateCart); // Atualizar carrinho com uma lista de produtos
router.put('/:cid/products/:pid', updateProductQuantity); // Atualizar quantidade de um produto específico no carrinho
router.delete('/:cid', clearCart); // Remover todos os produtos do carrinho

module.exports = router;
