import ErrorHandler from './errorHandler';

class ValidationError extends ErrorHandler {
    constructor(message : string) {
        super(message, 400);
    }
}

class RouteNowFoundError extends ErrorHandler {
    constructor(message : string) {
        super(message, 404);
    }
}

class BadRequestError extends ErrorHandler {
    constructor(message : string = 'Bad request') {
        super(message, 400);
    }
}

class UnauthorizedError extends ErrorHandler {
    constructor(message : string = 'Unauthorized') {
        super(message, 401);
    }
}

class ForbiddenError extends ErrorHandler {
    constructor(message : string = 'Forbidden') {
        super(message, 403);
    }
}

class ResourceNotFoundError extends ErrorHandler {
    constructor(message : string = 'Resource not found') {
        super(message, 404);
    }
}

class UsernameExistsError extends ErrorHandler {
    constructor(message : string = 'Username already exists') {
        super(message, 409); // 409 Conflict
    }
}

class InvalidUserIdError extends ErrorHandler {
    constructor(message : string = 'Invalid id - User not found') {
        super(message, 400);
    }
}

class InvalidUsernameOrPasswordError extends ErrorHandler {
    constructor(message : string = 'Invalid username or password') {
        super(message, 401);
    }
}

class TokenRefreshError extends ErrorHandler {
    constructor(message : string = 'Could not refresh token') {
        super(message, 400);
    }
}

class LoginRequiredError extends ErrorHandler {
    constructor(message : string = 'Please login to access this resource') {
        super(message, 401);
    }
}

class AccessTokenInvalidError extends ErrorHandler {
    constructor(message : string = 'Access token is not valid') {
        super(message, 401);
    }
}

class InternalServerError extends ErrorHandler {
    constructor(message : string = 'Internal server error') {
        super(message, 500);
    }
}

class PasswordDoesNotMatch extends ErrorHandler {
    constructor(message : string = 'Password dose not match') {
        super(message, 400)
    }
}

export {BadRequestError, UnauthorizedError, ForbiddenError, ResourceNotFoundError, UsernameExistsError, PasswordDoesNotMatch,
    InvalidUserIdError, InvalidUsernameOrPasswordError, LoginRequiredError, InternalServerError, AccessTokenInvalidError, ValidationError,
    TokenRefreshError, RouteNowFoundError
};