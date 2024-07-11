const router = require('express').Router();
const { body } = require('express-validator');

const authControl = require('../controllers/auth');


router.post('/signup', [body('username').trim().notEmpty(), body('email').trim().isEmail().notEmpty(), 
body('phone').trim().notEmpty(), body('password').trim().notEmpty()], authControl.signup);

router.post('/login', [body('email').trim().isEmail().notEmpty(), body('password').trim().notEmpty()], authControl.login);


module.exports = router;