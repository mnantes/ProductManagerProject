const express = require('express');
const Product = require('../models/Product');
const Cart = require('../models/Cart'); // Importe o modelo Cart
const router = express.Router();

router.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const filter = query ? { $or: [{ category: query }, { status: query === 'true' }] } : {};
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {}
        };

        const result = await Product.paginate(filter, options);

        // Cria um novo carrinho para o usuário ou usa um existente
        const cart = await Cart.findOne() || await Cart.create({ products: [] });
        
        res.render('products', {
            products: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            cartId: cart._id // Passa o ID do carrinho para a view
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Nova rota para exibir os detalhes de um produto específico
router.get('/products/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid);
        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.render('productDetails', { product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para exibir um carrinho específico
router.get('/carts/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await Cart.findById(cartId).populate('products.product'); // Popula os detalhes dos produtos

        if (!cart) {
            return res.status(404).json({ error: 'Carrinho não encontrado' });
        }

        res.render('cart', { cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
