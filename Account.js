const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  }
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
