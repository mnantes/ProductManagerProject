const express = require('express');
const { Server } = require('socket.io');
const handlebars = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const productsRouter = require('./routes/productsRouter');
const cartsRouter = require('./routes/cartsRouter');
const viewsRouter = require('./routes/viewsRouter');
const authRouter = require('./routes/authRouter');
const connectDB = require('./config/mongo');
const ProductManager = require(__dirname + '/managers/ProductManager');
const Message = require('./models/Message');
const config = require('./config/config'); // Importa o arquivo config

const app = express();
const port = 8080;

// Conectar ao MongoDB
connectDB();

// Configurar sessão
app.use(
  session({
    secret: config.sessionSecret, // Atualizado para usar o config
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar estratégia do GitHub
passport.use(
  new GitHubStrategy(
    {
      clientID: config.githubClientId, // Atualizado para usar o config
      clientSecret: config.githubClientSecret, // Atualizado para usar o config
      callbackURL: 'http://localhost:8080/auth/github/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// Serialização e desserialização do usuário
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configurar Handlebars com acesso a propriedades de protótipos
app.engine(
  'handlebars',
  handlebars.engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para verificar se o usuário está logado
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated || req.isAuthenticated();
  res.locals.userRole = req.session?.userRole || 'user';
  next();
});

// Middleware para proteger rotas de produtos para usuários autenticados
function checkAuth(req, res, next) {
  if (req.isAuthenticated() || req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/auth/login');
  }
}

// Redirecionar logout para o caminho correto
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Erro ao fazer logout' });
    res.redirect('/auth/login');
  });
});

// Configurar rotas
app.use('/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', checkAuth, viewsRouter);

// Redireciona para login se não autenticado
app.get('/', (req, res) => {
  if (!req.isAuthenticated() && !req.session.isAuthenticated) {
    return res.redirect('/auth/login');
  }
  res.redirect('/products');
});

// Rota para realTimeProducts.handlebars
app.get('/realtimeproducts', async (req, res) => {
  const products = await productManager.getProducts();
  res.render('realTimeProducts', { products });
});

// Rota para chat.handlebars
app.get('/chat', (req, res) => {
  res.render('chat');
});

// Rotas do GitHub para login
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/login' }),
  (req, res) => {
    req.session.isAuthenticated = true;
    res.redirect('/products');
  }
);

// Iniciar servidor
const server = app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// Configurar WebSocket
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  Message.find().then((messages) => {
    socket.emit('messageHistory', messages);
  });

  socket.on('sendMessage', async (data) => {
    const newMessage = new Message(data);
    await newMessage.save();
    io.emit('newMessage', data);
  });

  socket.on('addProduct', async (productData) => {
    try {
      const newProduct = await productManager.addProduct(productData);
      const products = await productManager.getProducts();
      io.emit('updateProducts', products);
    } catch (error) {
      console.error(error.message);
    }
  });

  socket.on('deleteProduct', async (productId) => {
    try {
      await productManager.deleteProduct(productId);
      const products = await productManager.getProducts();
      io.emit('updateProducts', products);
    } catch (error) {
      console.error(error.message);
    }
  });
});
