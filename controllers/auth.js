const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');


exports.signup = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {

            const error = new Error('invalid data from your data, please check your value');
            error.statusCode = 422;
            throw error;
        }

        const {username, email, phone, password} = req.body;

        const isUsernameExists = await User.find({username});
        if(!isUsernameExists) {

            const error = new Error('Username already exists');
            error.statusCode = 422;
            throw error;
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPass = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            phone,
            password : hashedPass
        });

        await user.save();

        res.status(201).json({message : 'Account has been created', userId : user._id});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}

exports.login = async (req, res, next) => {
    
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {

            const error = new Error('invalid data from your data, please check your value');
            error.statusCode = 422;
            throw error;
        }

        const {email, password} = req.body;

        const user = await User.findOne({email});
        if(!user) {

            const error = new Error('Wrong email, please check your email');
            error.statusCode = 404;
            throw error;
        }

        const isPassword = await bcrypt.compare(password, user.password);
        if(!isPassword) {

            const error = new Error('Wrong password, please check your password');
            error.statusCode = 404;
            throw error;
        }

        const token = jwt.sign({email : user.email, userId : user._id}, process.env.JWT_SECRET, {expiresIn : '1d'});

        res.status(201).json({message : 'Welcome', token : token, userId : user._id});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}