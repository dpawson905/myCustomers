const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 43200
  }
});

module.exports = mongoose.model('Token', tokenSchema);