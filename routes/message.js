const router = require('express').Router();
const { body } = require('express-validator');
const isAuth = require('../middlewares/verify-token');

const messageControl = require('../controllers/message');


router.post('/', isAuth, body('message').trim().notEmpty(), messageControl.createMessage);

router.get('/', messageControl.getAllMessages);


module.exports = router;