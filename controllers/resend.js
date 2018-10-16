const debug = require('debug')('customers:resend');
const Joi = require('joi');
const randomstring = require('randomstring');
const mailer = require('../misc/mailer');

// DB Model Files
const TempUser = require('../models/tempUser');
const Token = require('../models/token');

// Resend validation schema
const validateSchema = Joi.object().keys({
  email: Joi.string()
    .email({
      minDomainAtoms: 2
    })
    .required()
    .error(new Error('This is not a valid email address'))
});

module.exports = {
  async putResend(req, res, next) {
    /* 
      Use Joi to validate user inputs for their Email address
      If  the input fails redirect to the registration page and display
      the error to the user
    */
    const result = Joi.validate(req.body, validateSchema);
    if (result.error) {
      debug('error', result.error.message);
      return;
    }
    /* 
      Find the user by the submitted email address.
      If the email address is invalid then inform
      the user and redirect to the resend page.
    */
    const tempUser = await TempUser.findOne({
      email: req.body.email
    });
    if (!tempUser) {
      req.flash('error', 'This user does not exist');
      res.redirect('/resend');
      return;
    }
    /* 
      If the user is found find the token by the user._id
      It's linked to the token by _userId.  If the token is 
      still active then inform the user to check their email
      to verify their account.
    */
    const oldToken = await Token.findOne({
      _userId: tempUser.id
    });
    if (oldToken) {
      req.flash('error', 'A token already exists for this user, please check your email!');
      res.redirect('/');
      return;
    }
    /* 
      Generate a new token and save it to the tokens collection
    */
    const token = new Token({
      _userId: tempUser._id,
      token: randomstring.generate()
    });
    await token.save();

    // Compose email for verification
    const html = `
      <style>h1{color:steelblue}</style>
      <form action="http://${req.headers.host}/validate?token=${token.token}" method="POST">
        <div>
          <h1>Hello, ${user.username}</h1>
          <br>
          <p>Thanks for singing up at ${req.headers.host}</p>
          <p>In order to prevent spam accounts we require all users to validate their 
            email address before they can access their account.</p>
          <p>Please click the link below to verify your account.</p>
          <button type="submit">Verify</button>
        </div>
      </form>`;

    // Send the email
    await mailer.sendEmail(
      '"Sender Name" <sender@server.com>',
      result.value.email,
      'Email Verification',
      html
    );

    req.flash(
      'success',
      `Please verify your account. An email has been sent to ${
        result.value.email
      }`
    );
    res.redirect('/');
  }
}