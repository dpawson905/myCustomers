const express = require('express');
const router = express.Router();

const Customer = require('../models/customers');

const {
  postCustomer,
  getCustomer,
  postSMS
} = require('../controllers/customers');

const {
  isAuthenticated,
  isNotAuthenticated,
  asyncErrorHandler
} = require('../middleware');

/* GET customers page. */
router.get('/', isNotAuthenticated, async (req, res) => {
  let showCustomers = await Customer.find({
    'tech.id': req.user._id
  })
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

router.post('/add', isNotAuthenticated, asyncErrorHandler(postCustomer));

router.post('/sms/:id', isNotAuthenticated, asyncErrorHandler(postSMS));

router.get('/:id', isNotAuthenticated, asyncErrorHandler(getCustomer));

module.exports = router;