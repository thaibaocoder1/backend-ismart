const express = require('express');
const router = express.Router();

const catalogController = require('../app/controllers/CatalogController');

router.patch('/update/:id', catalogController.update);
router.post('/add', catalogController.add);
router.get('/:id', catalogController.detail);
router.get('/', catalogController.index);

module.exports = router;
