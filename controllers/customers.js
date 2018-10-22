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
      res.redirect('/customers/search')
    })
  },

  async getFindByWeek(req, res) {
    const week = new RegExp(escapeRegex(req.query.week), 'gi');
    const day = new RegExp(escapeRegex(req.query.day), 'gi');
    await Customer.find({
      $and: [{
        'week': week
      }, {
        'day': day
      }],
      'tech.id': {
        $eq: req.user.id
      }
    }, (err, foundCustomer) => {
      if (req.query.week === "" || req.query.week === "undefined") {
        req.flash('error', 'Week cannot be blank');
        res.redirect('back');
        return;
      }
      if (req.query.day === "" || req.query.day === "undefined") {
        req.flash('error', 'Day cannot be blank');
        res.redirect('back');
        return;
      }
      if (foundCustomer.length < 1) {
        req.flash('error', 'No customer found');
        res.redirect('back');
        return;
      }
      res.render('customers', {
        foundCustomer
      });
    });
  },

  async getFindAll(req, res) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    await Customer.find({
      'tech.id': {
        $eq: req.user.id
      },
      $text: {
        $search: regex
      }

    }, (err, foundCustomer) => {
      debug(foundCustomer.length)
      if (req.query.search === "" || req.query.search === "undefined") {
        req.flash('error', 'Search cannot be blank');
        res.redirect('back');
        return;
      }
      if (foundCustomer.length < 1) {
        req.flash('error', 'No customer found');
        res.redirect('back');
        return;
      }
      res.render('customers', {
        foundCustomer
      });
    });
  }
}

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}