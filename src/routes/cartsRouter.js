const express = require('express');
const CartManager = require('../managers/CartManager'); // Importa o CartManager atualizado
const router = express.Router();
const cartManager = new CartManager(); // Usando o MongoDB para persistência

router.post('/', async (req, res) => {
  try {
    const { products = [] } = req.body;
    const newCart = await cartManager.createCart(products);
    res.status(201).json(newCart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).json({ error: 'Carrinho não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  console.log("Requisição recebida com params:", req.params); // Adicionado para verificação dos parâmetros
  try {
    const cart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Novo endpoint para atualizar o carrinho com uma lista de produtos
router.put('/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const products = req.body.products;
    const updatedCart = await cartManager.updateCart(cartId, products);
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Novo endpoint para atualizar a quantidade de um produto específico no carrinho
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Novo endpoint para remover todos os produtos do carrinho
router.delete('/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const updatedCart = await cartManager.clearCart(cartId);
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
