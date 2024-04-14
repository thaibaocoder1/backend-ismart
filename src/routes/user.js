const express = require('express');
const router = express.Router();
const authMethod = require('../auth/AuthController');
const upload = require('../middlewares/multer');

const userController = require('../app/controllers/UserController');

router.post('/login', userController.check);

router.get('/auth/refresh', userController.refresh);
router.get('/auth/refreshAdmin', userController.refreshAdmin);
router.get('/verify/:id', userController.verify);
router.post('/active/:id', userController.active);
router.post('/recovery', userController.recovery);
router.get('/confirm', userController.confirm);
router.get('/logout', userController.logout);

router.get('/:id', userController.detail);
router.post(
  '/add',
  authMethod.validatePayload,
  upload.single('imageUrl'),
  userController.add,
);
router.post('/add/form', upload.single('imageUrl'), userController.addForm);
router.post('/forgot', userController.forgot);
router.patch('/update/:id', upload.single('imageUrl'), userController.update);
router.patch('/update-field/:id', userController.updateField);
router.patch('/restore/:id', userController.restore);
router.patch('/reset/:id', userController.reset);
router.delete('/delete/:id', userController.delete);
router.get('/', userController.index);

module.exports = router;
