import { Router, type NextFunction, type Request, type Response } from 'express';
import validationMiddleware from '../middlewares/validation.body';
import { LoginBody, RegisterBody, VerifyAccountBody } from '../validations/Joi';
import { login, logout, refreshToken, register, verifyAccount } from '../controllers/auth.controller';
import { RouteNowFoundError } from '../libs/utils';
import { isAuthenticated } from '../middlewares/auth';
// import { loginRateLimit, requestVerificationCodeRateLimit } from '../middlewares/rate-limit';

const router = Router();

router.post('/register', validationMiddleware(RegisterBody), register);

router.post('/verify', validationMiddleware(VerifyAccountBody), verifyAccount);

router.post('/login', validationMiddleware(LoginBody), login);

router.get('/logout', isAuthenticated, logout);

router.get('/refresh', refreshToken);

router.all('*', (req : Request, res : Response, next : NextFunction) => {
    next(new RouteNowFoundError(`Route :${req.originalUrl} not found`));
}); 

export default router;