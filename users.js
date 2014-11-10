var _    = require('underscore');

var UserHandler = function(io, dataClient, timeout) {
  timeout = timeout || 60;
  
  var users = {};
  var userDB = new dataClient.ObjSet('user');

  function findUserAndThen(socket, cb) {

    var newID = socket.id;

    var cookie = socket.handshake.headers.cookie;
    var values = cookie.split(";").map(function(value) { return value.trim().split("="); });

    var oldID;

    for (var i = 0; i < values.length; i++) {
      var value = values[i];
      if (value[0] === 'io') {
        oldID = value[1];
        break;
      }
    }

    if (users[newID]) {

      console.log('found the same socket id: ' + newID)

    } else if (users[oldID]) {

      console.log('updating socket for ' + users[oldID].name);
      users[newID] = users[oldID];

      deleteUser(oldID);
      userDB.add(newID, users[newID]);

    } else if (false) {

      userDB.get(newID, function(user) {

        users[newID] = user;
        cb(user);

      });

      return; // Because cb will be run asynchronously

    } else {
      makeNewUser(newID);
    }

    cb(users[newID]);
  }

  function makeNewUser(id) {
    var dateAndTime = Date.now();
    users[id] = {created: dateAndTime, name: "Anonymous"};

    console.log('made new user with id ' + id); 
    
    userDB.add(id, users[id]);
  }

  function deleteUser(id) {
    delete users[id];
    userDB.delete(id);
  }

  this.makeGroup = function(name, userMessages, groupMethods) {
    var nsp = name ? io.of('/' + name) : io;

    var group = {
      users: [],
      sendAll: nsp.emit.bind(nsp),
      emitNames: function() {
        var userNames = this.users.map(function(user, index) {
          return {id: user.num, 
                  name: user.name};
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
      userDisconnected: function(user) {

        for (var i = 0; i < this.users.length; i++) {
          if (this.users[i] === user) {
            this.users.splice(i, 1);
            break;
          }
        }

        this.emitNames();
      },
      userDead: function(user) {},
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

      var installUser = function(user) {

        if (!_.find(group.users, function(groupUser) { return groupUser === user; })) {
          group.users.push(user);
        }

        user.connected = true;
        user.updateProp('connected', true);

        socket.on('disconnect', function() {

          user.connected = false;
          user.updateProp('connected', false);
          console.log("User(id=" + socket.id + ") disconnected - setting timeout for connection ");
          
          group.userDisconnected(users[socket.id]);

          setTimeout(function() {

            if(!user.connected) {
              group.userDead(users[socket.id]);
              deleteUser(socket.id);
              console.log("User with id " + socket.id + " deleted (timeout)");
            }

          }, 1000 * timeout)

        });

        if (userMessages) {
          _.keys(userMessages).forEach(function(messageName) {
            user[messageName] = userMessages[messageName](user, group);
            socket.on(messageName, user[messageName]);
          });
        }

        user.emit = socket.emit.bind(socket);
        group.updateUsers();

      };

      findUserAndThen(socket, installUser);

    });

    return group;
  };

}

module.exports = function(io) {
  return new UserHandler(io);
};
