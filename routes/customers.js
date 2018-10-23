const express = require('express');
const router = express.Router();

const Customer = require('../models/customers');

const {
  postCustomer,
  getCustomer,
  postSMS,
  getFindByNumber,
  getFindByEmail,
  getFindByWeek,
  getFindAll
} = require('../controllers/customers');

const {
  isAuthenticated,
  isNotAuthenticated,
  asyncErrorHandler
} = require('../middleware');

// /* GET customers page. */
// router.get('/', isNotAuthenticated, async (req, res) => {

//   res.render('customers', {
//     page: 'customers',
//     showCustomers
//   });
// });



router.get('/add', isNotAuthenticated, (req, res) => {
  res.render('newCustomer', {
    page: 'add'
  });
});

router.get('/search', isNotAuthenticated, (req, res) => {
  res.render('search', {
    page: 'search'
  });
});

router.get('/search/week', isNotAuthenticated, asyncErrorHandler(getFindByWeek));

router.get('/search/all', isNotAuthenticated, asyncErrorHandler(getFindAll));

router.post('/add', isNotAuthenticated, asyncErrorHandler(postCustomer));

router.post('/sms/:id', isNotAuthenticated, asyncErrorHandler(postSMS));

router.get('/:id', isNotAuthenticated, async (req, res) => {
  let foundCustomer = await Customer.findById(req.params.id);
  if (!foundCustomer) {
    req.flash('error', 'No customer found');
    res.redirect('back');
    return;
  }
  res.render('customer', {
    foundCustomer
  });
})



module.exports = router;