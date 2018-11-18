const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TempUserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: [true, 'This email address already exists in our database'],
    lowercase: true
  },
  username: {
    type: String,
    required: [true, 'This username already exists in our database'],
    unique: true,
    lowercase: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 604800
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  route: {
    type: String,
    required: true,
    trim: true
  }
});

module.exports = mongoose.model('TempUser', TempUserSchema);