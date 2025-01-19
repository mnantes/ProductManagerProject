const { sendEmail } = require('./services/emailService');

const testEmail = async () => {
    try {
        const to = 'seuemail@exemplo.com'; // Substitua pelo seu email real para testar
        const subject = 'Teste de Email - E-commerce';
        const text = 'Este é um email de teste enviado pelo sistema de e-commerce.';
        const html = '<h2>Este é um email de teste</h2><p>Enviado pelo sistema de e-commerce.</p>';

        const result = await sendEmail(to, subject, text, html);
        console.log('✅ Email de teste enviado com sucesso:', result);
    } catch (error) {
        console.error('❌ Erro ao enviar email de teste:', error);
    }
};

testEmail();
