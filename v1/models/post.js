const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({

    post : {
        type : String,
        required : true
    },
    senderId : {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    likeId : [{
        type : Schema.Types.ObjectId,
        ref : 'User',
        // required : true
    }]
}, {timestamps : true});


module.exports = mongoose.model('Post', postSchema);