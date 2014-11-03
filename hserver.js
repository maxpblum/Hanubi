var http = require('http');
var app  = http.createServer().listen(3001);
var io   = require('socket.io')(app);
var _    = require('underscore');

var users = require('./users.js')(io);


var chat = io.of('/chat');

chat.on('connection', function(socket) {
  console.log('User with id ' + socket.id + ' connected to chat namespace');

  socket.on('chat', function(text) {
    chat.emit('chat', {
      name: users.connected()[socket.id].name,
      text: text
    });
    console.log('User named ' + users.connected()[socket.id].name + ' said ' + text);
  });
});

io.on('connection', function(socket) {
  console.log(users.connected()[socket.id]);

  socket.on('rename', function(name) {
    console.log('User with id ' + socket.id + ' changed name to ' + name);
    users.connected()[socket.id].name = name;
    users.emit();
  });
});
