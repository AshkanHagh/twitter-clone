import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { createPost, editPost, suggestedPosts, likePost, deletePost } from '../controllers/post.controller';
import validationMiddleware from '../middlewares/validation.body';
import { createPostBody, updatePostBody } from '../validations/Joi';

const router = Router();

router.post('/', [isAuthenticated, validationMiddleware(createPostBody)], createPost);

router.get('/', isAuthenticated, suggestedPosts);

router.put('/like/:id', isAuthenticated, likePost);

router.patch('/:id', [isAuthenticated, validationMiddleware(updatePostBody)], editPost);

router.delete('/:id', isAuthenticated, deletePost);

export default router;