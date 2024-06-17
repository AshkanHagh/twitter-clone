import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { TCookieOptions, TInferSelectUser } from '../../@types';
import type { Response } from 'express';
import { InsertIntoHashCache } from '../../database/cache';

const accessTokenExpire : number = parseInt(process.env.ACCESS_TOKEN_EXPIRE);
const refreshTokenExpire : number = parseInt(process.env.REFRESH_TOKEN_EXPIRE);

export const accessTokenOption = <TCookieOptions>{
    expires : new Date(Date.now() + accessTokenExpire * 24 * 60 * 60 * 1000),
    maxAge : accessTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly : true, sameSite : 'lax'
}

export const refreshTokenOption = <TCookieOptions>{
    expires : new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge : refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly : true, sameSite : 'lax'
}

export const sendToken = (user : TInferSelectUser, res : Response, tokenFor : 'login' | 'refresh') => {
    const accessToken : string = jwt.sign({id : user.id}, process.env.ACCESS_TOKEN, {expiresIn : '1h'});
    const refreshToken : string = jwt.sign({id : user.id}, process.env.REFRESH_TOKEN, {expiresIn : '7d'});

    const {password, ...others} = user;
    InsertIntoHashCache(`user:${others.id}`, others, 604800);
    if(process.env.NODE_ENV == 'production') accessTokenOption.secure = true;

    res.cookie('access_token', accessToken, accessTokenOption);
    res.cookie('refresh_token', refreshToken, refreshTokenOption);

    if(tokenFor == 'refresh') return {accessToken};
    return {user : others, accessToken};
}

export const decodedToken = (refreshToken : string) => {
    return jwt.verify(refreshToken, process.env.REFRESH_TOKEN) as (JwtPayload & TInferSelectUser);
}