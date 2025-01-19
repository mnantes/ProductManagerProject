const express = require('express');
const { createTicket, getTicketById } = require('../controllers/TicketController');
const { isUser } = require('../middlewares/authMiddleware'); // Apenas usuários podem comprar

const router = express.Router();

// Rota para criar um novo ticket (somente usuários podem realizar compras)
router.post('/', isUser, createTicket);

// Rota para obter um ticket pelo ID
router.get('/:tid', getTicketById);

module.exports = router;
