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
        note.author.id = req.user.id;
        note.author.username = req.user.username;
        await note.save();
        await customer.notes.push(note);
        await customer.save();
        req.flash('success', 'Comment created');
        res.redirect('/customers/' + customer.id);
    })
})

module.exports = router;