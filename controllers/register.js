const debug = require('debug')('customers:register');
const Joi = require('joi');
const randomstring = require('randomstring');
const mailer = require('../misc/mailer');
const kickbox = require('kickbox').client(process.env.KB_API).kickbox();

// DB Model Files
const User = require('../models/user');
const TempUser = require('../models/tempUser');
const Token = require('../models/token');

// Validation Schema - Register
const registerSchema = Joi.object().keys({
  email: Joi.string()
    .email({
      minDomainAtoms: 2
    })
    .required()
    .error(new Error('This is not a valid email address')),
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
  firstName: Joi.string()
    .regex(/^[A-Za-z]+$/)
    .min(3)
    .max(15)
    .required()
    .error(
      new Error(
        'Your first name must contain only letters'
      )
    ),
  lastName: Joi.string()
    .regex(/^[A-Za-z]+$/)
    .min(3)
    .max(15)
    .required()
    .error(
      new Error(
        'Your last name must contain only letters'
      )
    ),
});

module.exports = {
  async postRegister(req, res) {
    /* 
      Validate email address using kickbox to make sure it's deliverable before continuing.
      If the email is anything other than deliverable, terminate the registration process. 
    */
    await kickbox.verify(req.body.email, async (err, response) => {
      if (response.body.result !== 'deliverable') {
        req.flash('error', 'This is not a valid email account. Registration terminated!')
        res.redirect('/register');
        return;
      }
      /* 
        Use Joi to validate user inputs for First Name, Username and Email
        If any of the inputs fail redirect to the registration page and display
        the error to the user
      */
      const result = await Joi.validate(req.body, registerSchema);
      if (result.error) {
        debug('error', result.error.message);
        res.redirect('/register');
        return;
      }

      /* 
        Check if email and or username is already taken
        If so, redirect back to the registration page and inform the user
      */
      const userEmail = await User.findOne({
        email: req.body.email
      });
      if (userEmail) {
        req.flash('error', 'This username is already in use.');
        res, redirect('/register');
        return;
      }
      const userName = await User.findOne({
        username: req.body.username
      });
      if (userEmail || userName) {
        req.flash('error', 'This username is already in use.');
        res.redirect('/register');
        return;
      }

      /* 
        Save user to temp user collection 
      */
      debug('Registering User');
      const newTempUser = await new TempUser({
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        image: req.body.image
      });
      await newTempUser.save();

      /* 
        Find the temp user by the username submitted on the form
      */
      const user = await TempUser.findOne({
        username: req.body.username
      });
      /* 
        Generate secret token for email authentication
        Save that token in the token collection and link
        it to the temp user.
      */
      const token = new Token({
        _userId: user._id,
        token: randomstring.generate()
      });
      await token.save();

      let URL = req.headers.host;

      // Compose email for verification
      const html = `
      <form action="http://${URL}/validate/token-validate?token=${token.token}" method="POST">
        <div>
          <h1>Hello, ${newTempUser.firstName}</h1>
          <br>
          <p>Thanks for singing up at ${URL}</p>
          <p>In order to prevent spam accounts we require all users to validate their 
            email address before they can access their account.</p>
          <p>Please click the link below to verify your account.</p>
          <button type="submit">Verify</button>
        </div>
      </form>`;

      // Send the email
      await mailer.sendEmail(
        '"Sender Name" <sender@server.com>',
        req.body.email,
        'Email Verification',
        html
      );

      req.flash(
        'success',
        `Welcome ${
        req.body.firstName
      }, please verify your account. An email has been sent to ${
        req.body.email
      }. Make sure to check your spam folder!`
      );
      res.redirect('/');
    });
  },
}