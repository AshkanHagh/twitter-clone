const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    comment : {
        type : String
    },
    senderId : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    receiverPostId : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    }
}, {timestamps : true});


module.exports = mongoose.model('Comment', commentSchema);