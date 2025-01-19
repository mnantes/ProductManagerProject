const nodemailer = require('nodemailer');
const config = require('../config/config'); // Importando configurações do Mailtrap

// Configuração do transporte de email com Mailtrap
const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    auth: {
        user: config.mail.auth.user,
        pass: config.mail.auth.pass
    },
    secure: false, // Se fosse um serviço de produção real, isso seria true para o SSL/TLS
    tls: {
        rejectUnauthorized: false // Permite TLS opcional
    }
});

// Função para enviar email
const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: `"Loja E-commerce" <${config.mail.auth.user}>`, // Nome fictício da loja
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado com sucesso: ' + info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Erro ao enviar email:', error);
        throw new Error('Falha no envio do email');
    }
};

module.exports = { sendEmail };
