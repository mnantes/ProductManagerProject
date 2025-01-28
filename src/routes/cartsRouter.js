console.log('Carts Router carregado corretamente.');

const express = require('express');
const {
    getCartById,
    createCart,
    addProductToCart,
    updateCart,
    updateProductQuantity,
    clearCart,
    purchaseCart
} = require('../controllers/CartController'); 
const { isUser } = require('../middlewares/authMiddleware'); 

const router = express.Router();

router.post('/', createCart);
router.get('/:cid', getCartById);
router.post('/:cid/product/:pid', isUser, addProductToCart); // ✅ Agora aceita admin e user
router.put('/:cid', updateCart);
router.put('/:cid/products/:pid', updateProductQuantity);
router.delete('/:cid', clearCart);
router.post('/:cid/purchase', isUser, purchaseCart);

module.exports = router;
