const passport = require('passport');
const mailer = require("../misc/mailer");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(mailer.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY);
const randomstring = require('randomstring');

// DB Model Files
const User = require('../models/user');
const Token = require('../models/token');

module.exports = {
  async postLogin(req, res, next) {
    /*
      Find the user by the supplied username and see if it exists
      and check to see if the user has been deactivated because
      of a password reset request. If so then inform the user 
    */

    const user = await User.findOne({
      username: req.body.username
    });
    if (!user) {
      req.flash('error', 'That user does not exist');
      res.redirect('back');
      return;
    }
    if (user.deactivated) {
      req.flash('error', 'Your account has been deactivated because a password reset has been issued. Please check your email or type your email into the box below and click submit to resend the email!');
      res.redirect('/auth/send-pw-token');
      return;
    }
    passport.authenticate('local', {
      successRedirect: '/customers/search',
      failureRedirect: '/',
      failureFlash: true,
      successFlash: true
    })(req, res, next);
  },

  async sendPwToken(req, res) {
    let user = await User.findOne({email: req.body.email});
    if(!user) {
      req.flash('error', 'That email address does not exist!');
      res.redirect('back');
      return;
    }
    user.deactivated = true;
    await user.save();
    let newToken = new Token({
      _userId: user._id,
      token: randomstring.generate(),
    });
    await newToken.save();
    const msg = {
      to: req.body.email,
      from: 'noreply@cportal.online',
      subject: 'Password reset',
      text: `Hello ${user.username}, please copy and paste this link into
        your browser to verify your account. `,
      html: `Hi there ${user.username},
      <br>
      To reset your password please click the link to begin.
      <br>
      <a href="http://${req.headers.host}/auth/validate-pw-token?token=${newToken.token}">Reset Password</a>
      <br><br>
      Have a plesant day!`,
    };
    sgMail.send(msg);
    req.flash('success', 'An email with the reset link has been sent.');
    res.redirect('/');
  },

  async validateResetToken(req, res) {
    await Token.findOne(
      { 
        token: req.query.token
      }, (err, foundToken) => {
        if(err || !foundToken) {
          req.flash('error', 'that token does not exist');
          res.redirect('/');
          return;
        }
        req.flash('success', 'Token validated, please change your password now!');
        res.redirect('/auth/forgot-pw');
      }
    )
  },

  async forgotPw(req, res) {
    const user = await User.findOne({username: req.body.username});
    const token = await Token.findOne({_userId: user._id});
    if(!user) {
      req.flash('error', 'That username does not exist');
      res.redirect('/');
      return;
    }
    user.setPassword(req.body.password, async (noMatch) => {
      if(noMatch) {
        req.flash('error', noMatch);
        res.redirect('back');
        return;
      }
      user.deactivated = false;
      user.attempts = 0;
      token.remove();
      await user.save();
      req.flash('success', 'Password updated!');
      res.redirect('/');
    })
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