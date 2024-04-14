const express = require('express');
const router = express.Router();

const orderController = require('../app/controllers/OrderController');

router.delete('/delete/:id', orderController.delete);
router.patch('/update/:id', orderController.update);
router.post('/add', orderController.add);
router.get('/invoice/:id', orderController.invoice);
router.get('/detail/:id', orderController.detail);
router.get('/statistical', orderController.statistical);
router.get('/', orderController.index);

module.exports = router;
