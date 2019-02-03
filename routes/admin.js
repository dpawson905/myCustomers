const express = require("express");
const router = express.Router();
const User = require('../models/user');

const {
  getAllCustomers,
  editUserAdmin,
  fixCustomers
} = require("../controllers/admin");

const {
  isAuthenticated,
  isNotAuthenticated,
  asyncErrorHandler,
  isAdmin
} = require("../middleware");

router.get('/', isAdmin, asyncErrorHandler(getAllCustomers));

router.get('/:id/edit', async (req, res) => {
  let editedUser = await User.findById(req.params.id);
  res.render('user/editUser', {editedUser});
});

router.put('/:id', isAdmin, asyncErrorHandler(editUserAdmin));

router.put('/:id/customer-update', isAdmin, asyncErrorHandler(fixCustomers));

module.exports = router;
