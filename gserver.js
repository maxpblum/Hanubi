var _    = require('underscore');
var Game = require('./game');

var GamesHandler = function(io) {

  var gameCounter = 897;
  
  this.createGame = function(players) {

    function emitState() {
      players.forEach(function(player){
        console.log('updating ' + player.name);
        console.log('whose socket ID is ' + player.socket.id);
        player.emit('gameState', state.stringify(player.num));
      })
    }

    for (var p = 0; p < players.length; p++) {
      players[p] && (players[p].num = p);
    }

    var state = new Game(players.length);

    var gameID = gameCounter++;

    var nsp = io.of('/' + gameID);

    nsp.on('connection', function(socket) {

      console.log('Player connected to namespace with socket ID ' + socket.id)

      setTimeout(emitState, 3000);

      socket.emit('gameState', state.stringify(0));

      socket.on('clue', function(clue){
        clue = JSON.parse(clue)
        try {
          var matching = state.giveClue(clue.giver, 
            clue.recipient, clue.suitOrNumber)
          updatePlayers()
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
          updatePlayers()
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
          updatePlayers()
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
