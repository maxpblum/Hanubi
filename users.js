var _    = require('underscore');

var UserHandler = function(io, ObjSet, timeout) {

  timeout = timeout || 60;
  
  var users = {};
  var userDB = new ObjSet('user');

  function cookieID(cookie) {

    if (cookie) {

      var values = cookie.split(";").map(function(value) { return value.trim().split("="); });

      for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if (value[0] === 'io') {
          return value[1];
        }
      }

    }

    return;

  }

  function findUserAndThen(socket, cb) {

    var newID = socket.id;
    var oldID = cookieID(socket.handshake.headers.cookie);

    if (users[newID]) {

      console.log('found the same socket id: ' + newID)
      if (cb)
        cb(users[newID]);

    } else if (oldID && users[oldID]) {

      updateSocket(newID, oldID, cb);

    } else { // Didn't find the user in memory, checking database

      userFromDB(newID, oldID, function(user) {
        
        users[newID].updateProp = userDB.makeUpdateProp(users[newID], newID);
        users[newID] = user;
        if (cb)
          cb(users[newID]);

      });
    }

  }

  function updateSocket(newID, oldID, cb) {

    console.log('updating socket for ' + users[oldID].name);
    users[newID] = users[oldID];

    deleteUser(oldID);
    userDB.add(newID, users[newID], function() {
      users[newID].updateProp = userDB.makeUpdateProp(users[newID], newID);
      if (cb)
        cb(users[newID]);
    });

  }

  function newUser(id, cb) {

    var dateAndTime = Date.now();
    users[id] = {created: dateAndTime, name: "Anonymous"};

    console.log('made new user with id ' + id); 
    
    userDB.add(id, users[id], function(err, reply) {
      if (err) {
        console.log(err);
      } else if (cb) {
        cb(users[id]);
      }
    });

  }

  function userFromDB(id, oldID, cb) {

    userDB.get(id, function(err, user) {

      if (err) {
        console.log(err);
      }

      if (!user) { // Current ID not found in DB

        if (oldID) { // User has a previous ID

          userDB.get(oldID, function(err, user) {

            if (err) {
              console.log(err);
            } else if (!user) { // User not in DB at all
              newUser(id, cb);

            } else { // User found under previous ID

              users[oldID] = user;
              updateSocket(id, oldID, cb);

            }
          });
        } else { // No previous ID
          console.log("Here!")
          newUser(id, cb);
        }
      } else { // User found under current ID

        users[id] = user;
        if (cb)
          cb(user);

      }

    });

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
          // User isn't already in this group, so add it
          group.users.push(user);
        }

        user.updateProp('connected', true);

        socket.on('disconnect', function() {

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

module.exports = function(io, ObjSet, timeout) {
  return new UserHandler(io, ObjSet, timeout);
};
