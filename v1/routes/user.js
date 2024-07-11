const router = require('express').Router();
const { body } = require('express-validator');
const isAuth = require('../middlewares/verify-token');

const userControl = require('../controllers/user');


router.get('/', isAuth, userControl.getProfile);

router.get('/signed', userControl.getAllSignedUsers);

router.get('/profile', isAuth, userControl.getUser);

router.put('/profile', [body('username').trim().notEmpty(), body('email').trim().isEmail().notEmpty(), 
body('phone').trim().notEmpty(), body('password').trim().notEmpty()], isAuth, userControl.updateProfile);

router.put('/profile/post/:id', isAuth, userControl.updatePost);

router.delete('/profile/post/:id', isAuth, userControl.deletePost);


module.exports = router;