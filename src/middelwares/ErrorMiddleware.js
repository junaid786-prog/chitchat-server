const ErrorMiddleware = (err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message || 'Internal server error';

    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Validation error';
    }

    if (err.name === 'CastError') {
        status = 400;
        message = 'Invalid ID';
    }
    
    
    res.status(status).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
}

module.exports = ErrorMiddleware;