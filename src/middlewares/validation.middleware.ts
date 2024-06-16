import type { NextFunction, Request, Response } from 'express';
import type { ObjectSchema } from 'joi';
import { ValidationError } from '../lib/utils/customErrors';
import { validate } from '../validations/Joi';

const validationMiddleware = (schema : ObjectSchema) => {
    return (req : Request, res : Response, next : NextFunction) => {
        try {
            req.body = validate(schema, req.body);
            next()
        } catch (error : any) {
            return next(new ValidationError(error.message));
        }
    }
}
export default validationMiddleware;