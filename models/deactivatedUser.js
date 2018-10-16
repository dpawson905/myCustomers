const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deactivatedSchema = new Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deactivated: {
    type: String,
    required: true,
    default: false
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 43200
  }
});

module.exports = mongoose.model('DeactivatedUser', deactivatedSchema);