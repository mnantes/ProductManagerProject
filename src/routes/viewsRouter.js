const express = require('express');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
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

        let cart = await Cart.findOne();
        if (!cart) {
            cart = await Cart.create({ products: [] });
        }

        console.log("Cart ID utilizado:", cart._id.toString()); // Verificação do ID do carrinho
        console.log("Produtos recuperados:", result.docs);

        res.render('products', {
            products: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            cartId: cart._id.toString()
        });
    } catch (error) {
        console.error("Erro ao buscar produtos:", error); // Log de erro para verificar problemas
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.get('/products/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid);
        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        let cart = await Cart.findOne();
        if (!cart) {
            cart = await Cart.create({ products: [] });
        }

        console.log("Cart ID utilizado:", cart._id.toString()); // Verificação do ID do carrinho

        res.render('productDetails', { product, cartId: cart._id.toString() });
    } catch (error) {
        console.error("Erro ao buscar detalhes do produto:", error); // Log de erro para verificar problemas
        res.status(500).json({ error: error.message });
    }
});

router.get('/carts/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await Cart.findById(cartId).populate('products.product');

        if (!cart) {
            return res.status(404).json({ error: 'Carrinho não encontrado' });
        }

        res.render('cart', { cart });
    } catch (error) {
        console.error("Erro ao buscar carrinho:", error); // Log de erro para verificar problemas
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
