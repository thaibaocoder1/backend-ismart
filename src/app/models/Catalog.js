const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const Schema = mongoose.Schema;

const Catalog = new Schema(
  {
    title: String,
    slug: { type: String, slug: 'title', unique: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Catalog', Catalog);
