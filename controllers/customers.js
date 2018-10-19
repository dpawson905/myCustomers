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
  }
}