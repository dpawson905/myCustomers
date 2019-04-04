const debug = require("debug")("customers:newCustomer");

const User = require("../models/user");
const Customer = require("../models/customers");
const moment = require('moment');

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({
  accessToken: process.env.MB_API
});

const mapBoxToken = process.env.MB_API;

const { twilioSid, twilioToken, twilioNumber, messagesSid } = require("../config/twilio");

const accountSid = twilioSid || process.env.TWILIO_SID;
const authToken = twilioToken || process.env.TWILIO_TOKEN;
const twilioNumberVar = twilioNumber || process.env.TWILIO_NUMBER;
const client = require("twilio")(accountSid, authToken);

module.exports = {
  async postCustomer(req, res) {
    function getServiceDate(startDate) {
      var startOfMonth = moment(startDate)
        .utc()
        .startOf("month")
        .startOf("isoweek")
        .startOf('hour');
      var svcDate = moment(startDate)
        .utc()
        .startOf("month")
        .startOf("isoweek")
        .add(parseInt(req.body.week), "w")
        .add(parseInt(req.body.day -1), "d")
        .startOf('hour')

      if (svcDate.month() == startOfMonth.month()) {
        svcDate = svcDate.subtract(1, "w");
      }
      return svcDate;
    }
    let checkCustTime = await Customer.find({
      $and: [
          {
            week: req.body.week,
            day: req.body.day
          },
          
        ],
        "tech.id": {
          $eq: req.user.id
        }
    });
    
    for(var i = 0; i < checkCustTime.length; i++) {
      if (checkCustTime[i].fromTime === req.body.fromTime && checkCustTime[i].toTime === req.body.toTime && req.body.toTime !== 'anytime' && req.body.fromTime !== 'anytime') {
        req.flash('error', 'You already have a customer with that scheduled time.');
        res.redirect('back');
        return;
      }
    }
    if (req.body.fromTime === req.body.toTime && req.body.toTime !== 'anytime') {
      req.flash('error', 'To and from times cannot be the same.')
      res.redirect('back');
      return;
    }
    
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.address,
        limit: 1
      })
      .send();
    let geometry = response.body.features[0].geometry;
    let dates = [];
    let freq = req.body.frequency;
    for (var i = 0; i < 96; i += parseInt(freq)) {
      var startOfMonth = moment()
        .utc()
        .add(i, "M");
    await dates.push(getServiceDate(startOfMonth).toISOString());
    };

   
    
    let newCustomer = {
      week: req.body.week,
      day: req.body.day,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      tech: { id: req.user._id, username: req.user.username, route: req.user.route },
      companyName: req.body.companyName,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      preference: req.body.preference,
      servicePrefs: req.body.servicePrefs,
      price: req.body.price,
      frequency: req.body.frequency,
      geometry: geometry,
      serviceDates: dates,
      fromTime: req.body.fromTime,
      toTime: req.body.toTime,
      image: `https://ui-avatars.com/api/?rounded=true&size=200&name=${
        req.body.firstName
      }%20${req.body.lastName}`
    };
    
    let customer = await new Customer(newCustomer);
    customer.properties.description = `
    <p>Week: ${customer.week} Day: ${customer.day}</p>
    <strong><a href="/customers/${customer._id}">${customer.firstName} ${customer.lastName}</a></strong>
    <p>${customer.address.substring(0, 20)}...</p>`;
    await customer.save();
    req.flash("success", "Customer added successfully");
    res.redirect("/customers/add");
  },

  async getEditCustomer(req, res) {
    let editedCustomer = await Customer.findById(req.params.id)
    res.render('customers/editCustomer', {
      editedCustomer
    })
  },

  async putEditCustomer(req, res) {
    function getServiceDate(startDate) {
      var startOfMonth = moment(startDate)
        .utc()
        .startOf("month")
        .startOf("isoweek")
        .startOf('hour');
      var svcDate = moment(startDate)
        .utc()
        .startOf("month")
        .startOf("isoweek")
        .add(parseInt(req.body.week), "w")
        .add(parseInt(req.body.day -1), "d")
        .startOf('hour')

      if (svcDate.month() == startOfMonth.month()) {
        svcDate = svcDate.subtract(1, "w");
      }
      return svcDate;
    }
    let findCustomer = await Customer.findById(req.params.id);
    if(req.body.fromTime !== findCustomer.fromTime && req.body.toTime !== findCustomer.toTime){
      let checkCustTime = Customer.find({
        $and: [
          {
            week: req.body.week
          },
          {
            day: req.body.day
          }
        ],
        "tech.id": {
          $eq: req.user.id
        }
      });
      for (var i = 0; i < checkCustTime.length; i++) {
        if (checkCustTime[i].fromTime === req.body.fromTime && checkCustTime[i].toTime === req.body.toTime && req.body.fromTime !== "anytime" && checkCustTime[i].phoneNumber !== req.body.phoneNumber) {
          req.flash('error', 'You already have a customer with that scheduled time.');
          res.redirect('back');
          return;
        }
      }
    }
    
    if (req.body.fromTime === req.body.toTime && req.body.toTime !== 'anytime') {
      req.flash('error', 'To and from times cannot be the same.')
      res.redirect('back');
      return;
    }
    let updateCustomer = await Customer.findById(req.params.id);
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.address,
        limit: 1
      })
      .send();
    let geometry = response.body.features[0].geometry;
    let dates = [];
    let freq = req.body.frequency;
    for (var i = 0; i < 96; i += parseInt(freq)) {
      var startOfMonth = moment()
        .utc()
        .add(i, "M");
    await dates.push(getServiceDate(startOfMonth).toISOString());
    };
    updateCustomer.week = req.body.week;
    updateCustomer.day = req.body.day;
    updateCustomer.firstName = req.body.firstName;
    updateCustomer.lastName = req.body.lastName;
    updateCustomer.tech = { id: req.user._id, username: req.user.username, route: req.user.route };
    updateCustomer.companyName = req.body.companyName;
    updateCustomer.phoneNumber = req.body.phoneNumber;
    updateCustomer.address = req.body.address;
    updateCustomer.frequency = req.body.frequency;
    updateCustomer.preference = req.body.preference;
    updateCustomer.servicePrefs = req.body.servicePrefs,
    updateCustomer.price = req.body.price,
    updateCustomer.fromTime = req.body.fromTime;
    updateCustomer.toTime = req.body.toTime;
    updateCustomer.geometry = geometry;
    updateCustomer.serviceDates = dates;
    updateCustomer.properties.description = `
    <p>Week: ${updateCustomer.week} Day: ${updateCustomer.day}</p>
    <strong><a href="/customers/${updateCustomer._id}">${updateCustomer.firstName} ${updateCustomer.lastName}</a></strong>
    <p>${updateCustomer.address.substring(0, 20)}</p>`;
    await updateCustomer.save()
    req.flash('success', 'Customer updated');
    res.redirect(`/customers/${updateCustomer.id}`)
  },

  async deleteCustomer(req, res) {
    await Customer.findByIdAndRemove(req.params.id, (err, removeCustomer) => {
      if (err) {
        req.flash('error', 'No customer to delete.')
        res.redirect('back');
        return;
      }
      req.flash('success', 'Customer deleted.');
      res.redirect('/customers/search');
    });
    
  },

  async getFindByWeek(req, res) {
    const week = new RegExp(escapeRegex(req.query.week), "gi");
    const day = new RegExp(escapeRegex(req.query.day), "gi");
    let time = moment()
    .utc()
    .startOf("month")
    .startOf("isoweek")
    .add(parseInt(req.query.week), "w")
    .add(parseInt(req.query.day - 1), "d").subtract(1, "w")
    .toISOString();
    console.log(time)
    let foundCustomers = await Customer.paginate(
      {
        serviceDates: {
          $eq: moment()
            .utc()
            .startOf("month")
            .startOf("isoweek")
            .add(parseInt(req.query.week), "w")
            .add(parseInt(req.query.day - 1), "d").subtract(1, "w")
            .toISOString()
        },
        $and: [
          {
            week: week,
            day: day
          }
        ],
        "tech.id": {
          $eq: req.user.id
        }
      }, {sort: {
        lastName: 1
      },
      page: req.query.page || 1,
      limit: 15
      }
    );
    res.render("customers/customers", {
      foundCustomers
    });
  },

  async getFindAll(req, res) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    await Customer.paginate(
      {
        "tech.id": {
          $eq: req.user.id
        },
        $text: {
          $search: regex
        }
      }, {
        sort: {
          lastName: 1
        },
        page: req.query.page || 1,
        limit: 10
      },
      (err, foundCustomers) => {
        if (req.query.search === "" || req.query.search === "undefined") {
          req.flash("error", "Search cannot be blank");
          res.redirect("back");
          return;
        }
        if (foundCustomers.length < 1) {
          req.flash("error", "No customer found");
          res.redirect("back");
          return;
        }
        res.render("customers/customers", {
          foundCustomers
        });
        
      }
    )
  },

  async postSmsAll(req, res) {
    let user = await User.findById(req.user.id);
    await Customer.find({
      serviceDates: {
        $eq: moment()
          .utc()
          .startOf("month")
          .startOf("isoweek")
          .add(parseInt(req.body.week), "w")
          .add(parseInt(req.body.day - 1), "d")
          .toISOString()
      },
      $and: [
        {
          week: req.body.week,
          day: req.body.day
        }
      ],
      "tech.id": {
        $eq: req.user.id
      }
    }, (err, foundCustomers) => {
      let customers = [];
      for(var i = 0; i < foundCustomers.length; i += 1) {
        customers.push(foundCustomers[i]);
      }
      Promise.all(
        customers.map(customer => {
          let message = 
          `Hello ${customer.firstName}, this is ${user.firstName} from Dodson Pest Control. This is a reminder of your appointment tomorrow. If you have any questions please contact me at ${user.phoneNumber} Have a great day!
      `;

          return client.messages.create({
            to: customer.phoneNumber,
            from: messagesSid,
            body: message
          });
        })
      )
        .then(() => {
          req.flash('success', 'Messages have been sent to all of your customers for the day!');
          res.redirect('back');
        })
        .catch(err => {
          res.flash('error', 'Something went wrong, please try again' + err);
          res.redirect('back');
        });
    })
  },

  async postSMS(req, res) {
    let customer = await Customer.findById(req.params.id);
    let user = await User.findById(req.user.id);
    console.log(user.phoneNumber)
    console.log(customer.fromTime + " " + customer.toTime)
    if (!user || !customer) {
      req.flash("error", "Something went wrong... Admin has been notified.");
      res.redirect("back");
      return;
    }
    
    if(customer.fromTime === customer.toTime) {
      let message =
        `Hello ${customer.firstName}, this is ${user.firstName} from Dodson Pest Control. This is a reminder of your appointment tomorrow. If you have any questions please contact me at ${user.phoneNumber} Have a great day!
      `;

      await client.messages
        .create({
          body: message,
          from: twilioNumberVar,
          to: "+1" + customer.phoneNumber
        })
        .then(message => debug(message.sid))
        .done();
    } else if(customer.fromTime === 'anytime' && customer.toTime !== 'anytime') {
      let message =
        `Hello ${customer.firstName}, this is ${user.firstName} from Dodson Pest Control. This is a reminder of your appointment tomorrow I will be there no later than ${customer.toTime}. If you have any questions please contact me at ${user.phoneNumber} Have a great day!
      `;

      await client.messages
        .create({
          body: message,
          from: twilioNumberVar,
          to: "+1" + customer.phoneNumber
        })
        .then(message => debug(message.sid))
        .done();
    } else {
      let message =
        `Hello ${customer.firstName}, this is ${user.firstName} from Dodson Pest Control. This is a reminder of your appointment from ${customer.fromTime} - ${customer.toTime} tomorrow. If you have any questions please contact me at ${user.phoneNumber} Have a great day!
      `;

      await client.messages
        .create({
          body: message,
          from: twilioNumberVar,
          to: "+1" + customer.phoneNumber
        })
        .then(message => debug(message.sid))
        .done();
    }
    req.flash("success", "Text message sent successfully");
    res.redirect("back");
  },

  async viewAll(req, res, next) {
    let customers = await Customer.find({'tech.id': req.user._id});
    res.render('customers/viewAll', {
      customers,
      mapBoxToken,
      level: 'viewAll'
    });
  },

  async searchAll(req, res, next) {
    let customers = await Customer.find({
      $and: [
        {
          week: req.query.week,
          day: req.query.day
        }
      ],
      "tech.id": {
        $eq: req.user.id
      }
    });
    res.render('customers/viewAll', {
      customers,
      mapBoxToken,
      level: 'viewAll'
    });
  }
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}