const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const port = process.env.PORT || 3000;
const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/user');
const publicPath = path.join(__dirname, '../public');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection', socket => {
  console.log(' new user connected');

  // socket.emit(
  //   'newMessage',
  //   generateMessage('ADMIN', 'WELCOME TO MY CHAT ROOM')
  // );
  // socket.broadcast.emit(
  //   'newMessage',
  //   generateMessage('ADMIN', 'NEW USER HAVE BEEN JOINED')
  // );

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);
    if (user && isRealString(message.text)) {
      io.to(user.room).emit(
        'newMessage',
        { ...generateMessage(user.name, message.text), userId: user.id }
      );
    }
    callback();
    // socket.broadcast.emit('newMessage', {
    //   from: message.from,
    //   text: message.text,
    //   createAt: new Date()
    // });
  });
  socket.on('createLocationMessage', coords => {
    const user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'newLocationMessage',
        generateLocationMessage({ from: user.name, ...coords })
      );
    }
  });

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      callback('Name and room name are required');
    }
    params.room = params.room.toLowerCase();
    const usersOnRoom = users.getUserOnRoom(params.room);
    console.log(usersOnRoom)
    if(usersOnRoom.length !== 0) {
      if(params.password !== usersOnRoom[0].password) {
        callback('password not correct');
      }
    }
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room, params.password);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('ADMIN', `WELCOME TO CHAT ROOM`));
    socket.broadcast
      .to(params.room)
      .emit(
        'newMessage',
        generateMessage('ADMIN', `${params.name} has joined`)
      );
    callback();
  });

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit(
        'newMessage',
        generateMessage('Admin', `${user.name} has left`)
      );
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

