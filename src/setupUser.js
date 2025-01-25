require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const config = require('./config/config');

const createUser = async () => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Conectado ao MongoDB');

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email: 'profe@profe.com' });
    if (existingUser) {
      console.log('Usuário já existe no banco de dados.');
    } else {
      // Criar usuário com senha criptografada
      const hashedPassword = await bcrypt.hash('1234', 10);
      await User.create({ email: 'profe@profe.com', password: hashedPassword, role: 'admin' });

      console.log('Usuário criado com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
  } finally {
    mongoose.disconnect();
  }
};

createUser();
