const Ticket = require('../models/Ticket');
const { v4: uuidv4 } = require('uuid'); // Para gerar códigos únicos

class TicketDAO {
    async createTicket(amount, purchaser) {
        try {
            const newTicket = new Ticket({
                code: uuidv4(), // Gera um código único para o ticket
                amount,
                purchaser
            });

            return await newTicket.save();
        } catch (error) {
            console.error("Erro ao criar ticket:", error.message);
            throw new Error("Não foi possível criar o ticket.");
        }
    }

    async getTicketById(ticketId) {
        try {
            return await Ticket.findById(ticketId);
        } catch (error) {
            throw new Error("Erro ao buscar ticket: " + error.message);
        }
    }
}

module.exports = new TicketDAO();
