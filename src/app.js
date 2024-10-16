const express = require('express');
const { Server } = require('socket.io');
const handlebars = require('express-handlebars');
const productsRouter = require('./routes/productsRouter');
const cartsRouter = require('./routes/cartsRouter');
const ProductManager = require('./managers/ProductManager');

const app = express();
const port = 8080;

// Handlebars
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


app.use(express.static('public'));


const productManager = new ProductManager('products.json');

// rota home.handlebars
app.get('/', async (req, res) => {
  const products = await productManager.getProducts();
  res.render('home', { products });
});


app.get('/realtimeproducts', async (req, res) => {
  const products = await productManager.getProducts();
  res.render('realTimeProducts', { products });
});


const server = app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// Configurar WebSocket
const io = new Server(server);


io.on('connection', (socket) => {
  console.log('Novo cliente conectado');


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
