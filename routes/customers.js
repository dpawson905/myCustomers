const express = require("express");
const router = express.Router();

const Customer = require("../models/customers");

const {
  postCustomer,
  getCustomer,
  postSMS,
  getFindByWeek,
  getFindAll,
  getEditCustomer,
  putEditCustomer,
  deleteCustomer
} = require("../controllers/customers");

const {
  isAuthenticated,
  isNotAuthenticated,
  asyncErrorHandler
} = require("../middleware");

/* GET customers page. */
// router.get("/", isNotAuthenticated, async (req, res) => {
//   let foundCustomer = await Customer.find({
//     "tech.id": req.user.id
//   });
//   res.render("customers/customers", {
//     page: "customers",
//     foundCustomer
//   });
// });

router.get("/add", isNotAuthenticated, (req, res) => {
  res.render("newCustomer", {
    page: "add"
  });
});

router.get("/search", isNotAuthenticated, (req, res) => {
  res.render("search", {
    page: "search"
  });
});

router.get(
  "/search/week",
  isNotAuthenticated,
  asyncErrorHandler(getFindByWeek)
);

router.get("/search/all", isNotAuthenticated, asyncErrorHandler(getFindAll));

router.post("/add", isNotAuthenticated, asyncErrorHandler(postCustomer));

router.post("/sms/:id", isNotAuthenticated, asyncErrorHandler(postSMS));

router.get("/:id", isNotAuthenticated, async (req, res) => {
  let foundCustomer = await Customer.findById(req.params.id).populate({
    path: "notes",
    options: {
      sort: {
        'createdAt': -1
      }
    }
  });
  if (!foundCustomer) {
    req.flash("error", "No customer found");
    res.redirect("back");
    return;
  }
  res.render("customer", {
    foundCustomer: foundCustomer
  });
});

router.put("/:id", isNotAuthenticated, asyncErrorHandler(putEditCustomer));

router.delete('/:id', isNotAuthenticated, asyncErrorHandler(deleteCustomer));

router.get("/:id/edit", isNotAuthenticated, asyncErrorHandler(getEditCustomer))

module.exports = router;
