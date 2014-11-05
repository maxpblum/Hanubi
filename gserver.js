var _    = require('underscore');
var Game = require('./game');

var GamesHandler = function(io) {

  var gameCounter = 897;
  var games = {}
  
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
              clue.recipient, clue.suitOrNumber);
            group.emitClue({
              giver: clue.giver,
              recipient: clue.recipient,
              suitOrNumber: clue.suitOrNumber,
              matching: matching
            });
            group.updateUsers();
          }
          catch(err) {
            console.log(err.message);
            player.emit('erra', err.message);
          }
        };
      },
      playCard: function(player, group) {
        return function(play) {
          console.log("PLAYING CARD");
          play = JSON.parse(play)
          try {
            state.playCard(play.player, play.cardIndex)
            group.updateUsers()
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
            group.updateUsers()
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
      emitClue: function(group) {
        return function(groupClue) {
          group.sendAll('clue', JSON.stringify(groupClue));
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
