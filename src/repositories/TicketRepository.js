const TicketDAO = require('../dao/TicketDAO');

class TicketRepository {
    async createTicket(amount, purchaser) {
        return await TicketDAO.createTicket(amount, purchaser);
    }

    async getTicketById(ticketId) {
        return await TicketDAO.getTicketById(ticketId);
    }
}

module.exports = new TicketRepository();
