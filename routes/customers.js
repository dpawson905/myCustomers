const express = require('express');
const router = express.Router();

const Customer = require('../models/customers');

const {
  postCustomer,
  getCustomer,
  postSMS,
  getFindByNumber,
  getFindByEmail,
  getFindByWeek
} = require('../controllers/customers');

const {
  isAuthenticated,
  isNotAuthenticated,
  asyncErrorHandler
} = require('../middleware');

/* GET customers page. */
router.get('/', isNotAuthenticated, async (req, res) => {

  res.render('customers', {
    page: 'customers',
    showCustomers
  });
});

router.get('/add', isNotAuthenticated, (req, res) => {
  res.render('newCustomer', {
    page: 'add'
  });
});

router.get('/search', isNotAuthenticated, (req, res) => {
  res.render('search');
});

router.get('/search/phone', isNotAuthenticated, asyncErrorHandler(getFindByNumber));

router.get('/search/email', isNotAuthenticated, asyncErrorHandler(getFindByEmail));

router.get('/search/week', isNotAuthenticated, asyncErrorHandler(getFindByWeek));

router.post('/add', isNotAuthenticated, asyncErrorHandler(postCustomer));

router.post('/sms/:id', isNotAuthenticated, asyncErrorHandler(postSMS));

module.exports = router;