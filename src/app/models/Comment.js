const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Comment = new Schema(
  {
    text: { type: String, require: true },
    userID: { type: mongoose.Types.ObjectId, ref: 'User' },
    productID: { type: mongoose.Types.ObjectId, ref: 'Product' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Comment', Comment);
