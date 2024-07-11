const { validationResult } = require('express-validator');


const Comment = require('../models/comment');
const User = require('../models/user');
const Message = require('../models/post');


exports.addNewComment = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {

            const error = new Error('invalid data from your data, please check your value');
            error.statusCode = 422;
            throw error;
        }

        const user = await User.findById(req.userId);
        if(!user) {
            
            const error = new Error('no user found');
            error.statusCode = 404;
            throw error;
        }

        const receiverPost = await Message.findById(req.params.id);
        if(!receiverPost) {

            const error = new Error('no post found');
            error.statusCode = 404;
            throw error;
        }

        const comment = new Comment({
            comment : req.body.comment,
            senderId : req.userId,
            receiverPostId : receiverPost._id
        });

        const result = await comment.save();

        res.status(201).json({message : 'comment saved', comment : result});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}

exports.editComment = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {

            const error = new Error('invalid data from your data, please check your value');
            error.statusCode = 422;
            throw error;
        }

        const comment = await Comment.findById(req.params.id);
        if(!comment) {

            const error = new Error('no comment found');
            error.statusCode = 404;
            throw error;
        }

        if(comment.senderId.toString() != req.userId) {

            const error = new Error('not authorized');
            error.statusCode = 403;
            throw error;
        }

        const editedComment = await Comment.updateOne({
            $set : {
                comment : req.body.comment
            }
        });

        res.status(201).json({message : 'comment has been updated', commentId : comment._id});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}

exports.deleteComment = async (req, res, next) => {

    try {
        const comment = await Comment.findById(req.params.id);
        if(!comment) {

            const error = new Error('no comment found');
            error.statusCode = 404;
            throw error;
        }

        if(comment.senderId.toString() != req.userId) {

            const error = new Error('not authorized');
            error.statusCode = 403;
            throw error;
        }

        await comment.deleteOne();

        res.status(200).json({message : 'comment has been deleted', commentId : comment._id});

    } catch (error) {
        
    }

}