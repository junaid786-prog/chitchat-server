const http = require('http');
const app = require('./src/app');
const { CONFIG } = require('./src/config/config');
const { Server } = require('socket.io');
const matchmakingSocket = require('./src/sockets/matchmakingSocket');
const chatSocket = require('./src/sockets/chatSocket');
const notificationSocket = require('./src/sockets/notificationSocket');

const port = CONFIG.PORT;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const initializeSockets = (io) => {
    matchmakingSocket(io);
    chatSocket(io);
    notificationSocket(io);
};

initializeSockets(io);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
