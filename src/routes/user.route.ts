import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { followUser, getUserProfile, searchUser, suggestionForFollow, updateAccountInfo, updateAccountPassword, updateProfileInfo } from '../controllers/user.controller';
import validationMiddleware from '../middlewares/validation.body';
import { insertAccountBody, insertPasswordBody, insertProfileBody } from '../validations/Joi';
import { clearNotifications, getNotifications } from '../controllers/notification.controller';

const router = Router();

router.put('/profile', [isAuthenticated, validationMiddleware(insertProfileBody)], updateProfileInfo);

router.get('/search/:query', isAuthenticated, searchUser);

router.put('/follow/:id', isAuthenticated, followUser);

router.get('/profile', isAuthenticated, getUserProfile);

router.put('/info', [isAuthenticated, validationMiddleware(insertAccountBody)], updateAccountInfo);

router.put('/password', [isAuthenticated, validationMiddleware(insertPasswordBody)], updateAccountPassword);

router.get('/notifications', isAuthenticated, getNotifications);

router.delete('/notifications', isAuthenticated, clearNotifications);

router.get('/suggestions', isAuthenticated, suggestionForFollow);

export default router;