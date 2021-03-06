const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const CustomerSchema = new Schema({
  tech: {
    id: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    username: String,
    route: String
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
    required: true
  },
  address: {
    type: String,
    required: true
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  properties: {
    description: String
  },
  preference: {
    type: String,
    lowercase: true,
    required: true
  },
  frequency: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  servicePrefs: {
    type: String,
    required: true,
    lowercase: true
  },
  week: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  fromTime: {
    type: String,
    required: true
  },
  toTime: {
    type: String,
    required: true
  },
  image: String,
  serviceDates: {
    type: [String]
  },
  notes: [
    {
    type: Schema.Types.ObjectId,
    ref: "Note"
    }
  ]
}, {timestamps: true});

CustomerSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  phoneNumber: "text",
  address: "text"
});

CustomerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Customer", CustomerSchema);
