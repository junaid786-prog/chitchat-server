const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://abprocleaners.ca',
    'https://abprocleaners.ca',
    'www.abprocleaners.ca'
];

const allowedHeaders = (req, res, next) => {
    const { origin } = req.headers;

    if (allowedOrigins.includes(origin)) {
        console.log("Allowed Origin", origin);
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Max-Age', 86400);
    }

    res.setHeader('X-Powered-By', 'nginx: 3.0.0');

    if (req.method === "OPTIONS") {
        // Handle preflight OPTIONS request
        res.sendStatus(200);
    } else {
        next();
    }
}

module.exports = allowedHeaders;
