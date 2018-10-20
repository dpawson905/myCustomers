const passport = require('passport');

// DB Model Files
const User = require('../models/user');
const DeactivatedUser = require('../models/deactivatedUser');

module.exports = {
  async postLogin(req, res, next) {
    /* 
      Find the user by the supplied username
      and check to see if the user has been deactivated by admin
      If it has, inform the user that their account has been deactivated for 
      24 hours and to try back later. */

    const user = await User.findOne({
      username: req.body.username
    });
    if (!user) {
      req.flash('error', 'That user does not exist');
      res.redirect('back');
      return;
    }
    const deactivatedUser = await DeactivatedUser.findOne({
      _userId: user._id
    });
    if (deactivatedUser) {
      req.flash('error', `Sorry, but your user account has been deactivated.`);
      res.redirect('/');
      return;
    } else {
      passport.authenticate('local', {
        successRedirect: '/customers',
        failureRedirect: '/',
        failureFlash: 'Sorry, but your username and or password is incorrect.'
      })(req, res, next);
    }

  },

  async putTwilio(req, res) {
    let user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'No user found');
      res.redirect('back');
      return;
    }

    user.twilioNumber = req.body.twilioNumber;

    await user.save()
    req.flash('success', 'Congrats, your now able to text users!');
    res.redirect('/customers');
  },

  getLogout(req, res) {
    req.logout();
    res.redirect('/');
  }
};