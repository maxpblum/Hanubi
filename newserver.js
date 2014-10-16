var path = require('path')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Game = require('./game')

var totalConnections = 0

var players = [new Player('Charlie', {id: 'WEHOI)#NX'}),
               new Player('Bill', {id: 'WN#(*)HVN'})]
var game = false
var gameBackup = false

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

function unpauseGame() {
  game = gameBackup
  gameBackup = false
}

function safeToUnpause() {
  for (var p = 0; p < players.length; p++) {
    if (players[p].socket === undefined)
      return false

    return true
  }
}

function updatePlayers() {
  for (var p = 0; p < players.length; p++) {
    players[p].socket.emit('gameState', stringifyGame(game, p))
  }
}

function Player(name, socket) {
  this.name = name
  this.socket = socket
}

function removePlayer(player) {
  if (game === false && gameBackup === false) {
    // Someone left, but there's no game yet so we can just shift everyone down
    players.splice(player.num, 1)
    assignPlayerNums()
  }
  else if (game === false) {
    // Someone left while a game was paused, so just take them out.
    players[player.num] = new Player("Disconnected!", undefined)
  }
  else {
    // Someone left during a game! Pause it, back it up, and take them out.
    gameBackup = game
    game = false
    players[player.num] = new Player("Disconnected!", undefined)
  }
}

function addPlayer(player, socket) {
  if (game === false && gameBackup === false) {
    players.push(new Player(player, socket))
  }
  else {
    for (var p = 0; p < players.length; p++) {
      if (players[p].num === undefined)
        players[p] = new Player(player, socket)
    }

    assignPlayerNums()

    if (game === false && safeToUnpause()) {
      unpauseGame()
    }
  }
}

function getPlayerNamesAndIDs() {
  return players.map(function(player) {
    return {
      id: player.socket.id,
      name: player.name
    }
  })
}

function getPlayerByName(name) {
  for (var p = 0; p < players.length; p++)
    if (players[p].name === name)
      return players[p]
    else
      throw new Error('No player by that name!')
}

function getPlayerByNum(num) {
  for (var p = 0; p < players.length; p++)
    if (players[p].num === num)
      return players[p]
    else
      throw new Error('No player with that num!')
}

function getPlayerBySocket(socket) {
  for (var p = 0; p < players.length; p++)
    if (players[p].socket === socket)
      return players[p]
  
  return false
}

function assignPlayerNums() {
  for (var p = 0; p < players.length; p++)
    players[p].num = p
}

io.on('connection', function(socket) {

  socket.emit('allPlayers', getPlayerNamesAndIDs())

  socket.on('join', function(name) {
    console.log(name + ' joined')
    if (!getPlayerBySocket(socket)) {
      players.push(new Player(name, socket))
      io.sockets.emit('allPlayers', getPlayerNamesAndIDs())
    }
    else
      socket.emit('erra', 'There is already a player with that socket')
  })

  socket.on('startGame', function(_) {
    if (players.length < 2) {
      // stuff
    }
    else {
      io.sockets.emit('startGame', 'The game is starting!')
      var game = new Game(players.length)
      assignPlayerNums()
      updatePlayers()
    }
  })

  socket.on('disconnect', function(){
    console.log('disconnected')
    for (var p = 0; p < players.length; p++) {
      if (players[p].socket === socket) {
        removePlayer(socket)
        return 
      }
    }
  })

})

http.listen(3000, function(){
  console.log('listening on *:3000')
})
