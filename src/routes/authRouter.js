const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const config = require('../config/config');
const UserDTO = require('../dto/UserDTO');
const { sendEmail } = require('../services/emailService'); // Importa a função de envio de email
const router = express.Router();

// Simulando armazenamento de usuários (pode ser substituído por um banco de dados no futuro)
const users = [];

// Configurando o Passport com a estratégia GitHub
passport.use(
  new GitHubStrategy(
    {
      clientID: config.githubClientId,
      clientSecret: config.githubClientSecret,
      callbackURL: 'http://localhost:8080/auth/github/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      let user = users.find((user) => user.email === profile.emails[0].value);
      if (!user) {
        user = {
          email: profile.emails[0].value,
          password: null,
          role: 'user',
        };
        users.push(user);
      }
      done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser((email, done) => {
  const user = users.find((user) => user.email === email);
  done(null, user);
});

// Rota para obter os dados do usuário autenticado
router.get('/current', (req, res) => {
  if (!req.isAuthenticated() || !req.session.isAuthenticated) {
    return res.status(401).json({ status: 'error', message: 'Usuário não autenticado' });
  }

  const userDTO = new UserDTO({
    email: req.session.userEmail,
    role: req.session.userRole
  });

  res.status(200).json({ status: 'success', data: userDTO });
});

// Rota para exibir a página de registro
router.get('/register', (req, res) => {
  res.render('register');
});

// Rota para processar o registro do usuário
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const userExists = users.find((user) => user.email === email);
  if (userExists) {
    return res.status(400).send('Usuário já registrado');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword, role: 'user' });

    // Enviar email de boas-vindas
    const subject = 'Bem-vindo ao nosso e-commerce!';
    const text = `Olá, ${email}! Obrigado por se registrar em nossa plataforma.`;
    const html = `
      <h2>Bem-vindo ao nosso e-commerce! 🎉</h2>
      <p>Olá, ${email}!</p>
      <p>Estamos felizes por tê-lo conosco. Explore nossos produtos e boas compras! 🛒</p>
    `;

    await sendEmail(email, subject, text, html);

    res.redirect('/auth/login');
  } catch (error) {
    console.error('Erro ao registrar o usuário:', error.message);
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

  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(400).send('Usuário não encontrado');
  }

  try {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('Senha inválida');
    }

    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    req.session.isAuthenticated = true;

    res.redirect('/products');
  } catch (error) {
    res.status(500).send('Erro ao fazer login');
  }
});

// Rota para autenticação via GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/login' }),
  (req, res) => {
    req.session.isAuthenticated = true;
    req.session.userEmail = req.user.email;
    req.session.userRole = req.user.role;
    res.redirect('/products');
  }
);

// Rota para logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Erro ao fazer logout' });
    res.redirect('/auth/login');
  });
});

module.exports = router;
console.log('Auth Router carregado corretamente.');
