const express = require('express');
const { Server } = require('socket.io');
const handlebars = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const productsRouter = require('./routes/productsRouter'); // Importação correta
const cartsRouter = require('./routes/cartsRouter'); // Importação correta
const viewsRouter = require('./routes/viewsRouter'); // Importação correta
const authRouter = require('./routes/authRouter'); // Importação correta
const connectDB = require('./config/mongo');
const ProductManager = require('./managers/ProductManager'); // Ajuste de caminho
const Message = require('./models/Message');
const config = require('./config/config'); // Importa o arquivo config

const app = express();
const port = 8080;

// Conectar ao MongoDB
connectDB();

// Configurar sessão
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar estratégia do GitHub
passport.use(
  new GitHubStrategy(
    {
      clientID: config.githubClientId,
      clientSecret: config.githubClientSecret,
      callbackURL: 'http://localhost:8080/auth/github/callback',
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

// Serialização e desserialização do usuário
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Configurar Handlebars
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

// Redirecionar logout
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Erro ao fazer logout' });
    res.redirect('/auth/login');
  });
});

// Configurar rotas
console.log('Registrando rotas...');
try {
  console.log('Registrando Auth Router...');
  app.use('/auth', authRouter);
  console.log('Auth Router registrado com sucesso.');

  console.log('Registrando Products Router...');
  app.use('/api/products', productsRouter);
  console.log('Products Router registrado com sucesso.');

  console.log('Registrando Carts Router...');
  app.use('/api/carts', cartsRouter);
  console.log('Carts Router registrado com sucesso.');

  console.log('Registrando Views Router...');
  app.use('/', checkAuth, viewsRouter);
  console.log('Views Router registrado com sucesso.');
} catch (error) {
  console.error('Erro ao registrar rotas:', error.message);
}

// Página inicial
app.get('/', (req, res) => {
  if (!req.isAuthenticated() && !req.session.isAuthenticated) {
    return res.redirect('/auth/login');
  }
  res.redirect('/products');
});

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
      const newProduct = await ProductManager.addProduct(productData);
      const products = await ProductManager.getProducts();
      io.emit('updateProducts', products);
    } catch (error) {
      console.error(error.message);
    }
  });

  socket.on('deleteProduct', async (productId) => {
    try {
      await ProductManager.deleteProduct(productId);
      const products = await ProductManager.getProducts();
      io.emit('updateProducts', products);
    } catch (error) {
      console.error(error.message);
    }
  });
});
