const debug = require('debug')('customers:newCustomer');
const mailer = require('../misc/mailer');
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
  },

  async postEmail(req, res) {
    let customer = await Customer.findById(req.params.id);
    let user = await User.findById(req.user.id);
    if (!user || !customer) {
      req.flash('error', 'Something went wrong... Admin has been notified.');
      res.redirect('back');
      return;
    }

    let html = `
    <div>
      <h1  Hello ${customer.firstName}, </h1> 
      <p>This is ${user.firstName} with Dodson Brothers Pest Control.This is a reminder of your apointment tomorrow at 9: 15 AM. </p> 
      <p> If you have any questions please contact me at ${user.phoneNumber}. </p> 
      <p> Have a great day! </p> 
    </div>`;

    // Send the email
    await mailer.sendEmail(
      `"${user.FirstName} ${user.lastName} <${req.headers.host}>`,
      customer.email,
      'Dodson Brothers Pest Control Reminder',
      html
    );


  }
}

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}