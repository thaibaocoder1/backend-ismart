const productRouter = require('./product');
const catalogRouter = require('./catalog');
const userRouter = require('./user');
const commentRouter = require('./comment');
const orderRouter = require('./order');
const detailRouter = require('./detail');
const authMethod = require('../auth/AuthController');

function routes(app) {
  app.use('/api/products', authMethod.verifyAccount, productRouter);
  app.use('/api/users', authMethod.verifyAccount, userRouter);
  app.use('/api/comments', authMethod.verifyAccount, commentRouter);
  app.use('/api/orders', authMethod.verifyAccount, orderRouter);
  app.use('/api/orderDetails', authMethod.verifyAccount, detailRouter);
  app.use('/api/catalogs', authMethod.verifyAccount, catalogRouter);
}
module.exports = routes;
