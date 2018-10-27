const nodemailer = require('nodemailer');
const inlineCss = require('nodemailer-juice');

const config = require('../config/mailer');

const transport = nodemailer.createTransport({
  service: 'Mailgun',
  auth: {
    user: config.MAILGUN_USER || process.env.MG_USER,
    pass: config.MAILGUN_PASSWORD || process.env.MG_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});
transport.use('compile', inlineCss());

module.exports = {
  sendEmail(from, to, subject, html) {
    return new Promise((resolve, reject) => {
      transport.sendMail({
        from,
        subject,
        to,
        html
      }, (err, info) => {
        if (err) reject(err);
        resolve(info);
      });
    });
  }
};