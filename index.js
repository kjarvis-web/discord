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
    origin: config.url,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('join_room', (id) => {
    socket.join(id);
  });

  socket.on('send_message', (id, data) => {
    socket.to(id).emit('receive_message', data);
  });

  socket.on('edit_message', (id, data) => {
    socket.to(id).emit('receive_edit', data);
  });

  socket.on('notify', (id, data) => {
    socket.to(id).emit('receive_notify', data);
  });

  socket.on('leave_all', () => {
    socket.disconnect();
  });
});

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
  logger.info(`url is ${config.url}`);
});
