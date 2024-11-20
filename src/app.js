const express = require('express');
const { Server } = require('socket.io');
const handlebars = require('express-handlebars');
const session = require('express-session');
const productsRouter = require('./routes/productsRouter');
const cartsRouter = require('./routes/cartsRouter');
const viewsRouter = require('./routes/viewsRouter');
const authRouter = require('./routes/authRouter'); // Importa o authRouter
const connectDB = require('./config/mongo');
const ProductManager = require(__dirname + '/managers/ProductManager');
const Message = require('./models/Message');

const app = express();
const port = 8080;

// Conectar ao MongoDB
connectDB();

// Configurar sessão
app.use(
  session({
    secret: 'seuSegredoSuperSeguro',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

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
  res.locals.isAuthenticated = req.session.isAuthenticated;
  res.locals.userRole = req.session.userRole || 'user';
  next();
});

// Middleware para proteger rotas de produtos para usuários autenticados
function checkAuth(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/auth/login'); // Redireciona para o login se não estiver autenticado
  }
}

// Configurar rotas
app.use('/auth', authRouter); // Configura as rotas de autenticação
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/products', checkAuth, viewsRouter); // Protege a rota de produtos

// Servir arquivos estáticos
app.use(express.static('public'));

// Instanciar ProductManager
const productManager = new ProductManager('products.json');

// Rota para home.handlebars
app.get('/', async (req, res) => {
  const products = await productManager.getProducts();
  res.render('home', { products });
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
