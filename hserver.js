var http = require('http');
var app  = http.createServer().listen(3001);
var io   = require('socket.io')(app);

var users = require('./users.js')(io);

io.on('connection', function(socket) {
  console.log(users[socket.id]);
});



