const User = require("../models/user");
const Customer = require("../models/customers");

module.exports = {
  async getAllCustomers(req, res, next) {
    let customers = await Customer.find({});
    let users = await User.find({});
    res.render('admin/index', {customers, users})
    // res.json(customers)
  }
}