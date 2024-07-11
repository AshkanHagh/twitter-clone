const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');


exports.createPost = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {

            const error = new Error('invalid data from your data, please check your value');
            error.statusCode = 422;
            throw error;
        }

        const post = new Post({
            post : req.body.post,
            senderId : req.userId
        });

        const result = await post.save();

        res.status(201).json({message : 'new message saved', post : result});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}


exports.getAllPosts = async (req, res, next) => {

    try {
        const post = await Post.find().populate('senderId', 'username');

        res.status(200).json({message : 'All messages is here', posts : post});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}


exports.getSinglePost = async (req, res, next) => {

    try {
        const post = await Post.findById(req.params.id);
        if(!post) {

            const error = new Error('no post found, please check post id');
            error.statusCode = 422;
            throw error;
        }

        res.status(200).json({message : 'post fetched', post : post});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}


exports.likePost = async (req, res, next) => {

    try {
        const post = await Post.findByIdAndUpdate(req.params.id, {
            $push : {
                likeId : req.userId
            },
            new : true
        });

        await post.save();

        const user = await User.findByIdAndUpdate(req.userId, {
            $push : {
                likedPosts : post._id
            },
            new : true
        });

        await user.save();

        res.status(201).json({message : 'you liked this post', postId : post._id});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}


exports.dislike = async (req, res, next) => {

    try {
        const post = await Post.findByIdAndUpdate(req.params.id, {
            $pull : {
                likeId : req.userId
            },
            new : true
        });

        await post.save();

        const user = await User.findByIdAndUpdate(req.userId, {
            $pull : {
                likedPosts : post._id
            },
            new : true
        });

        await user.save();

        res.status(201).json({message : 'post disliked'});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}


exports.savePost = async (req, res, next) => {

    try {
        const post = await Post.findById(req.params.id);
        if(!post) {

            const error = new Error('nothing found');
            error.statusCode = 404;
            throw error;
        }

        const user = await User.findByIdAndUpdate(req.userId, {
            $push : {
                savedPosts : post._id
            },
            new : true
        });
        
        await user.save();

        res.status(201).json({message : 'Post has been saved', postId : post._id});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}


exports.unSave = async (req, res, next) => {

    try {
        const post = await Post.findById(req.params.id);
        if(!post) {

            const error = new Error('nothing found...');
            error.statusCode = 404;
            throw error;
        }

        const user = await User.findByIdAndUpdate(req.userId, {
            $pull : {
                savedPosts : post._id
            }
        });

        await user.save();

        res.status(201).json({message : 'unsaved post', postId : post._id});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}