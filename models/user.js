const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    
    username : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    phone : {
        type : Number,
        required : true,
    },
    password : {
        type : String,
        required : true,
        length : {
            minimize : 6
        }
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female"],
    },
    profilePic: {
        type: String,
        default: "",
    },
    likedPosts : [{
        type : Schema.Types.ObjectId,
        ref : 'Post',
        // required : true
    }],
    savedPosts : [{
        type : Schema.Types.ObjectId,
        ref : 'Post'
    }]
}, {timestamps : true});


module.exports = mongoose.model('User', userSchema);