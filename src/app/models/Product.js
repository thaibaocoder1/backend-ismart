const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const Schema = mongoose.Schema;

const Product = new Schema(
  {
    categoryID: { type: mongoose.Types.ObjectId, ref: 'Catalog' },
    name: String,
    slug: { type: String, slug: 'name' },
    description: String,
    code: { type: String, unique: true },
    price: Number,
    discount: Number,
    thumb: { data: Buffer, contentType: String, fileName: String },
    content: String,
    status: Number,
    sold: { type: Number, default: 0 },
    quantity: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model('Product', Product);
