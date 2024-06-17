import Joi, { type ObjectSchema } from 'joi';
import { ValidationError } from '../libs/utils/customErrors';

// const validator = (schema : ObjectSchema) => (payload : ObjectSchema) => schema.validate(payload, {abortEarly : false});

export const validate = <T>(schema: ObjectSchema, data: T) => {
    const { error, value } = schema.validate(data, { stripUnknown: true });
    if (error) {
        throw new ValidationError(error.message);
    }
    return value;
};

export const RegisterBody = Joi.object({
    username : Joi.string().trim().required().max(255),
    email : Joi.string().email().max(255).required().trim(),
    password : Joi.string().min(6).trim().required()
});

export const VerifyAccountBody = Joi.object({
    activationCode : Joi.string().trim().required().max(4),
    activationToken : Joi.string().trim().required()
});

export const LoginBody = Joi.object({
    username : Joi.string().trim().max(255),
    email : Joi.string().email().max(255).trim(),
    password : Joi.string().min(6).trim().required()
});