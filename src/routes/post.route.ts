import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { createPost, editPost, suggestedPosts, likePost, deletePost } from '../controllers/post.controller';
import validationMiddleware from '../middlewares/validation.body';
import { createPostBody, updatePostBody } from '../validations/Joi';
import { addComment, addReplay, commentReplies, deleteComment, deleteReplay, editComment, editReplay, 
postComments } from '../controllers/comment.controller';
import { savedPosts, savePost } from '../controllers/save-post.controller';
import { addTagToPost } from '../controllers/tags.controller';

const router = Router();

// tags
router.post('/tags/:postId', isAuthenticated, addTagToPost);

// save post
router.post('/save/:postId', isAuthenticated, savePost);

router.get('/save', isAuthenticated, savedPosts);

// replies
router.post('/comment/replay/:commentId', isAuthenticated, addReplay);

router.patch('/comment/replay/:commentId/:replayId', isAuthenticated, editReplay);

router.delete('/comment/replay/:commentId/:replayId', isAuthenticated, deleteReplay);

router.get('/comment/replay/:commentId', isAuthenticated, commentReplies);

// comments
router.post('/comment/:postId', isAuthenticated, addComment);

router.patch('/comment/:commentId/:postId', isAuthenticated, editComment);

router.delete('/comment/:commentId/:postId', isAuthenticated, deleteComment);

router.get('/comment/:postId', isAuthenticated, postComments);

// posts
router.post('/', [isAuthenticated, validationMiddleware(createPostBody)], createPost);

router.get('/', isAuthenticated, suggestedPosts);

router.put('/like/:id', isAuthenticated, likePost);

router.patch('/:id', [isAuthenticated, validationMiddleware(updatePostBody)], editPost);

router.delete('/:id', isAuthenticated, deletePost);

export default router;