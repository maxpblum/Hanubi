var _    = require('underscore');
var Game = require('./game');

var GamesHandler = function(io) {

  var gameCounter = 897;
  var games = {}
  
  // this.createGame = function(players) {

  //   function emitState() {
  //     for(var i=0; i< sockets.length; i++) {
  //       sockets[i].emit('gameState', state.stringify(i));

  //     }
  //   }

  //   var state = new Game(players.length);
  //   var gameID = gameCounter++;

  //   var nextNum = 0;
  //   var sockets = [];

  //   var nsp = io.of('/' + gameID);

  //   nsp.on('connection', function(socket) {
  //     var playerNum = nextNum++;
  //     sockets.push(socket);

  //     console.log('Player connected to namespace with socket ID ' + socket.id)
  //     socket.emit('gameState', state.stringify(playerNum));

  //     socket.on('clue', function(clue){
  //       clue = JSON.parse(clue)
  //       try {
  //         var matching = state.giveClue(clue.giver, 
  //           clue.recipient, clue.suitOrNumber)
  //         emitState()
  //       }
  //       catch(err) {
  //         console.log(err.message)
  //         socket.emit('erra', err.message)
  //       }
  //     }.bind(this))
  //     socket.on('playCard', function(play){
  //       console.log("PLAYING CARD");
  //       play = JSON.parse(play)
  //       try {
  //         state.playCard(play.player, play.cardIndex)
  //         emitState()
  //       }
  //       catch(err) {
  //         console.log(err.message)
  //         socket.emit('erra', err.message)
  //       }
  //     }.bind(this))
  //     socket.on('discard' , function(discard){
  //       discard = JSON.parse(discard)
  //       try {
  //         state.discard(discard.player, discard.cardIndex)
  //         emitState()
  //       }
  //       catch(err) {
  //         console.log(err.message)
  //         socket.emit('erra', err.message)
  //       }

  //     });
  //   });

  //   return gameID;

  // };

  this.createGame = function(players) {

    var gameID = gameCounter++;
    games[gameID] = new Game(players.length);

    players.forEach(function(player, index) {
      player.num = index;
    });

    return gameID;
  };

  this.userMessages = function(gameID) {

    var state = games[gameID];

    return {
      clue: function(player, group) {
        return function(clue) {
          clue = JSON.parse(clue)
          try {
            var matching = state.giveClue(clue.giver, 
              clue.recipient, clue.suitOrNumber)
            group.emitState()
          }
          catch(err) {
            console.log(err.message)
            player.emit('erra', err.message)
          }
        };
      },
      playCard: function(player, group) {
        return function(play) {
          console.log("PLAYING CARD");
          play = JSON.parse(play)
          try {
            state.playCard(play.player, play.cardIndex)
            group.emitState()
          }
          catch(err) {
            console.log(err.message)
            player.emit('erra', err.message)
          }
        };
      },
      discard: function(player, group) {
        return function(discard) {
          discard = JSON.parse(discard)
          try {
            state.discard(discard.player, discard.cardIndex)
            group.emitState()
          }
          catch(err) {
            console.log(err.message)
            player.emit('erra', err.message)
          }
        };
      }
    }
  };

  this.groupMethods = function(gameID) {

    var state = games[gameID];

    return {
      emitState: function(group) {
        return function() {
          console.log('in emitState');
          group.users.forEach(function(player) {
            console.log('emitting state to ' + player.name);
            player.emit('gameState', state.stringify(player.num));
          });
        };
      },
      updateUsers: function(group) {
        return function() {
          console.log('in the new, game-written updateUsers method')
          group.emitNames();
          group.emitState();
        }
      }
    }
  }

}

module.exports = function(io) {
  return new GamesHandler(io);
};
