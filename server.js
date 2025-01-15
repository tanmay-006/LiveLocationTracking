const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let delBoySocket = null;
let customerSocket = null;

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('location-update', (data) => {
    io.emit('update-location', data); // Broadcast location update
  });

  socket.on('disconnect', () => {
    if (socket === delBoySocket) {
      delBoySocket = null;
      console.log('Del Boy disconnected:', socket.id);
    } else if (socket === customerSocket) {
      customerSocket = null;
      console.log('Customer disconnected:', socket.id);
    } else {
      console.log('Client disconnected:', socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});