var users = {};

var returnUser = function(id) {
  users[id].connected = true;
  return users[id]
}
var handleUser = function(socket) {
  if(users[socket.id]) {
    return returnUser(socket.id);
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
          return returnUser(socket.id);
        }
      }
    }
  }
  users[socket.id] = {name : "anon", created: Date.now()}

  socket.on('disconnect', function() {
    var id   = socket.id;
    var user = users[id];
    user.connected = false;
    console.log("User(id=" + id + ") disconnected - setting timeout for connection ");
    setTimeout(function() {
      if(!user.connected) {
        delete users[id];
        console.log("User with id " + id + " deleted (timeout)");
      }
    }, 10000)
  });

  return returnUser(socket.id)
};


module.exports = function(io) {
  io.on('connection', handleUser);
  return users;
};
