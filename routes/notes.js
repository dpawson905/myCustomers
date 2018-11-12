const express = require('express');
const router = express.Router({mergeParams: true});
const Customer = require('../models/customers');
const Note = require('../models/notes');

const {asyncErrorHandler, isNotAuthenticated} = require('../middleware/index');

router.post("/", isNotAuthenticated, async(req, res) => {
  let customer = await Customer.findById(req.params.id);
  if(!customer) {
    req.flash('error', 'No customer found.');
    res.redirect('back');
    return;
  }
  Note.create(req.body, async (err, note) => {
    if(err) {
      req.flash('error', 'Note cannot be created.');
      res.redirect('back');
      return;
    }
    if(req.body.text === '' || req.body.text.length < 10) {
      req.flash('error', 'Note cannot be blank or must be more than 10 characters long.');
      return res.redirect('back');
    }
    note.author.id = req.user.id;
    note.author.username = req.user.username;
    await note.save();
    await customer.notes.push(note);
    await customer.save();
    req.flash('success', 'Note created');
    res.redirect('/customers/' + customer.id);
  })
})

router.delete("/:notes_id", isNotAuthenticated, async(req, res) => {
  let customer = await Customer.findByIdAndUpdate(req.params.id, {$pull: {notes: req.params.notes_id}});
  if (!customer) {
    req.flash('error', 'No customer found');
    res.redirect('back');
    return;
  }
  await Note.findByIdAndRemove(req.params.notes_id);
  req.flash('success', 'Note deleted');
  res.redirect('back');
})

module.exports = router;