var _    = require('underscore');

var UserHandler = function(io) {
  
  var users = {};

  this.connected = function() {
    return users;
  };

  this.emit = function() {
    var names = _.pairs(users).map(function(user) {
      return {id: user[0], name: user[1].name};
    });
    io.emit('players', names);
    console.log("Emitted " + names.length + " player name(s)");
  }

  var connect = function(id) {
    var user = users[id];
    user.connected = true;
    console.log("User '" + user.name + "' with id '" + id + "' connected");
    this.emit();
    return users[id];
  }.bind(this);

  io.on('connection', function(socket) {
    var user;
    if(users[socket.id]) {
      console.log('found the same socket id: ' + socket.id)
      user      = connect(socket.id);
      user.emit = socket.emit.bind(socket);
    }

    var cookie = socket.handshake.headers.cookie;
    if(!user && cookie) {
      var values = cookie.split(";").map(function(value) { return value.trim().split("="); });
      for(var i=0; i<values.length; i++) {
        var value = values[i];
        if(value[0] === 'io') {
          if(users[value[1]]) {
            console.log('updating socket for ' + users[value[1]].name);
            users[socket.id] = users[value[1]];
            users[socket.id].socket = socket;
            users[socket.id].emit = socket.emit.bind(socket);
            delete users[value[1]];
            user = users[socket.id];
          }
        }
      }
    } 

    if(!user) {
      users[socket.id] = {created: Date.now(),
                          name: "Anonymous",
                          emit: socket.emit.bind(socket)};
      console.log('made new user with id ' + socket.id);  
    }

    socket.on('disconnect', function() {
      var id   = socket.id;
      var user = users[id];
      user.connected = false;
      console.log("User(id=" + id + ") disconnected - setting timeout for connection ");
      setTimeout(function() {
        if(!user.connected) {
          delete users[id];
          this.emit();
          console.log("User with id " + id + " deleted (timeout)");
        }
      }.bind(this), 10000)
    }.bind(this));


    connect(socket.id)

  }.bind(this));

}

module.exports = function(io) {
  return new UserHandler(io);
};
