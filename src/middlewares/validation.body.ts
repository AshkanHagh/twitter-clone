import type { NextFunction, Request, Response } from 'express';
import type { ObjectSchema } from 'joi';
import { ValidationError } from '../libs/utils';
import { validate } from '../validations/Joi';
import type { TErrorHandler } from '../types/types';

const validationMiddleware = (schema : ObjectSchema) => {
    return (req : Request, res : Response, next : NextFunction) => {
        try {
            req.body = validate(schema, req.body);
            next()
        } catch (err) {
            const error = err as TErrorHandler
            return next(new ValidationError(error.message));
        }
    }
}
export default validationMiddleware;