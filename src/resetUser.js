require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const config = require('./config/config');

const resetUser = async () => {
  try {
    await mongoose.connect(config.mongoUri, {});

    console.log('Conectado ao MongoDB');

    // Excluir usuário antigo, caso já exista
    await User.deleteOne({ email: 'profe@profe.com' });

    // Criar novo usuário com senha corretamente criptografada
    const hashedPassword = await bcrypt.hash('1234', 10);
    await User.create({ email: 'profe@profe.com', password: hashedPassword, role: 'admin' });

    console.log('Usuário recriado com sucesso!');
  } catch (error) {
    console.error('Erro ao resetar usuário:', error.message);
  } finally {
    mongoose.disconnect();
  }
};

resetUser();
