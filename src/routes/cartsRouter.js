const express = require('express');
const CartManager = require('../managers/CartManager');
const router = express.Router();
const cartManager = new CartManager('carrito.json');

router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(parseInt(req.params.cid));
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
  try {
    const cart = await cartManager.addProductToCart(parseInt(req.params.cid), parseInt(req.params.pid));
    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
