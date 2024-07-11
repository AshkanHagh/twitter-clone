import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { followers, followings, followUser, getUserProfile, searchUser, suggestionForFollow, updateAccountInfo, updateAccountPassword, 
    updateProfileInfo } from '../controllers/user.controller';
import validationMiddleware from '../middlewares/validation.body';
import { insertAccountBody, insertPasswordBody, insertProfileBody } from '../validations/Joi';
import { clearNotifications, getNotifications } from '../controllers/notification.controller';

const router = Router();

router.put('/me', [isAuthenticated, validationMiddleware(insertProfileBody)], updateProfileInfo);

router.get('/profile/:username', isAuthenticated, searchUser);

router.put('/follow/:id', isAuthenticated, followUser);

router.get('/me', isAuthenticated, getUserProfile);

router.patch('/account', [isAuthenticated, validationMiddleware(insertAccountBody)], updateAccountInfo);

router.patch('/account/password', [isAuthenticated, validationMiddleware(insertPasswordBody)], updateAccountPassword);

router.get('/notifications', isAuthenticated, getNotifications);

router.delete('/notifications', isAuthenticated, clearNotifications);

router.get('/follow/suggestions', isAuthenticated, suggestionForFollow);

router.get('/followings', isAuthenticated, followings);

router.get('/followers', isAuthenticated, followers);

export default router;