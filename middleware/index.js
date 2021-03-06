const moment = require('moment');

module.exports = {
  asyncErrorHandler: (fn) =>
    (req, res, next) => {
      Promise.resolve(fn(req, res, next))
        .catch(next);
    },

  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      req.flash("error", "You are already logged in so theres no need in visiting that page.");
      res.redirect("/");
    } else {
      return next();
    }
  },

  isNotAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash("error", "You must be logged in to view this page");
      res.redirect("/");
    }
  },

  // isAdmin checker
	isAdmin(req, res, next) {
		if(req.isAuthenticated() && req.user.isAdmin) {
			return next();
		}
		req.flash('error', 'You don\'t have the privileges to do that, now scram!');
		res.redirect('/')
  }
};