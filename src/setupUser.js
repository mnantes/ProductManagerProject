const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const connectDB = require('./config/mongo');

const seedUser = async () => {
  try {
    await connectDB();

    const email = 'profe@profe.com';
    const password = '1234';

    // Verificar se o usuário já existe no banco de dados
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('Usuário já existe no banco de dados.');
    } else {
      // Criar usuário com senha criptografada
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        password: hashedPassword,
        role: 'admin' // Define como admin, pode ser 'user' se preferir
      });

      await newUser.save();
      console.log('Usuário criado com sucesso.');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    mongoose.connection.close();
  }
};

seedUser();
