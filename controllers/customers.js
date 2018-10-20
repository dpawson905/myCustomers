const debug = require('debug')('customers:newCustomer');
const User = require('../models/user');
const Customer = require('../models/customers');
const {
  MB_API
} = require('../config/mapbox');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({
  accessToken: MB_API
});

const {
  twilioSid,
  twilioToken
} = require('../config/twilio');

const accountSid = twilioSid;
const authToken = twilioToken;
const client = require('twilio')(accountSid, authToken);

module.exports = {
  async postCustomer(req, res) {
    let response = await geocodingClient.forwardGeocode({
      query: req.body.address,
      limit: 1
    }).send();
    let coordinates = response.body.features[0].geometry.coordinates;
    let newCustomer = {
      week: req.body.week,
      day: req.body.day,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      tech: {
        id: req.user._id,
        username: req.user.username
      },
      companyName: req.body.companyName,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      email: req.body.email,
      preference: req.body.preference,
      price: req.body.price,
      coordinates: coordinates,
      time: req.body.time
    };
    debug(req.user._id)
    await Customer.create(newCustomer, (err) => {
      if (err) {
        req.flash('error', err.message)
      }
      req.flash('success', 'Customer added successfully');
      res.redirect('/customers')
    })
  },

  async getCustomer(req, res) {
    let foundCustomer = await Customer.findById(req.params.id);
    if (!foundCustomer) {
      req.flash('error', 'No user found');
      res.redirect('back');
      return;
    }
    res.render('customer', {
      foundCustomer
    })
  },

  async postSMS(req, res) {
    let customer = await Customer.findById(req.params.id);
    console.log(customer.tech.username);
    let user = await User.findById(req.user.id);
    if (!user || !customer) {
      req.flash('error', 'Something went wrong... Admin has been notified.');
      res.redirect('back');
      return;
    }

    let message = `Hello ${customer.firstName}, this is ${user.firstName} from Dodson Pest Control. This is a reminder of your apointment at ${customer.time} tomorrow. Have a great day!`;

    await client.messages
      .create({
        body: message,
        from: user.twillowNumber,
        to: '+1' + customer.phoneNumber
      }).then(message => debug(message.sid))
      .done();
    req.flash('success', 'Text message sent successfully');
    res.redirect('back');
  }
}