const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const config = require('../config/config');
const UserDTO = require('../dto/UserDTO');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

// Configuração do Passport com GitHub
passport.use(
  new GitHubStrategy(
    {
      clientID: config.githubClientId,
      clientSecret: config.githubClientSecret,
      callbackURL: 'http://localhost:8080/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error('GitHub não forneceu um email válido.'));
        }

        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            email,
            password: null,
            role: 'user',
          });

          user = await user.save();
        }

        if (!user._id) {
          return done(new Error('Usuário criado, mas sem ID válido.'), null);
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialização e Desserialização do Usuário
passport.serializeUser((user, done) => {
  try {
    if (!user || !user._id) {
      throw new Error('Usuário inválido ou sem ID para serializar.');
    }
    done(null, user._id.toString());
  } catch (error) {
    done(error, null);
  }
});

passport.deserializeUser(async (id, done) => {
  try {
    if (!id) {
      throw new Error('ID do usuário não encontrado na desserialização.');
    }
    const user = await User.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado no banco de dados.');
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Rota para obter os dados do usuário autenticado
router.get('/current', (req, res) => {
  if (!req.isAuthenticated() && !req.session.isAuthenticated) {
    return res.status(401).json({ status: 'error', message: 'Usuário não autenticado' });
  }

  const userDTO = new UserDTO({
    email: req.session.userEmail,
    role: req.session.userRole
  });

  res.status(200).json({ status: 'success', data: userDTO });
});

// Página de Registro
router.get('/register', (req, res) => {
  res.render('register');
});

// Registro de Usuário
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).send('Usuário já registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword, role: 'user' });

    // Enviar email de boas-vindas
    const subject = 'Bem-vindo ao nosso e-commerce!';
    const text = `Olá, ${email}! Obrigado por se registrar em nossa plataforma.`;
    const html = `
      <h2>Bem-vindo ao nosso e-commerce!</h2>
      <p>Olá, ${email}!</p>
      <p>Estamos felizes por tê-lo conosco. Explore nossos produtos e boas compras!</p>
    `;

    await sendEmail(email, subject, text, html);

    res.redirect('/auth/login');
  } catch (error) {
    console.error('Erro ao registrar o usuário:', error.message);
    res.status(500).send('Erro ao registrar o usuário');
  }
});

// Página de Login
router.get('/login', (req, res) => {
  res.render('login');
});

// Login de Usuário
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('Usuário não encontrado');
    }

    if (!user.password) {
      return res.status(400).send('Faça login pelo GitHub');
    }

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

// Rota de Autenticação via GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/login' }),
  async (req, res) => {
    try {
      if (!req.user) {
        throw new Error('Usuário não foi autenticado pelo GitHub.');
      }

      req.session.isAuthenticated = true;
      req.session.userEmail = req.user.email;
      req.session.userRole = req.user.role;
      res.redirect('/products');
    } catch (error) {
      console.error('Erro no callback do GitHub:', error.message);
      res.redirect('/auth/login');
    }
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Erro ao fazer logout' });
    res.redirect('/auth/login');
  });
});

module.exports = router;
console.log('Auth Router carregado corretamente.');
