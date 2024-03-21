const { validationResult } = require('express-validator');

const Message = require('../models/message');


exports.createMessage = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {

            const error = new Error('invalid data from your data, please check your value');
            error.statusCode = 422;
            throw error;
        }

        const message = new Message({
            message : req.body.message,
            senderId : req.userId
        });

        const result = await message.save();

        res.status(201).json({message : 'new message saved', message : result});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}


exports.getAllMessages = async (req, res, next) => {

    try {
        const user = await Message.find().populate('senderId', 'username');

        res.status(200).json({message : 'All messages is here', users : user});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}