var path = require('path')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Game = require('./game')

var game = new Game(2)
var socketToPlayer = {}
var playerToSocket = []

function stringifyGame(game, forPlayer) {

  var toSend = {
    playerCount: game.getPlayers().length,
    hands: game.getPlayers().map(function(player) {
      return player.getCards()
    }),
    deckLength: game.getDeckLength(),
    clues: game.clues,
    lives: game.lives,
    yourCards: game.getPlayers()[forPlayer].getCards().length,
    teamPiles: function(){
      var cards = []
      for (var suit in game.getTeamPiles())
        cards.push(game.getTeamPiles()[suit])
      return cards
    }(),
    discards: game.discardPile,
    gameIsOver: game.isOver,
    whoseTurn: game.turn
  }

  toSend.hands.splice(forPlayer, 1)

  return JSON.stringify(toSend)
}

function sendGameState() {
  console.log(playerToSocket.length)
  for (var p = 0; p < playerToSocket.length; p++) {
    playerToSocket[p].emit('gameInit', stringifyGame(game, p))
  }
}

io.on('connection', function(socket){

  playerToSocket.push(socket)
  socketToPlayer[socket.id] = playerToSocket.length - 1
  

  console.log("socket: " + socket.id + " is player " + socketToPlayer[socket.id])

  console.log('user connected!')

  sendGameState()

  socket.emit('youAre', socketToPlayer[socket.id])


  socket.on('disconnect', function(){
    console.log('disconnected')
  });

  socket.on('clue', function(clue){
    clue = JSON.parse(clue)
    try {
      var matching = game.giveClue(clue.giver, 
        clue.recipient, clue.suitOrNumber)
      sendGameState()
    }
    catch(err) {
      socket.emit('erra', err.message)
      console.log(err.message)
    }
  })

  socket.on('playCard', function(play){
    play = JSON.parse(play)
    try {
      game.playCard(play.player, play.cardIndex)
      sendGameState()
    }
    catch(err) {
      socket.emit('erra', err.message)
      console.log(err.message)
    }
  })

  socket.on('discard', function(discard){
    discard = JSON.parse(discard)
    try {
      io.discard(discard.player, discard.cardIndex)
      sendGameState()
    }
    catch(err) {
      socket.emit('erra', err.message)
      console.log(err.message)
    }
  })

});

http.listen(3001, function(){
  console.log('listening on *:3001')
})
