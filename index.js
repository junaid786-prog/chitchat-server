const http = require('http');
const app = require('./src/app');

const port = process.env.PORT || 8000;

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
