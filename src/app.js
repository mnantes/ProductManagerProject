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
const chatRouter = require('./routes/chatRouter');
const ticketRouter = require('./routes/ticketRouter');
const connectDB = require('./config/mongo');
const ProductRepository = require('./repositories/ProductRepository');
const Message = require('./models/Message');
const config = require('./config/config');
const logger = require('./utils/logger');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
const port = 8080;

// Conectar ao MongoDB
logger.info("Conectando ao banco de dados MongoDB...");
connectDB().then(() => {
  logger.info("Conexão com MongoDB estabelecida.");
}).catch(error => {
  logger.fatal("Erro ao conectar ao MongoDB:", error.message);
});

// Middleware de Logger
app.use((req, res, next) => {
  req.logger = logger;
  logger.http(`[${req.method}] ${req.url}`);
  next();
});

// Rota de Teste para Logs
app.get('/loggerTest', (req, res) => {
  req.logger.debug("Log de DEBUG registrado!");
  req.logger.http("Log de HTTP registrado!");
  req.logger.info("Log de INFO registrado!");
  req.logger.warning("Log de WARNING registrado!");
  req.logger.error("Log de ERROR registrado!");
  req.logger.fatal("Log de FATAL registrado!");

  res.send("Logs gerados! Confira o console ou os arquivos na pasta logs.");
});

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

// Redirecionar logout com logging
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      req.logger.error("Erro ao fazer logout:", err.message);
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    req.logger.info("Usuário deslogado com sucesso.");
    res.redirect('/auth/login');
  });
});

// Página inicial - Redireciona para login se não autenticado
app.get('/', (req, res) => {
  if (!req.isAuthenticated() && !req.session.isAuthenticated) {
    req.logger.warning("Usuário não autenticado tentou acessar a página inicial.");
    return res.redirect('/auth/login');
  }
  res.redirect('/products');
});

// Configurar rotas
logger.info('Registrando rotas...');
try {
  logger.info('Registrando Auth Router...');
  app.use('/auth', authRouter);
  logger.info('Auth Router registrado com sucesso.');

  logger.info('Registrando Products Router...');
  app.use('/api/products', productsRouter);
  logger.info('Products Router registrado com sucesso.');

  logger.info('Registrando Carts Router...');
  app.use('/api/carts', cartsRouter);
  logger.info('Carts Router registrado com sucesso.');

  logger.info('Registrando Chat Router...');
  app.use('/api/chat', chatRouter);
  logger.info('Chat Router registrado com sucesso.');

  logger.info('Registrando Ticket Router...');
  app.use('/api/tickets', ticketRouter);
  logger.info('Ticket Router registrado com sucesso.');

  logger.info('Registrando Views Router...');
  app.use('/', viewsRouter);
  logger.info('Views Router registrado com sucesso.');
} catch (error) {
  logger.error('Erro ao registrar rotas:', error.message);
}

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
const server = app.listen(port, () => {
  logger.info(`Servidor rodando em http://localhost:${port}`);
});

// Configurar WebSocket
const io = new Server(server);

io.on('connection', (socket) => {
  logger.info('Novo cliente conectado');
  Message.find().then((messages) => {
    socket.emit('messageHistory', messages);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const newMessage = new Message(data);
      await newMessage.save();
      io.emit('newMessage', data);
      logger.info("Nova mensagem enviada pelo usuário:", data);
    } catch (error) {
      logger.error("Erro ao salvar mensagem:", error.message);
    }
  });

  socket.on('addProduct', async (productData) => {
    try {
      const newProduct = await ProductRepository.createProduct(productData);
      const products = await ProductRepository.getProducts();
      io.emit('updateProducts', products);
      logger.info("Produto adicionado com sucesso:", newProduct.title);
    } catch (error) {
      logger.error("Erro ao adicionar produto:", error.message);
    }
  });

  socket.on('deleteProduct', async (productId) => {
    try {
      await ProductRepository.deleteProduct(productId);
      const products = await ProductRepository.getProducts();
      io.emit('updateProducts', products);
      logger.warning("Produto deletado:", productId);
    } catch (error) {
      logger.error("Erro ao deletar produto:", error.message);
    }
  });
});
