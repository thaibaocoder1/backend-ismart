const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const Schema = mongoose.Schema;

const User = new Schema(
  {
    fullname: String,
    username: String,
    email: String,
    phone: String,
    password: {
      type: String,
      default: 'passwordtemp',
    },
    password_confirmation: {
      type: String,
      default: 'passwordtemp',
    },
    role: {
      type: String,
      default: 'User',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default: 'https://placehold.co/200x200',
    },
    refreshToken: String,
    resetedAt: Number,
    timeExpireRecover: Number,
    recoverHashCode: String,
  },
  { timestamps: true },
);

User.plugin(mongooseDelete, { overrideMethods: 'all', deletedAt: true });

module.exports = mongoose.model('User', User);
