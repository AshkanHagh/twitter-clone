const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Message = require('../models/message');


exports.getAllMessages = async (req, res, next) => {

    try {
        const user = await Message.find().populate('senderId', 'username');

        res.status(200).json({message : 'All users is here', users : user});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}

exports.getAllSignedUsers = async (req, res, next) => {

    try {
        const user = await User.find().select('-password');

        res.status(200).json({message : 'All users is here', users : user});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}

exports.getUser = async (req, res, next) => {

    try {
        const user = await User.findById(req.params.id);
        if(!user) {

            const error = new Error('no user found');
            error.statusCode = 404;
            throw error;
        }

        const {password, ...others} = user._doc;

        res.status(200).json({message : 'user fetched', user : others});

    } catch (error) {
     
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}

exports.updateProfile = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {

            const error = new Error('invalid data from your data, please check your value');
            error.statusCode = 422;
            throw error;
        }

        const {username, email, phone, confirmPassword, password, gender} = req.body;

        const user = await User.findById(req.params.id);
        if(!user) {

            const error = new Error('Wrong email, please check your email');
            error.statusCode = 404;
            throw error;
        }

        const confirmOldPass = await bcrypt.compare(confirmPassword, user.password);
        if(!confirmOldPass) {

            const error = new Error('your confirmPassword dos not match the old one');
            error.statusCode = 404;
            throw error;
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPass = await bcrypt.hash(password, salt);

        const updatedUser = await User.updateOne({
            $set : {
                username,
                email,
                phone,
                password : hashedPass,
                gender
            }
        });

        res.status(201).json({message : 'Profile has been updated', userId : user._id});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}

exports.updateMessage = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {

            const error = new Error('invalid data from your data, please check your value');
            error.statusCode = 422;
            throw error;
        }

        const message = await Message.findById(req.params.id);
        if(!message) {

            const error = new Error('no message found');
            error.statusCode = 404;
            throw error;
        }

        if(message.senderId.toString() != req.userId) {

            const error = new Error("not authorized");
            error.statusCode = 403;
            throw error;
        }

        const updatedUser = await Message.updateOne({
            $set : {
                message : req.body.message
            }
        });

        res.status(201).json({message : 'message has been updated', messageId : message._id});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}