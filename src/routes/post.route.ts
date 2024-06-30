import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { createPost, getPosts, likePost } from '../controllers/post.controller';
import validationMiddleware from '../middlewares/validation.body';
import { createPostBody } from '../validations/Joi';

const router = Router();

router.post('/create', [isAuthenticated, validationMiddleware(createPostBody)], createPost);

router.get('/', isAuthenticated, getPosts);

router.put('/like/:id', isAuthenticated, likePost);

export default router;