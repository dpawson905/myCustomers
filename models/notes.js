const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');

const NoteSchema = new Schema({
    text: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        id: {
            type: Schema.Types.ObjectId,
            ref: User
        },
        username: String
    }
})

module.exports = mongoose.model("Note", NoteSchema);