import Joi, { type ObjectSchema } from 'joi';
import { ValidationError } from '../lib/utils/customErrors';

// const validator = (schema : ObjectSchema) => (payload : ObjectSchema) => schema.validate(payload, {abortEarly : false});

export const validate = <T>(schema: ObjectSchema, data: T) => {
    const { error, value } = schema.validate(data, { stripUnknown: true });
    if (error) {
        throw new ValidationError(error.message);
    }
    return value;
};