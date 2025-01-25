const CartRepository = require('../repositories/cartsRepository');
const ProductRepository = require('../repositories/ProductRepository');
const TicketRepository = require('../repositories/TicketRepository');
const { sendEmail } = require('../services/emailService');
const { CustomError } = require('../middlewares/errorHandler');

exports.getCartById = async (req, res, next) => {
    try {
        const cart = await CartRepository.getCartById(req.params.cid);
        if (!cart) {
            return next(new CustomError('Carrinho não encontrado.', 404));
        }
        res.status(200).json({ status: 'success', data: cart });
    } catch (error) {
        next(new CustomError('Erro ao buscar o carrinho.', 500));
    }
};

exports.createCart = async (req, res, next) => {
    try {
        const newCart = await CartRepository.createCart(req.body.products || []);
        res.status(201).json({ status: 'success', data: newCart });
    } catch (error) {
        next(new CustomError('Erro ao criar o carrinho.', 500));
    }
};

exports.addProductToCart = async (req, res, next) => {
    try {
        const cart = await CartRepository.addProductToCart(req.params.cid, req.params.pid);
        res.status(200).json({ status: 'success', data: cart });
    } catch (error) {
        next(new CustomError('Erro ao adicionar produto ao carrinho.', 500));
    }
};

exports.updateCart = async (req, res, next) => {
    try {
        const updatedCart = await CartRepository.updateCart(req.params.cid, req.body.products);
        if (!updatedCart) {
            return next(new CustomError('Carrinho não encontrado.', 404));
        }
        res.status(200).json({ status: 'success', data: updatedCart });
    } catch (error) {
        next(new CustomError('Erro ao atualizar o carrinho.', 500));
    }
};

exports.updateProductQuantity = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        if (!quantity || quantity <= 0) {
            return next(new CustomError('A quantidade do produto deve ser maior que zero.', 400));
        }

        const updatedCart = await CartRepository.updateProductQuantity(req.params.cid, req.params.pid, quantity);
        res.status(200).json({ status: 'success', data: updatedCart });
    } catch (error) {
        next(new CustomError('Erro ao atualizar quantidade do produto no carrinho.', 500));
    }
};

exports.clearCart = async (req, res, next) => {
    try {
        const clearedCart = await CartRepository.clearCart(req.params.cid);
        res.status(200).json({ status: 'success', data: clearedCart });
    } catch (error) {
        next(new CustomError('Erro ao limpar o carrinho.', 500));
    }
};

// **Função para finalizar a compra do carrinho**
exports.purchaseCart = async (req, res, next) => {
    try {
        const cart = await CartRepository.getCartById(req.params.cid);
        if (!cart) {
            return next(new CustomError('Carrinho não encontrado.', 404));
        }

        let totalAmount = 0;
        let unavailableProducts = [];

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

        if (totalAmount > 0) {
            const ticket = await TicketRepository.createTicket({
                amount: totalAmount,
                purchaser: req.session.userEmail
            });

            const subject = 'Confirmação de Compra - Seu Ticket';
            const text = `Olá, ${req.session.userEmail}! Sua compra foi realizada com sucesso. Valor total: $${totalAmount}. Obrigado por comprar conosco!`;
            const html = `
                <h2>Confirmação de Compra</h2>
                <p>Olá, ${req.session.userEmail}!</p>
                <p>Sua compra foi realizada com sucesso. Valor total: <strong>$${totalAmount}</strong>.</p>
                <p>Obrigado por comprar conosco!</p>
            `;

            await sendEmail(req.session.userEmail, subject, text, html);

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
            return next(new CustomError('Nenhum produto pôde ser comprado.', 400));
        }
    } catch (error) {
        next(new CustomError('Erro ao finalizar a compra.', 500));
    }
};
