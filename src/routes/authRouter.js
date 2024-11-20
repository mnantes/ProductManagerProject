const express = require('express');
const router = express.Router();

// Rota para exibir a página de registro
router.get('/register', (req, res) => {
  res.render('register'); 
});

// Rota para processar o registro do usuário
router.post('/register', (req, res) => {
  const { email, password } = req.body;
  
  // Define o usuário como autenticado e atribui a função de "user"
  req.session.userEmail = email;
  req.session.userRole = 'user'; 
  req.session.isAuthenticated = true;

  // Redireciona para a página de login após o registro
  res.redirect('/auth/login');
});

// Rota para exibir a página de login
router.get('/login', (req, res) => {
  res.render('login'); 
});

// Rota para processar o login do usuário
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Verificação de login para o usuário admin
  if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
    req.session.userEmail = email;
    req.session.userRole = 'admin';
    req.session.isAuthenticated = true;
    return res.redirect('/products'); 
  }

  // Login como usuário padrão
  req.session.userEmail = email;
  req.session.userRole = 'user';
  req.session.isAuthenticated = true;
  
  res.redirect('/products'); 
});

// Rota para logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Erro ao fazer logout' });
    res.redirect('/auth/login'); 
  });
});

module.exports = router;
