const express = require('express');
const bcrypt = require('bcrypt'); // Importa o bcrypt para hash de senhas
const router = express.Router();

// Simulando armazenamento de usuários (pode ser substituído por um banco de dados no futuro)
const users = []; 

// Rota para exibir a página de registro
router.get('/register', (req, res) => {
  res.render('register'); 
});

// Rota para processar o registro do usuário
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Verifica se o email já está registrado
  const userExists = users.find(user => user.email === email);
  if (userExists) {
    return res.status(400).send('Usuário já registrado');
  }

  try {
    // Gera o hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Salva o usuário no "banco de dados"
    users.push({ email, password: hashedPassword, role: 'user' });

    // Redireciona para a página de login
    res.redirect('/auth/login');
  } catch (error) {
    res.status(500).send('Erro ao registrar o usuário');
  }
});

// Rota para exibir a página de login
router.get('/login', (req, res) => {
  res.render('login'); 
});

// Rota para processar o login do usuário
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Busca o usuário pelo email
  const user = users.find(user => user.email === email);
  if (!user) {
    return res.status(400).send('Usuário não encontrado');
  }

  try {
    // Compara a senha fornecida com o hash armazenado
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('Senha inválida');
    }

    // Define os dados de sessão
    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    req.session.isAuthenticated = true;

    res.redirect('/products');
  } catch (error) {
    res.status(500).send('Erro ao fazer login');
  }
});

// Rota para logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Erro ao fazer logout' });
    res.redirect('/auth/login'); 
  });
});

module.exports = router;
