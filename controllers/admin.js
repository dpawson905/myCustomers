const User = require("../models/user");
const Customer = require("../models/customers");

module.exports = {
  async getAllCustomers(req, res, next) {
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
    let users = await User.find({});
    res.render('admin/index', {customers, users, current: page});
  }
}