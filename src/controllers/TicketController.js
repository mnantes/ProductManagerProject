const TicketRepository = require('../repositories/TicketRepository');
const { sendEmail } = require('../services/emailService');
const { CustomError } = require('../middlewares/errorHandler');

exports.createTicket = async (req, res, next) => {
    try {
        const { amount, purchaser } = req.body;

        if (!amount || !purchaser) {
            return next(new CustomError('Campos obrigatórios: amount, purchaser.', 400));
        }

        // Criar ticket
        const newTicket = await TicketRepository.createTicket({ amount, purchaser });

        // Enviar email de confirmação para o comprador
        const subject = 'Confirmação de Compra - Seu Ticket';
        const text = `Olá, ${purchaser}! Sua compra foi realizada com sucesso. Valor total: $${amount}. Obrigado por comprar conosco!`;
        const html = `
            <h2>Confirmação de Compra</h2>
            <p>Olá, ${purchaser}!</p>
            <p>Sua compra foi realizada com sucesso. Valor total: <strong>$${amount}</strong>.</p>
            <p>Obrigado por comprar conosco!</p>
        `;

        await sendEmail(purchaser, subject, text, html);

        res.status(201).json({ status: 'success', data: newTicket });

    } catch (error) {
        next(new CustomError('Erro ao criar ticket.', 500));
    }
};

exports.getTicketById = async (req, res, next) => {
    try {
        const ticket = await TicketRepository.getTicketById(req.params.tid);
        if (!ticket) {
            return next(new CustomError('Ticket não encontrado.', 404));
        }
        res.status(200).json({ status: 'success', data: ticket });
    } catch (error) {
        next(new CustomError('Erro ao buscar ticket.', 500));
    }
};
