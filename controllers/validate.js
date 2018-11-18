const debug = require('debug')('customers:validate');
const Joi = require('joi');
const randomstring = require('randomstring');

// DB Model Files
const User = require('../models/user');
const TempUser = require('../models/tempUser');
const Token = require('../models/token');

// Validation Schema - Password
const passwordSchema = Joi.object().keys({
  username: Joi.string()
    .alphanum()
    .min(7)
    .max(30)
    .required()
    .error(
      new Error(
        'Username muse be alphanumeric and be between 7 and 30 characters'
      )
    ),
  password: Joi.string()
    .regex(/^[-@./#&+\w\s]{8,30}$/)
    .required()
    .error(
      new Error(
        'Password must be alphanumeric and only allows -@./#&+ as special characters'
      )
    ),
  confirmationPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .error(
      new Error('Passwords must match')
    )
});

module.exports = {
  async verifyUser(req, res) {
    /* 
      Find the account that matches the secret token.
      If the token does not exist inform the user that is has
      most likely expired and redirect them to the token resend page.
    */
    const tokenConfirm = await Token.findOne({
      token: req.body.token
    });
    if (!tokenConfirm) {
      req.flash('error, Token not found. Any token created expires in 12 hours from registration. Click "Resend Token" to get a new one.');
      res.redirect('/resend');
    }
    /* 
      Find the temp userby comparing the user._id 
      of the temp user and the _userId on the token
      if user is found set isVerified to true and
      redirect to the password page.
      If no user found, inform the user.
    */
    const tempUser = await TempUser.findOne({
      _id: tokenConfirm._userId
    });
    if (!tempUser) {
      req.flash('error', 'No user found!');
      res.redirect('back');
    }

    tempUser.isVerified = true;
    tempUser.save();

    req.flash(
      'success', 'Thank you, your account is now verified... Please enter the username that you just created and choose a password to finish verification.'
    );
    res.redirect('/validate/set-password');
  },

  async postPassword(req, res, next) {
    /* 
      Use Joi to validate user inputs for Username, Password and Password confirmation
      If any of the inputs fail redirect to the password page and display
      the error to the user
    */
    const result = await Joi.validate(req.body, passwordSchema);
    if (result.error) {
      debug('error', result.error.message);
      res.redirect('/validate/set-password');
      return;
    }
    /* 
      Find the user in the temp user collection by the username in the password form
      if the username is incorrect, send an error to the user and redirect back to the
      password page
    */
    const tempUser = await TempUser.findOne({
      username: req.body.username
    });
    if (!tempUser || tempUser.isVerified === false) {
      req.flash('error', 'Sorry either the username is incorrect or the user was not verified.');
      res.redirect('/validate/set-password');
      return;
    }
    /* 
      Delete the confirmation password as it is not needed in the user collection
    */
    delete req.body.confirmationPassword;

    /* 
      Create the active user by pulling the information
      from the user that was found.
    */
    const newUser = await new User({
      email: tempUser.email,
      username: tempUser.username,
      firstName: tempUser.firstName,
      lastName: tempUser.lastName,
      image: `https://ui-avatars.com/api/?rounded=true&size=35&name=${tempUser.firstName}%20${tempUser.lastName}`,
      isVerified: tempUser.isVerified,
      phoneNumber: tempUser.phoneNumber,
      route: tempUser.route
    });

    const admin = await User.find({});
    if (admin.length < 1 || admin === 'undefined') {
      newUser.isAdmin = true;
    }

    /* 
      Register the user and encrypt the password
    */
    await User.register(newUser, req.body.password);

    /* 
      Remove the temp user from the database.
      We do this vs letting it expire here because we dont
      the user to generate a new token when it's not needed.
    */
    await tempUser.remove();

    req.flash('success', 'Password successfully updated.');
    res.redirect('/');
  }
}