const http = require('http');
const app = require('./src/app');
const { CONFIG } = require('./src/config/config');

const port = CONFIG.PORT; 

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
