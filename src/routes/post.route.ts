import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { createPost, editPost, suggestedPosts, likePost, deletePost } from '../controllers/post.controller';
import validationMiddleware from '../middlewares/validation.body';
import { createPostBody, updatePostBody } from '../validations/Joi';
import { addComment, deleteComment, editComment, postComments } from '../controllers/comment.controller';

const router = Router();

router.post('/', [isAuthenticated, validationMiddleware(createPostBody)], createPost);

router.get('/', isAuthenticated, suggestedPosts);

router.put('/like/:id', isAuthenticated, likePost);

router.patch('/:id', [isAuthenticated, validationMiddleware(updatePostBody)], editPost);

router.delete('/:id', isAuthenticated, deletePost);

router.post('/comment/:postId', isAuthenticated, addComment);

router.patch('/comment/:commentId/:postId', isAuthenticated, editComment);

router.delete('/comment/:commentId/:postId', isAuthenticated, deleteComment);

router.get('/comment/:postId', isAuthenticated, postComments);

export default router;