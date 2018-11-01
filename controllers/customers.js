const debug = require("debug")("customers:newCustomer");
const mailer = require("../misc/mailer");
const User = require("../models/user");
const Customer = require("../models/customers");
const { MB_API } = require("../config/mapbox");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({
  accessToken: MB_API || process.env.MB_API
});

const { twilioSid, twilioToken, twilioNumber } = require("../config/twilio");

const accountSid = twilioSid || process.env.TWILIO_SID;
const authToken = twilioToken || process.env.TWILIO_TOKEN;
const twilioNumberVar = twilioNumber || process.env.TWILIO_NUMBER;
const client = require("twilio")(accountSid, authToken);

module.exports = {
  async postCustomer(req, res) {
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.address,
        limit: 1
      })
      .send();
    let coordinates = response.body.features[0].geometry.coordinates;
    
    let newCustomer = {
      week: req.body.week,
      day: req.body.day,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      tech: { id: req.user._id, username: req.user.username },
      companyName: req.body.companyName,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      preference: req.body.preference,
      frequency: req.body.frequency,
      coordinates: coordinates,
      time: req.body.time,
      image: `https://ui-avatars.com/api/?rounded=true&size=200&name=${
        req.body.firstName
      }%20${req.body.lastName}`
    };
    if(req.body.email !== "") {
      email = req.body.email;
    }
    debug(req.user._id);
    await Customer.create(newCustomer, err => {
      if (err) {
        req.flash("error", err.message);
      }
      req.flash("success", "Customer added successfully");
      res.redirect("/customers/search");
    });
  },

  async getEditCustomer(req, res) {
    await Customer.findById(req.params.id, (err, editedCustomer) => {
      if(err) {
        req.flash('error', err);
        res.redirect("back");
        return;
      }
      console.log(editedCustomer)
      res.render('customers/editCustomer', {
        editedCustomer: editedCustomer
      })
    });
  },

  async putEditCustomer(req, res) {
    let updateCustomer = await Customer.findByIdAndUpdate(req.params.id);
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.address,
        limit: 1
      })
      .send();
    let coordinates = response.body.features[0].geometry.coordinates;
    updateCustomer.week = req.body.week;
    updateCustomer.day = req.body.day;
    updateCustomer.firstName = req.body.firstName;
    updateCustomer.lastName = req.body.lastName;
    updateCustomer.companyName = req.body.companyName;
    updateCustomer.phoneNumber = req.body.phoneNumber;
    updateCustomer.address = req.body.address;
    updateCustomer.email = req.body.email;
    updateCustomer.frequency = req.body.frequency;
    updateCustomer.preference = req.body.preference;
    updateCustomer.time = req.body.time;
    updateCustomer.coordinates = coordinates;
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
    await Customer.find(
      {
        $and: [
          {
            week: week
          },
          {
            day: day
          }
        ],
        "tech.id": {
          $eq: req.user.id
        }
      },
      (err, foundCustomers) => {
        if (req.query.week === "" || req.query.week === "undefined") {
          req.flash("error", "Week cannot be blank");
          res.redirect("back");
          return;
        }
        if (req.query.day === "" || req.query.day === "undefined") {
          req.flash("error", "Day cannot be blank");
          res.redirect("back");
          return;
        }
        if (foundCustomers.length < 1) {
          req.flash("error", "No customer found");
          res.redirect("back");
          return;
        }
        res.render("customers", {
          foundCustomers
        });
      }
    );
  },

  async getFindAll(req, res) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    await Customer.find(
      {
        "tech.id": {
          $eq: req.user.id
        },
        $text: {
          $search: regex
        }
      },
      (err, foundCustomers) => {
        debug(foundCustomers.length);
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
        res.render("customers", {
          foundCustomers
        });
      }
    );
  },

  async postSMS(req, res) {
    let customer = await Customer.findById(req.params.id);
    let user = await User.findById(req.user.id);
    console.log(user.phoneNumber)
    if (!user || !customer) {
      req.flash("error", "Something went wrong... Admin has been notified.");
      res.redirect("back");
      return;
    }

    let message = `Hello ${customer.firstName}, this is ${
      user.firstName
    } from Dodson Pest Control. This is a reminder of your appointment at ${
      customer.time
    } tomorrow. If you have any questions please contact me at ${
      user.phoneNumber
    } Have a great day!`;

    await client.messages
      .create({
        body: message,
        from: twilioNumberVar,
        to: "+1" + customer.phoneNumber
      })
      .then(message => debug(message.sid))
      .done();
    req.flash("success", "Text message sent successfully");
    res.redirect("back");
  },

  async postEmail(req, res) {
    let customer = await Customer.findById(req.params.id);
    let user = await User.findById(req.user.id);
    if (!user || !customer) {
      req.flash("error", "Something went wrong... Admin has been notified.");
      res.redirect("back");
      return;
    }

    let html = `
    <div>
      <h1> Hello ${customer.firstName}, </h1> 
      <p>This is ${
        user.firstName
      } with Dodson Brothers Pest Control.This is a reminder of your appointment tomorrow at ${customer.time}. </p> 
      <p> If you have any questions please contact me at <a href="tel:${user.phoneNumber}">${user.phoneNumber}</a>. </p> 
      <p> Have a great day! </p> 
    </div>`;

    // Send the email
    
    await mailer.sendEmail(
      `"${user.firstName} ${user.lastName}" <${user.email}>`,
      customer.email,
      "Dodson Brothers Pest Control Reminder",
      html
    );
    req.flash('success', 'Email sent');
    res.redirect('back');
  }
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
