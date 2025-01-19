const CartRepository = require('../repositories/cartsRepository');
const ProductRepository = require('../repositories/ProductRepository');
const TicketRepository = require('../repositories/TicketRepository');
const { sendEmail } = require('../services/emailService');

exports.getCartById = async (req, res) => {
    try {
        const cart = await CartRepository.getCartById(req.params.cid);
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
        const newCart = await CartRepository.createCart(req.body.products || []);
        res.status(201).json({ status: 'success', data: newCart });
    } catch (error) {
        console.error("Erro ao criar carrinho:", error.message);
        res.status(500).json({ status: 'error', message: 'Erro ao criar o carrinho.' });
    }
};

exports.addProductToCart = async (req, res) => {
    try {
        const cart = await CartRepository.addProductToCart(req.params.cid, req.params.pid);
        res.status(200).json({ status: 'success', data: cart });
    } catch (error) {
        console.error("Erro ao adicionar produto ao carrinho:", error.message);
        res.status(500).json({ status: 'error', message: 'Erro ao adicionar produto ao carrinho.' });
    }
};

exports.updateCart = async (req, res) => {
    try {
        const updatedCart = await CartRepository.updateCart(req.params.cid, req.body.products);
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
        const updatedCart = await CartRepository.updateProductQuantity(req.params.cid, req.params.pid, quantity);
        res.status(200).json({ status: 'success', data: updatedCart });
    } catch (error) {
        console.error("Erro ao atualizar quantidade do produto:", error.message);
        res.status(500).json({ status: 'error', message: 'Erro ao atualizar quantidade do produto no carrinho.' });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const clearedCart = await CartRepository.clearCart(req.params.cid);
        res.status(200).json({ status: 'success', data: clearedCart });
    } catch (error) {
        console.error("Erro ao limpar o carrinho:", error.message);
        res.status(500).json({ status: 'error', message: 'Erro ao limpar o carrinho.' });
    }
};

// Função para finalizar a compra do carrinho
exports.purchaseCart = async (req, res) => {
    try {
        const cart = await CartRepository.getCartById(req.params.cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrinho não encontrado.' });
        }

        let totalAmount = 0;
        let unavailableProducts = [];

        // Verificar disponibilidade de estoque para cada produto no carrinho
        for (const item of cart.products) {
            const product = await ProductRepository.getProductById(item.product._id);

            if (product && product.stock >= item.quantity) {
                product.stock -= item.quantity;
                await ProductRepository.updateProduct(product._id, { stock: product.stock });
                totalAmount += product.price * item.quantity;
            } else {
                unavailableProducts.push(item.product._id);
            }
        }

        // Criar ticket apenas se houver produtos disponíveis para compra
        if (totalAmount > 0) {
            const ticket = await TicketRepository.createTicket({
                amount: totalAmount,
                purchaser: req.session.userEmail
            });

            // Enviar e-mail de confirmação da compra
            const subject = 'Confirmação de Compra - Seu Ticket';
            const text = `Olá, ${req.session.userEmail}! Sua compra foi realizada com sucesso. Valor total: $${totalAmount}. Obrigado por comprar conosco!`;
            const html = `
                <h2>Confirmação de Compra</h2>
                <p>Olá, ${req.session.userEmail}!</p>
                <p>Sua compra foi realizada com sucesso. Valor total: <strong>$${totalAmount}</strong>.</p>
                <p>Obrigado por comprar conosco!</p>
            `;

            await sendEmail(req.session.userEmail, subject, text, html);

            // Atualizar carrinho para conter apenas os produtos não comprados
            cart.products = cart.products.filter(item => unavailableProducts.includes(item.product._id));
            await CartRepository.updateCart(req.params.cid, cart.products);

            return res.status(201).json({
                status: 'success',
                data: {
                    ticket,
                    unavailableProducts
                }
            });
        } else {
            return res.status(400).json({
                status: 'error',
                message: 'Nenhum produto pôde ser comprado.',
                unavailableProducts
            });
        }
    } catch (error) {
        console.error("Erro ao finalizar compra:", error.message);
        res.status(500).json({ status: 'error', message: 'Erro ao finalizar a compra.' });
    }
};
