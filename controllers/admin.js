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
    let users = await User.find({}).sort({route: 1});
    res.render('admin/index', {customers, users, current: page});
  },

  async editUserAdmin(req, res, next) {
    let user = await User.findOneAndUpdate(req.params.id, req.body.user);
    req.flash('success', 'User updated!');
    res.redirect('/admin');
  },

  async fixCustomers(req, res, next) {
    let setUser= await User.findById(req.params.id);
    Customer.update({
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
      res.redirect('back');
    })
  }
}