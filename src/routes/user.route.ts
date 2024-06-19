import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { followUser, getUserProfile, searchUser, updateAccountInfo, updateAccountPassword, updateProfileInfo } from '../controllers/user.controller';

const router = Router();

router.put('/profile', isAuthenticated, updateProfileInfo);

router.get('/search/:query', isAuthenticated, searchUser);

router.put('/follow/:id', isAuthenticated, followUser);

router.get('/profile', isAuthenticated, getUserProfile);

router.put('/info', isAuthenticated, updateAccountInfo);

router.put('/password', isAuthenticated, updateAccountPassword);

export default router;