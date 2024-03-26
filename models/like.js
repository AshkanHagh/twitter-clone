// const mongoose = require('mongoose');

// const Schema = mongoose.Schema;

// const likeSchema = new Schema({

//     postOwner : {
//         type : Schema.Types.ObjectId,
//         ref : 'User',
//         // required : true
//     },
//     postId : {
//         type : Schema.Types.ObjectId,
//         ref : 'Post',
//         // required : true
//     },
//     likeStatus : {
//         type : Number,
//         default : 0
//     },
//     likedUsers : [{
//         type : Schema.Types.ObjectId,
//         ref : 'User',
//         // required : true
//     }]
// }, {timestamps : true});


// module.exports = mongoose.model('Like', likeSchema);