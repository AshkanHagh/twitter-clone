import type { TInferSelectUser, TVerifyActivationToken } from '../@types';
import { findInHashCache } from '../database/cache';
import { findFirstUser, insertUserAuthInfo } from '../database/queries/user.model';
import userEventEmitter from '../events/auth.event';
import { EmailOrUsernameExistsError, InvalidEmailOrPasswordError, InvalidVerifyCode, LoginRequiredError, TokenRefreshError, comparePassword, createActivationToken, decodedToken, hashPassword, verifyActivationToken } from '../libs/utils';
import ErrorHandler from '../libs/utils/errorHandler';

export const registerService = async (username : string, email : string, password : string) : Promise<string> => {
    try {
        const isUserExists : TInferSelectUser | undefined = await findFirstUser(email, username, undefined);
        if(isUserExists) throw new EmailOrUsernameExistsError();
        
        const hashedPassword : string = await hashPassword(password);
        const user = {username, email, password : hashedPassword} as TInferSelectUser;

        const { activationCode, activationToken } = createActivationToken(user);
        userEventEmitter.emit('registerEmail', email, activationCode);
        return activationToken;
        
    } catch (error : any) {
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const verifyAccountService = async (activationToken : string, activationCode : string) : Promise<void> => {
    try {
        const token : TVerifyActivationToken = verifyActivationToken(activationToken);
        if(token.activationCode !== activationCode) throw new InvalidVerifyCode();

        const { username, email, password } = token.user;
        const isUserExists : TInferSelectUser | undefined = await findFirstUser(email, username.toLowerCase(), undefined);
        if(isUserExists) throw new EmailOrUsernameExistsError();

        insertUserAuthInfo(email, username, password);
        
    } catch (error : any) {
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const loginService = async (email : string | undefined, username : string | undefined, password : string) : Promise<TInferSelectUser> => {
    try {
        const isUserExists : TInferSelectUser | undefined = await findFirstUser(email, username, undefined);
        const isPasswordMatch : boolean = await comparePassword(password, isUserExists?.password || '');

        if(!isUserExists || !isPasswordMatch) throw new InvalidEmailOrPasswordError();
        return isUserExists;
        
    } catch (error : any) {
        throw new ErrorHandler(`An error occurred : ${error.message}`, 400);
    }
}

export const refreshTokenService = async (refreshToken : string) : Promise<TInferSelectUser> => {
    try {
        const decoded : TInferSelectUser = decodedToken(refreshToken);
        if(!decoded) throw new LoginRequiredError();

        const session : TInferSelectUser = await findInHashCache(`user:${decoded.id}`);
        if(Object.keys(session).length <= 0) throw new TokenRefreshError();

        return session;
        
    } catch (error : any) {
        throw new ErrorHandler(`An error occurred : ${error.message}`, 400);
    }
}