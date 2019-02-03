const User = require("../models/user");
const Customer = require("../models/customers");

const { twilioSid, twilioToken, twilioNumber, messagesSid } = require("../config/twilio");

const accountSid = twilioSid || process.env.TWILIO_SID;
const authToken = twilioToken || process.env.TWILIO_TOKEN;
const twilioNumberVar = twilioNumber || process.env.TWILIO_NUMBER;
const client = require("twilio")(accountSid, authToken);

module.exports = {
  async getAllCustomers(req, res, next) {
    // await client.api.accounts(twilioSid)
    //   .fetch("https://api.twilio.com/2010-04-01/Accounts/AC2a98f443908c7c912d2f2b371a28c74f/subresourceUris['balance']")
    //   .then(account => console.log(account))
    //   .done()
    let page = req.query.page || 1;
    let customers = await Customer.paginate({'tech.route': req.query.route || 1}, {
      sort: {
        week: 1,
        day: 1,
        lastName: 1
      },
      page: req.query.page || 1,
      limit: 10
    });
    
    let users = await User.find({}).sort({route: 1});
    res.render('admin/index', {customers, users, current: page});
  },

  async editUserAdmin(req, res, next) {
    let user = await User.findById(req.params.id);
    if(req.body.user.email !== user.email) {
      user.email= req.body.user.email
    }
    if(req.body.user.phoneNumber !== user.phoneNumber) {
      user.phoneNumber= req.body.user.phoneNumber
    }
    if(req.body.user.username !== user.username) {
      user.username= req.body.user.username
    }
    if(req.body.user.route !== user.route) {
      user.route= req.body.user.route
    }
    user.firstName = req.body.user.firstName;
    user.lastName = req.body.user.lastName;
    await user.save();
    req.flash('success', 'User updated!');
    res.redirect('/admin');
  },

  async fixCustomers(req, res, next) {
    let setUser= await User.findById(req.params.id);
    await Customer.update({
      'tech.id': req.params.id
    }, {
      'tech.route': setUser.route,
      'tech.username': setUser.username
    }, {
      multi: true
    },(err) => {
      if(err) {
        console.log(err);
        res.redirect('back');
      }
      req.flash('success', 'All customers updated');
      res.redirect('/admin');
    })
  }
}