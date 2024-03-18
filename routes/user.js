const router = require('express').Router();
const { body } = require('express-validator');
const isAuth = require('../middlewares/verify-token');

const userControl = require('../controllers/user');


router.get('/', userControl.getAllMessages);

router.get('/signed', userControl.getAllSignedUsers);

router.get('/profile/:id', isAuth, userControl.getUser);

router.put('/profile/:id', [body('username').trim().notEmpty(), body('email').trim().isEmail().notEmpty(), 
body('phone').trim().notEmpty(), body('password').trim().notEmpty()], userControl.updateProfile);

router.put('/profile/message/:id', isAuth, userControl.updateMessage);


module.exports = router;