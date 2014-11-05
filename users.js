var _    = require('underscore');

var UserHandler = function(io) {
  
  var users = {};

  this.makeGroup = function(name, userMessages, groupMethods) {
    var nsp = name ? io.of('/' + name) : io;

    var group = {
      users: [],
      sendAll: nsp.emit.bind(nsp),
      emitNames: function() {
        var userNames = this.users.map(function(user, index) {
          return {id: user.num ? user.num : index, name: user.name};
        });
        this.sendAll('players', userNames);
        console.log("Emitted " + userNames.length + " player name(s) to namespace " + name);
      },
      updateUsers: function() {
        this.emitNames();
      },
      connected: function() {
        return this.users;
      },
      userDeleted: function(user) {

        for (var i = 0; i < this.users.length; i++) {
          if (this.users[i] === user) {
            this.users.splice(i, 1);
            break;
          }
        }

        this.emitNames();
      },
      clearUsers: function() {
        this.users = [];
      }
    };

    if (groupMethods) {
      _.keys(groupMethods).forEach(function(methodName) {
        group[methodName] = groupMethods[methodName](group);
      });
    }

    nsp.on('connection', function(socket) {

      var user;

      if(users[socket.id]) {
        console.log('found the same socket id: ' + socket.id)
        user           = users[socket.id];
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
              delete users[value[1]];
              user = users[socket.id];

            }
          }
        }
      } 

      if(!user) {
        users[socket.id] = {created: Date.now(),
                            name: "Anonymous"};
        user = users[socket.id]
        console.log('made new user with id ' + socket.id);  
      }

      if (!_.find(group.users, function(groupUser) { return groupUser === user; })) {
        group.users.push(user);
      }

      user.connected = true;

      socket.on('disconnect', function() {

        user.connected = false;
        console.log("User(id=" + socket.id + ") disconnected - setting timeout for connection ");

        setTimeout(function() {

          if(!user.connected) {
            group.userDeleted(users[socket.id]);
            delete users[socket.id];
            console.log("User with id " + socket.id + " deleted (timeout)");
          }

        }, 10000)

      });

      if (userMessages) {
        _.keys(userMessages).forEach(function(messageName) {
          user[messageName] = userMessages[messageName](user, group);
          socket.on(messageName, user[messageName]);
        });
      }

      user.emit = socket.emit.bind(socket);
      group.updateUsers();

    });

    return group;
  };

}

module.exports = function(io) {
  return new UserHandler(io);
};
