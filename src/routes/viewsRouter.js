console.log('Views Router carregado corretamente.');

const express = require('express');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const router = express.Router();

// Verifica se o método paginate existe antes de iniciar o servidor
if (typeof Product.paginate !== 'function') {
    console.error("ERRO CRÍTICO: O modelo Product não possui paginate. Verifique a configuração do mongoose-paginate.");
    process.exit(1); // Encerra a aplicação se houver erro crítico
}

// Rota para exibir a lista de produtos na página
router.get('/products', async (req, res) => {
    try {
        console.log("Rota /products acessada.");

        const { limit = 10, page = 1, sort, query } = req.query;
        const filter = query ? { $or: [{ category: query }, { status: query === 'true' }] } : {};
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
            lean: true // Garante que os dados sejam retornados como objetos JS simples para Handlebars
        };

        const result = await Product.paginate(filter, options);

        let cart = await Cart.findOne();
        if (!cart) {
            cart = await Cart.create({ products: [] });
        }

        console.log("Cart ID utilizado:", cart._id.toString());
        console.log("Produtos recuperados:", result.docs.length);

        res.render('products', {
            title: 'Lista de Produtos',
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
        console.error("Erro ao buscar produtos:", error);
        res.status(500).json({ status: 'error', message: "Erro ao buscar produtos. Verifique os logs do servidor." });
    }
});

// Rota para exibir detalhes de um produto específico
router.get('/products/:pid', async (req, res) => {
    try {
        console.log(`Acessando detalhes do produto ${req.params.pid}`);

        const product = await Product.findById(req.params.pid).lean();
        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        let cart = await Cart.findOne();
        if (!cart) {
            cart = await Cart.create({ products: [] });
        }

        console.log("Cart ID utilizado:", cart._id.toString());

        res.render('productDetails', { 
            title: product.name, 
            product, 
            cartId: cart._id.toString() 
        });
    } catch (error) {
        console.error("Erro ao buscar detalhes do produto:", error);
        res.status(500).json({ error: "Erro ao buscar detalhes do produto. Verifique os logs." });
    }
});

// Rota para exibir o carrinho de compras
router.get('/carts/:cid', async (req, res) => {
    try {
        console.log(`Acessando carrinho ID: ${req.params.cid}`);

        const cartId = req.params.cid;
        const cart = await Cart.findById(cartId).populate('products.product').lean();

        if (!cart) {
            return res.status(404).json({ error: 'Carrinho não encontrado' });
        }

        res.render('cart', { title: 'Meu Carrinho', cart });
    } catch (error) {
        console.error("Erro ao buscar carrinho:", error);
        res.status(500).json({ status: 'error', message: "Erro ao buscar carrinho. Verifique os logs." });
    }
});

module.exports = router;
