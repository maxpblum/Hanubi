var http = require('http');
var app  = http.createServer().listen(3001);
var io   = require('socket.io')(app);
var _    = require('underscore');

var userHandler = require('./users.js')(io);
var gameServer = require('./gserver.js')(io);

var chatGroup = userHandler.makeGroup(
  'chat', 
  { // User message methods
    rename: function(user, group) {
      return function(newName) {
        console.warn("User '"+ user.name + "' changed name to '" + newName + "'");
        user.name = newName;
        group.emitNames();
      };
    },
    startGame: function(user, group) {
      return function() {
        var gameID = gameServer.createGame(group.users);   
        var gameGroup = userHandler.makeGroup(gameID, 
                                              gameServer.userMessages(gameID), 
                                              gameServer.groupMethods(gameID));
        group.sendAll('gameIsStarting', gameID);
        group.clearUsers();
      };
    },
    chat: function(user, group) {
      return function(text) {
        group.sendAll('chat', {
          name: user.name,
          text: text
        });
        console.log("User '" + user.name + "' said '" + text + "'");
      };
  }
});
