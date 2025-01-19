console.log('Carts Router carregado corretamente.');

const express = require('express');
const {
    getCartById,
    createCart,
    addProductToCart,
    updateCart,
    updateProductQuantity,
    clearCart,
    purchaseCart // 🚀 Nova rota de compra
} = require('../controllers/CartController'); // Importa os métodos do CartController
const { isUser } = require('../middlewares/authMiddleware'); // Importa o middleware de autorização

const router = express.Router();

// Rotas para o carrinho
router.post('/', createCart); // Criar um novo carrinho
router.get('/:cid', getCartById); // Buscar um carrinho por ID
router.post('/:cid/product/:pid', isUser, addProductToCart); // Adicionar produto ao carrinho (Somente usuários)
router.put('/:cid', updateCart); // Atualizar carrinho com uma lista de produtos
router.put('/:cid/products/:pid', updateProductQuantity); // Atualizar quantidade de um produto específico no carrinho
router.delete('/:cid', clearCart); // Remover todos os produtos do carrinho

// 🚀 Nova rota para finalizar a compra
router.post('/:cid/purchase', isUser, purchaseCart);

module.exports = router;
