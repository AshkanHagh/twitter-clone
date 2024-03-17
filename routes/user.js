const router = require('express').Router();
const { body } = require('express-validator');
const isAuth = require('../middlewares/verify-token');

const userControl = require('../controllers/user');


// the all post of user route will be t=here

router.get('/', userControl.getAllSignedUsers);

router.get('/profile/:id', isAuth, userControl.getUser);

router.put('/profile/:id', [body('username').trim().notEmpty(), body('email').trim().isEmail().notEmpty(), 
body('phone').trim().notEmpty(), body('password').trim().notEmpty()], userControl.updateProfile);


module.exports = router;