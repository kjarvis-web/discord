const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./utils/config');
const logger = require('./utils/logger');

// app.listen(config.PORT, () => {
//   logger.info(`Server running on port ${config.PORT}`);
// });

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('join_room', (id) => {
    socket.join(id);
  });

  // socket.on('send_message', (data) => {
  //   socket.broadcast.emit('receive_message', data);
  // });

  socket.on('send_message', (id, data) => {
    socket.to(id).emit('receive_message', data);
  });
});

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
