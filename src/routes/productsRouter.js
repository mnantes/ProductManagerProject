const express = require('express');
const ProductManager = require('../managers/ProductManager');
const router = express.Router();
const productManager = new ProductManager('products.json');

router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const products = await productManager.getProducts(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'ID do produto inválido' });
    }

    const product = await productManager.getProductById(productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Produto não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newProduct = await productManager.addProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'ID do produto inválido' });
    }

    const updatedProduct = await productManager.updateProduct(productId, req.body);
    res.json(updatedProduct);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'ID do produto inválido' });
    }

    await productManager.deleteProduct(productId);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
