const router = require('express').Router();
const { body } = require('express-validator');
const isAuth = require('../middlewares/verify-token');

const postControl = require('../controllers/post');
const commentControl = require('../controllers/comment');


// posts route

router.post('/', isAuth, body('post').trim().notEmpty(), postControl.createPost);

router.get('/', postControl.getAllPosts);

router.get('/:id', postControl.getSinglePost);

// like route

router.put('/like/:id', isAuth, postControl.likePost);

router.put('/dislike/:id', isAuth, postControl.dislike);


// save post

router.put('/savePost/:id', isAuth, postControl.savePost);

router.put('/unsave/:id', isAuth, postControl.unSave);


// comments route

router.post('/comment/:id', isAuth, body('comment').trim().notEmpty(), commentControl.addNewComment);

router.put('/comment/:id', isAuth, body('comment').trim().notEmpty(), commentControl.editComment);

router.delete('/comment/:id', isAuth, commentControl.deleteComment);


module.exports = router;