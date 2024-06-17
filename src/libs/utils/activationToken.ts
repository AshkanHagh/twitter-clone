import jwt from 'jsonwebtoken';
import type { TActivationToken, TInferSelectUser, TVerifyActivationToken } from '../../@types';
import ErrorHandler from './errorHandler';

export const createActivationToken = (user : TInferSelectUser) : TActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const activationToken = jwt.sign({user, activationCode}, process.env.ACTIVATION_TOKEN, {expiresIn : '5m'});
    return {activationCode, activationToken};
}

export const verifyActivationToken = (activationToken : string) : TVerifyActivationToken => {
    try {
        const { user, activationCode } = jwt.verify(activationToken, process.env.ACTIVATION_TOKEN) as 
        {user : TInferSelectUser, activationCode : string}
        return {user, activationCode};
        
    } catch (error : any) {
        throw new ErrorHandler(error.message, 400);
    }
}