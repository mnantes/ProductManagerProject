const express = require('express');
const ProductManager = require('./productManager');

const app = express();
const port = 3000;

// Instanciando ProductManager com o arquivo products.json
const productManager = new ProductManager('products.json');

// Rota para obter todos os produtos, com suporte ao parâmetro de query ?limit=
app.get('/products', async (req, res) => {
  const limit = parseInt(req.query.limit);
  const products = await productManager.getProducts();

  if (limit && !isNaN(limit)) {
    res.json(products.slice(0, limit));
  } else {
    res.json(products);
  }
});

// Rota para obter um produto específico pelo id
app.get('/products/:pid', async (req, res) => {
  const productId = parseInt(req.params.pid);
  const product = await productManager.getProductById(productId);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Produto não encontrado' });
  }
});

// Inicializando o servidor na porta 3000
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
