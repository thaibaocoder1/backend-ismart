const express = require('express');
const router = express.Router();

const detailController = require('../app/controllers/DetailController');

router.post('/add', detailController.add);
router.get('/statistical', detailController.statistical);
router.get('/:id', detailController.index);

module.exports = router;
