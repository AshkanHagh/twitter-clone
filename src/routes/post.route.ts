import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { createPost, getPosts, likePost } from '../controllers/post.controller';

const router = Router();

router.post('/create', isAuthenticated, createPost);

router.get('/', isAuthenticated, getPosts);

router.put('/like/:id', isAuthenticated, likePost);

export default router;