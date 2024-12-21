const http = require('http');
const app = require('./src/app');
const { CONFIG } = require('./src/config/config');
const { Server } = require('socket.io');
const matchmakingSocket = require('./src/sockets/matchmakingSocket');

const port = CONFIG.PORT; 

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

matchmakingSocket(io);
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
