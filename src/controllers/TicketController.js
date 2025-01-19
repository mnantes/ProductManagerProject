const TicketRepository = require('../repositories/TicketRepository');
const { sendEmail } = require('../services/emailService');

exports.createTicket = async (req, res) => {
    try {
        const { amount, purchaser } = req.body;

        if (!amount || !purchaser) {
            return res.status(400).json({ status: 'error', message: 'Campos obrigatórios: amount, purchaser' });
        }

        // Criar ticket
        const newTicket = await TicketRepository.createTicket({ amount, purchaser });

        // Enviar email de confirmação para o comprador
        const subject = 'Confirmação de Compra - Seu Ticket 🎟️';
        const text = `Olá, ${purchaser}! Sua compra foi realizada com sucesso. Valor total: $${amount}. Obrigado por comprar conosco!`;
        const html = `
            <h2>Confirmação de Compra 🎟️</h2>
            <p>Olá, ${purchaser}!</p>
            <p>Sua compra foi realizada com sucesso. Valor total: <strong>$${amount}</strong>.</p>
            <p>Obrigado por comprar conosco!</p>
        `;

        await sendEmail(purchaser, subject, text, html);

        res.status(201).json({ status: 'success', data: newTicket });

    } catch (error) {
        console.error("Erro ao criar ticket:", error.message);
        res.status(500).json({ status: 'error', message: 'Erro ao criar ticket.' });
    }
};

exports.getTicketById = async (req, res) => {
    try {
        const ticket = await TicketRepository.getTicketById(req.params.tid);
        if (!ticket) {
            return res.status(404).json({ status: 'error', message: 'Ticket não encontrado.' });
        }
        res.status(200).json({ status: 'success', data: ticket });
    } catch (error) {
        console.error("Erro ao buscar ticket:", error.message);
        res.status(500).json({ status: 'error', message: 'Erro ao buscar ticket.' });
    }
};
