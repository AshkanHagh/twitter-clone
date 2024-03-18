const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({

    message : {
        type : String,
        required : true
    },
    senderId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
}, {timestamps : true});


module.exports = mongoose.model('Message', messageSchema);