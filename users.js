var _    = require('underscore');


var UserHandler = function(io) {
  

  users = {};
  this.connected = function() {
    return users;
  };

  this.emit = function() {
    var names = _.values(users).map(function(user) {
      return user.name;
    });
    io.emit('players', names);
  }

  var connect = function(id) {
    users[id].connected = true;
    this.emit();
    return users[id];
  }.bind(this);

  io.on('connection', function(socket) {
    if(users[socket.id]) {
      return connect(socket.id);
    }
    var cookie = socket.handshake.headers.cookie;
    if(cookie) {
      var values = cookie.split(";").map(function(value) { return value.trim().split("="); });
      for(var i=0; i<values.length; i++) {
        var value = values[i];
        if(value[0] === 'io') {
          if(users[value[1]]) {
            users[socket.id] = users[value[1]];
            delete users[value[1]];
            return connect(socket.id);
          }
        }
      }
    }
    users[socket.id] = {created: Date.now(),
                        name: "Anonymous"}

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


    return connect(socket.id)

  }.bind(this));

}

module.exports = function(io) {
  return new UserHandler(io);
};
