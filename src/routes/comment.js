const express = require('express');
const router = express.Router();

const commentController = require('../app/controllers/CommentController');

router.post('/add', commentController.add);
router.delete('/delete/:id', commentController.delete);
router.get('/', commentController.index);

module.exports = router;
