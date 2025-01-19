const express = require('express');
const { isUser } = require('../middlewares/authMiddleware');
const Message = require('../models/Message');

const router = express.Router();

// Rota para obter o histórico do chat
router.get('/', async (req, res) => {
    try {
        const messages = await Message.find();
        res.status(200).json({ status: 'success', data: messages });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Erro ao buscar mensagens do chat' });
    }
});

// Rota para enviar uma nova mensagem (apenas usuários podem enviar)
router.post('/', isUser, async (req, res) => {
    try {
        const { user, message } = req.body;
        if (!user || !message) {
            return res.status(400).json({ status: 'error', message: 'Usuário e mensagem são obrigatórios' });
        }

        const newMessage = new Message({ user, message });
        await newMessage.save();

        res.status(201).json({ status: 'success', data: newMessage });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Erro ao enviar mensagem' });
    }
});

module.exports = router;
