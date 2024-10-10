const express = require('express');
const productsRouter = require('./routes/productsRouter');
const cartsRouter = require('./routes/cartsRouter');

const app = express();
app.use(express.json());
const port = 8080;

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
