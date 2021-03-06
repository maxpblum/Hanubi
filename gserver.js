var _    = require('underscore');
var Game = require('./game');

var GamesHandler = function(ObjSet, oldGameCallback) {

  var gameCounter = 897;
  var games = {}
  var gameDB = new ObjSet('game');

  function writeState(gameID) {
    var state = games[gameID].totalState();
    gameDB.add(gameID, state, function (err, reply) {
      if (err)
        console.log(err);
    });
  }
  
  this.createGame = function(players) {

    var gameID = gameCounter++;
    games[gameID] = new Game(players.length);
    writeState(gameID);

    players.forEach(function(player, index) {
      player.updateProp('num', index);
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
            writeState(gameID);
          }
          catch(err) {
            console.log(err.message);
            player.emit('erra', err.message);
          }
        };
      },
      playCard: function(player, group) {
        return function(play) {
          play = JSON.parse(play)
          try {
            var result = state.playCard(play.player, play.cardIndex);
            var action = result.valid ? 'played a card' : 'tried to play an invalid card';
            group.emitMove({
              player: player.num,
              card: result.card,
              cardIndex: play.cardIndex,
              action: action
            });
            console.log(action);
            group.updateUsers();
            writeState(gameID);
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
            var discarded = state.discard(discard.player, discard.cardIndex);
            group.emitMove({
              player: player.num,
              card: discarded,
              cardIndex: discard.cardIndex,
              action: 'discarded a card'
            });
            group.updateUsers();
            writeState(gameID);
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
      emitMove: function(group) {
        return function(groupMove) {
          group.sendAll('move', JSON.stringify(groupMove));
        };
      },
      updateUsers: function(group) {
        return function() {
          group.emitNames();
          group.emitState();
        }
      },
      userDead: function(group) {
        return function() {
          group.sendAll('killGame', '');
        }
      }
    }
  }

  gameDB.getAll(function(foundGames) {

    console.log('foundGames: ' + JSON.stringify(foundGames));

    var gameKeys = _.keys(foundGames)

    gameKeys.forEach(function(gameKey) {

      if (foundGames[gameKey]) {
        var intGameKey = parseInt(gameKey);
        gameCounter = gameCounter > intGameKey + 1 ? gameCounter : intGameKey + 1;
        games[gameKey] = Game.unfreezeGame( foundGames[gameKey] );

        oldGameCallback(gameKey);
      } else {
        gameDB.delete(gameKey);
      }

    });

  });

}

module.exports = function(ObjSet, oldGameCallback) {
  return new GamesHandler(ObjSet, oldGameCallback);
};
