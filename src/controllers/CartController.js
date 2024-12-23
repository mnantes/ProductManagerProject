const CartDAO = require('../dao/CartDAO');

// Instanciar a classe do DAO
const cartDAO = new CartDAO();

exports.getCartById = async (req, res) => {
    try {
        const cart = await cartDAO.getCartById(req.params.cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrinho não encontrado.' });
        }
        res.status(200).json({ status: 'success', data: cart });
    } catch (error) {
        console.error("Erro ao buscar carrinho:", error.message);
        res.status(500).json({ status: 'error', message: 'Erro ao buscar o carrinho.' });
    }
};

exports.createCart = async (req, res) => {
    try {
        const newCart = await cartDAO.createCart(req.body.products || []);
        res.status(201).json({ status: 'success', data: newCart });
    } catch (error) {
        console.error("Erro ao criar carrinho:", error.message);
        res.status(500).json({ status: 'error', message: 'Erro ao criar o carrinho.' });
    }
};

exports.addProductToCart = async (req, res) => {
    try {
        const cart = await cartDAO.addProductToCart(req.params.cid, req.params.pid);
        res.status(200).json({ status: 'success', data: cart });
    } catch (error) {
        console.error("Erro ao adicionar produto ao carrinho:", error.message);
        res.status(500).json({ status: 'error', message: 'Erro ao adicionar produto ao carrinho.' });
    }
};

exports.updateCart = async (req, res) => {
    try {
        const updatedCart = await cartDAO.updateCart(req.params.cid, req.body.products);
        if (!updatedCart) {
            return res.status(404).json({ status: 'error', message: 'Carrinho não encontrado.' });
        }
        res.status(200).json({ status: 'success', data: updatedCart });
    } catch (error) {
        console.error("Erro ao atualizar carrinho:", error.message);
        res.status(500).json({ status: 'error', message: 'Erro ao atualizar o carrinho.' });
    }
};

exports.updateProductQuantity = async (req, res) => {
    try {
        const { quantity } = req.body;
        const updatedCart = await cartDAO.updateProductQuantity(req.params.cid, req.params.pid, quantity);
        res.status(200).json({ status: 'success', data: updatedCart });
    } catch (error) {
        console.error("Erro ao atualizar quantidade do produto:", error.message);
        res.status(500).json({ status: 'error', message: 'Erro ao atualizar quantidade do produto no carrinho.' });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const clearedCart = await cartDAO.clearCart(req.params.cid);
        res.status(200).json({ status: 'success', data: clearedCart });
    } catch (error) {
        console.error("Erro ao limpar o carrinho:", error.message);
        res.status(500).json({ status: 'error', message: 'Erro ao limpar o carrinho.' });
    }
};
