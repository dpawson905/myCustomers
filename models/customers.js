const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  tech: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  firstName: {
    type: String,
    lowercase: true
  },
  lastName: {
    type: String,
    lowercase: true
  },
  companyName: {
    type: String,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  location: String,
  coordinates: Array,
  email: {
    type: string,
    unique: true,
    lowercase: true
  },
  preference: {
    type: String,
    lowercase: true,
    required: true
  }
})

module.exports = mongoose.model('Customer', CustomerSchema);