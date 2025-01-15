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
  console.log('Client connected:', socket.id);

  socket.on('identify', (role) => {
    if (role === 'delBoy') {
      if (delBoySocket) {
        socket.emit('error', 'Del Boy already connected');
        socket.disconnect();
      } else {
        delBoySocket = socket;
        console.log('Del Boy connected:', socket.id);
      }
    } else if (role === 'customer') {
      if (customerSocket) {
        socket.emit('error', 'Customer already connected');
        socket.disconnect();
      } else {
        customerSocket = socket;
        console.log('Customer connected:', socket.id);
      }
    } else {
      socket.disconnect();
      console.log('Disconnected extra client:', socket.id);
    }
  });

  socket.on('send-location', (data) => {
    console.log('Location data:', data);
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
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});