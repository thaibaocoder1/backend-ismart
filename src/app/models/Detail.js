const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Detail = new Schema(
  {
    orderID: { type: mongoose.Types.ObjectId, ref: 'Order', require: true },
    price: { type: Number, require: true },
    quantity: { type: Number, require: true },
    productID: { type: mongoose.Types.ObjectId, ref: 'Product', require: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Detail', Detail);
