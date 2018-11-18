const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: [true, 'This email address already exists in our database'],
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: [true, 'This username already exists in our database'],
    unique: true,
    lowercase: true,
    trim: true
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
  image: String,
  isVerified: {
    type: Boolean,
    required: true
  },
  deactivated: {
    type: Boolean,
    required: true,
    default: false
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  },
  twilioNumber: String,
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  route: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

UserSchema.plugin(passportLocalMongoose, {
  limitAttempts: true,
  interval: 100,
  // 300000ms is 5 min
  maxInterval: 300000,
  // This will completely lock out an account and requires user intervention.
  maxAttempts: 10,
  // unlockInterval: 300000
});

 

module.exports = mongoose.model('User', UserSchema);