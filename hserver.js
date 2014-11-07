var port = process.env.PORT || 3000;

var http   = require('http');

var static = require('node-static');
var file = new static.Server('./public');

var app = http.createServer(function(request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response);
    }).resume();
}).listen(port);

var io     = require('socket.io')(app);
var _      = require('underscore');

var userHandler = require('./users.js')(io);
var gameServer = require('./gserver.js')(io);

function makeRename(user, group) {

  return function(newName) {

    console.warn("User '"+ user.name + "' changed name to '" + newName + "'");
    user.name = newName;
    group.emitNames();

  };

}

function makeChat(user, group) {

  return function(text) {

    group.sendAll('chat', {
      name: user.name,
      text: text
    });
    console.log("User '" + user.name + "' said '" + text + "'");

  };

}

function makeStartGame(user, group) {

  return function() {
    var gameID = gameServer.createGame(group.users);   

    var userMessages    = gameServer.userMessages(gameID);
    var groupMethods    = gameServer.groupMethods(gameID);
    userMessages.rename = makeRename;
    userMessages.chat   = makeChat;

    var gameGroup = userHandler.makeGroup(gameID, 
                                          userMessages, 
                                          groupMethods);
    group.sendAll('gameIsStarting', gameID);
    group.clearUsers();
  };

}

var chatGroup = userHandler.makeGroup(
  'chat', 
  { // User message methods
    rename: makeRename,
    startGame: makeStartGame,
    chat: makeChat
  }
);
