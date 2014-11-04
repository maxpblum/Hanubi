var _    = require('underscore');
var Game = require('./game');

var GamesHandler = function(io) {

  var gameCounter = 897;
  
  this.createGame = function(players) {

    function emitState() {
      for(var i=0; i< sockets.length; i++) {
        sockets[i].emit('gameState', state.stringify(i));

      }
    }


    var state = new Game(players.length);
    var gameID = gameCounter++;

    var nextNum = 0;
    var sockets = [];

    var nsp = io.of('/' + gameID);

    nsp.on('connection', function(socket) {
      var playerNum = nextNum++;
      sockets.push(socket);

      console.log('Player connected to namespace with socket ID ' + socket.id)
      socket.emit('gameState', state.stringify(playerNum));

      socket.on('clue', function(clue){
        clue = JSON.parse(clue)
        try {
          var matching = state.giveClue(clue.giver, 
            clue.recipient, clue.suitOrNumber)
          emitState()
        }
        catch(err) {
          console.log(err.message)
          socket.emit('erra', err.message)
        }
      }.bind(this))
      socket.on('playCard', function(play){
        console.log("PLAYING CARD");
        play = JSON.parse(play)
        try {
          state.playCard(play.player, play.cardIndex)
          emitState()
        }
        catch(err) {
          console.log(err.message)
          socket.emit('erra', err.message)
        }
      }.bind(this))
      socket.on('discard' , function(discard){
        discard = JSON.parse(discard)
        try {
          state.discard(discard.player, discard.cardIndex)
          emitState()
        }
        catch(err) {
          console.log(err.message)
          socket.emit('erra', err.message)
        }

      });
    });

    return gameID;

  };

}

module.exports = function(io) {
  return new GamesHandler(io);
};
