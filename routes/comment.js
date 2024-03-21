const router = require('express').Router();
const isAuth = require('../middlewares/verify-token');
const { body } = require('express-validator');

const commentControl = require('../controllers/comment');


router.post('/:id', isAuth, body('comment').trim().notEmpty(), commentControl.addNewComment);

router.put('/:id', isAuth, body('comment').trim().notEmpty(), commentControl.editComment);

router.delete('/:id', isAuth, commentControl.deleteComment);


module.exports = router;