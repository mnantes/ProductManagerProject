const express = require('express');
const bcrypt = require('bcrypt'); // Importa o bcrypt para hash de senhas
const passport = require('passport'); // Importa o Passport
const GitHubStrategy = require('passport-github2').Strategy; // Importa a estratégia GitHub
const router = express.Router();

// Simulando armazenamento de usuários (pode ser substituído por um banco de dados no futuro)
const users = [];

// Configurando o Passport com a estratégia GitHub
passport.use(
  new GitHubStrategy(
    {
      clientID: 'SEU_CLIENT_ID',
      clientSecret: 'SEU_CLIENT_SECRET',
      callbackURL: 'http://localhost:8080/auth/github/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // Busca ou cria um usuário com base no perfil do GitHub
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

// Serialização e desserialização de usuário
passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser((email, done) => {
  const user = users.find((user) => user.email === email);
  done(null, user);
});

// Rota para exibir a página de registro
router.get('/register', (req, res) => {
  res.render('register');
});

// Rota para processar o registro do usuário
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Verifica se o email já está registrado
  const userExists = users.find((user) => user.email === email);
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
  const user = users.find((user) => user.email === email);
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

// Rota para autenticação via GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// Rota de callback do GitHub
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/login' }),
  (req, res) => {
    // Autenticação bem-sucedida, redireciona para a página de produtos
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
