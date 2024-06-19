import type { TErrorHandler, TInferSelectUser, TInferSelectUserNoPass, TUserWithProfileInfo, TVerifyActivationToken } from '../@types';
import { findInHashCache } from '../database/cache';
import { findFirstUser, insertUserAuthInfo } from '../database/queries/user.query';
import emailEventEmitter from '../events/email.event';
import { EmailOrUsernameExistsError, InvalidEmailOrPasswordError, InvalidVerifyCode, LoginRequiredError, TokenRefreshError, comparePassword, createActivationToken, decodedToken, hashPassword, verifyActivationToken } from '../libs/utils';
import ErrorHandler from '../libs/utils/errorHandler';

export const registerService = async (username : string, email : string, password : string) : Promise<string> => {
    try {
        const isUserExists : TInferSelectUserNoPass | undefined = await findFirstUser(email, username, undefined);
        if(isUserExists) throw new EmailOrUsernameExistsError();
        
        const hashedPassword : string = await hashPassword(password);
        const user = {username : username.toLowerCase(), email : email.toLowerCase(), password : hashedPassword} as TInferSelectUser;

        const { activationCode, activationToken } = createActivationToken(user);
        emailEventEmitter.emit('registerEmail', email, activationCode);
        return activationToken;
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const verifyAccountService = async (activationToken : string, activationCode : string) : Promise<void> => {
    try {
        const token : TVerifyActivationToken = verifyActivationToken(activationToken);
        if(token.activationCode !== activationCode) throw new InvalidVerifyCode();

        const { username, email, password } = token.user;
        const isUserExists : TInferSelectUserNoPass | undefined = await findFirstUser(email, username.toLowerCase(), undefined);
        if(isUserExists) throw new EmailOrUsernameExistsError();

        insertUserAuthInfo(email, username, password);
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const loginService = async (email : string | undefined, username : string | undefined, password : string) : Promise<TUserWithProfileInfo> => {
    try {
        const isUserExists : TUserWithProfileInfo | undefined = await findFirstUser(email?.toLowerCase(), username?.toLowerCase(), undefined);
        const isPasswordMatch : boolean = await comparePassword(password, isUserExists?.password || '');

        if(!isUserExists || !isPasswordMatch) throw new InvalidEmailOrPasswordError();
        return isUserExists;
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}

export const refreshTokenService = async (refreshToken : string) : Promise<TUserWithProfileInfo> => {
    try {
        const decoded : TInferSelectUser = decodedToken(refreshToken);
        if(!decoded) throw new LoginRequiredError();

        const session : TUserWithProfileInfo = await findInHashCache(`user:${decoded.id}`);
        if(Object.keys(session).length <= 0) throw new TokenRefreshError();

        return session;
        
    } catch (err) {
        const error = err as TErrorHandler;
        throw new ErrorHandler(`An error occurred : ${error.message}`, error.statusCode);
    }
}