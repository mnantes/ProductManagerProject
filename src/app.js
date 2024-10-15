const express = require('express');
const { Server } = require('socket.io');
const handlebars = require('express-handlebars');
const productsRouter = require('./routes/productsRouter');
const cartsRouter = require('./routes/cartsRouter');
const ProductManager = require('./managers/ProductManager');

const app = express();
const port = 8080;

// Configurar Handlebars
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar rotas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

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

// Iniciar servidor
const server = app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// Configurar WebSocket
const io = new Server(server);

// Lidar com conexões WebSocket
io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  // Atualizar produtos em tempo real
  socket.on('addProduct', async (productData) => {
    const newProduct = await productManager.addProduct(productData);
    const products = await productManager.getProducts();
    io.emit('updateProducts', products); // Enviar lista atualizada para todos os clientes
  });

  socket.on('deleteProduct', async (productId) => {
    await productManager.deleteProduct(productId);
    const products = await productManager.getProducts();
    io.emit('updateProducts', products); // Enviar lista atualizada para todos os clientes
  });
});
