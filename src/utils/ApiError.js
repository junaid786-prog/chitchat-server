class APIError extends Error {
    constructor(statusCode = 500, message = 'Internal server error') {
        console.log('APIError', statusCode, message);
        super(message);
        this.status = statusCode;
    }
}

class ValidationError extends APIError {
    constructor(message = 'Validation error') {
        super(400, message);
    }
}

class NotFoundError extends APIError {
    constructor(message = 'Not found') {
        super(404, message);
    }
}

module.exports = {
    APIError,
    ValidationError,
    NotFoundError
};
