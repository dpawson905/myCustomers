const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  tech: {
    id: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
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
  address: String,
  coordinates: Array,
  email: {
    type: String,
    lowercase: true
  },
  preference: {
    type: String,
    lowercase: true,
    required: true
  },
  frequency: String,
  week: {
    type: String,
    required: true,
    trim: true
  },
  day: {
    type: String,
    required: true,
    trim: true
  },
  time: {
    type: String,
    required: true
  },
  image: String,
  notes: [
    {
    type: Schema.Types.ObjectId,
    ref: "Note"
    }
  ]
});

CustomerSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  phoneNumber: "text"
});

module.exports = mongoose.model("Customer", CustomerSchema);
