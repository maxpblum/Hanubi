var server = require('http').Server();
var io = require('socket.io')(server);
var Game = require('./game')

var game = new Game(6)

function stringifyGame(game, forPlayer) {

  var toSend = {
    playerCount: game.getPlayers().length,
    hands: game.getPlayers().map(function(player) {
      return player.getCards()
    })
  }

  toSend.hands.splice(forPlayer, 1)

  return JSON.stringify(toSend)
}

io.on('connection', function(socket){

  console.log('user connected!')

  socket.emit('init', stringifyGame(game, 2))

  socket.on('disconnect', function(){
    console.log('disconnected')
  });

});

server.listen(3000);
