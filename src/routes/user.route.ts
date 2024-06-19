import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { followUser, getUserProfile, searchUser, updateAccountInfo, updateAccountPassword, updateProfileInfo } from '../controllers/user.controller';
import validationMiddleware from '../middlewares/validation.body';
import { insertAccountBody, insertPasswordBody, insertProfileBody } from '../validations/Joi';

const router = Router();

router.put('/profile', [isAuthenticated, validationMiddleware(insertProfileBody)], updateProfileInfo);

router.get('/search/:query', isAuthenticated, searchUser);

router.put('/follow/:id', isAuthenticated, followUser);

router.get('/profile', isAuthenticated, getUserProfile);

router.put('/info', [isAuthenticated, validationMiddleware(insertAccountBody)], updateAccountInfo);

router.put('/password', [isAuthenticated, validationMiddleware(insertPasswordBody)], updateAccountPassword);

export default router;