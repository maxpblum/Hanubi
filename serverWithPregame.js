var path = require('path')
var express = require('express')
var app = express()
var cookie = require('cookie')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Game = require('./game')

var game
var gameUsers = {}
var users = {}

function getPlayerNum(sessionID) {
  if (gameUsers[sessionID])
    return gameUsers[sessionID].playerNum
  else
    return false
}

function allUserNames(userList) {
  nameObjs = []

  Object.keys(userList).forEach(function(sessionID, index) {
    if (userList[sessionID]) {
      nameObjs.push({
        id: index,
        name: userList[sessionID].name
      })
    }
  })

  return nameObjs
}

function keyCount(obj) {
  console.log(Object.keys(obj))
  var count = 0
  Object.keys(obj).forEach(function(key) {
    if (obj.hasOwnProperty(key))
      count++
  })
  return count
}

function User (name, socket) {
  this.name = name
  this.socket = socket
}

User.prototype.updateName = function(name) {
  this.name = name
}

User.prototype.updateSocket = function(socket) {
  this.socket = socket
}

// User.prototype.removeSocket = function() {
//   this.socket = undefined
// }

function makeUser(name, sessionID, socket) {
  if (!users[sessionID])
    users[sessionID] = new User(name, socket)
  else {
    users[sessionID].updateName(name)
    users[sessionID].updateSocket(socket)
  }
}

function matchSocket(sessionID, socket) {
  var socketExists = false

  if (gameUsers[sessionID]) {
    gameUsers[sessionID].updateSocket(socket)
    socketExists = true
  } else if (users[sessionID]) {
    users[sessionID].updateSocket(socket)
    socketExists = true
  }

  return socketExists
}

// function removeSocket(sessionID) {
//   if (!(gameUsers.hasOwnProperty(sessionID) || 
//         users.hasOwnProperty(sessionID)))
//     return

//   if (gameUsers.hasOwnProperty(sessionID)) {
//     gameUsers[sessionID].socket = undefined
//   }

//   if (users.hasOwnProperty(sessionID)) {
//     users[sessionID].socket = undefined
  // }
// }

function lockInUsers() {

  Object.keys(users).forEach(function(sessionID, index) {
    if (users[sessionID]) {
      gameUsers[sessionID] = users[sessionID]
      gameUsers[sessionID].playerNum = index

      gameUsers[sessionID].addGameHandlers = function() {
        this.socket.on('clue', function(clue){
          clue = JSON.parse(clue)
          try {
            var matching = game.giveClue(clue.giver, 
              clue.recipient, clue.suitOrNumber)
            updatePlayers()
          }
          catch(err) {
            console.log(err.message)
            this.socket.emit('erra', err.message)
          }
        }.bind(this))
        this.socket.on('playCard', function(play){
          console.log("PLAYING CARD");
          play = JSON.parse(play)
          try {
            game.playCard(play.player, play.cardIndex)
            updatePlayers()
          }
          catch(err) {
            console.log(err.message)
            this.socket.emit('erra', err.message)
          }
        }.bind(this))
        this.socket.on('discard' , function(discard){
          discard = JSON.parse(discard)
          try {
            game.discard(discard.player, discard.cardIndex)
            updatePlayers()
          }
          catch(err) {
            console.log(err.message)
            this.socket.emit('erra', err.message)
          }
        }.bind(this))
      }
      

      gameUsers[sessionID].updateSocket = function(socket) {
        console.log("Updating socket")
        this.socket = socket
        this.addGameHandlers()
        this.socket.emit('youAre', this.playerNum)
        updateOnePlayer(gameUsers[sessionID])
      }
    }
  })
}

function sayGameIsStarting() {
  Object.keys(gameUsers).forEach(function(sessionID) {
    console.log(sessionID)
    if (gameUsers[sessionID])
      gameUsers[sessionID].socket.emit('gameIsStarting')
  })
}

function startGame() {
  if (game) {
    return false
  }
  else {
    game = new Game(keyCount(users))
    console.log(keyCount(users))
    console.log(game)
    lockInUsers()
    sayGameIsStarting()
    return true
  }
}

function updatePlayers() {
  Object.keys(gameUsers).forEach(function(sessionID){
    updateOnePlayer(gameUsers[sessionID])
  })
}

function updateOnePlayer(user) {
  console.log('updating ' + user.name)
  user.socket.emit('gameInit', stringifyGame(game, user.playerNum))
}

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

  toSend.hands[forPlayer] = undefined

  return toSend
}

app.use(cookieParser())
app.use(session({
  secret: 'keybat coard',
  cookie: { 
    expires: new Date(Date.now() + 60 * 60 * 1000), //setting cookie to not expire on session end
    maxAge: 60 * 1000,
    key: 'connect.sid',
    resave: true,
    saveUninitialized: true
  }
}))

app.get('/', function(req, res, next) {
  res.sendFile(path.resolve('./index.html'))
})
app.get('/game', function(req, res){
  res.sendFile(path.resolve('./game.html'))
})
app.get('/styles.css', function(req, res){
  res.sendFile(path.resolve('./styles.css'))
})
app.get('/react', function(req, res){
  res.sendFile(path.resolve('./build/react.js'))
})
app.get('/JSXTransformer', function(req, res){
  res.sendFile(path.resolve('./build/JSXTransformer.js'))
})
app.get('/jquery', function(req, res){
  res.sendFile(path.resolve('./build/jquery-1.11.1.js'))
})
app.get('/hanabi.png', function(req, res){
  res.sendFile(path.resolve('./hanabi.png'))
})

io.sockets.on('connection', function(socket){
  console.log('connected')

  var sessionID = cookie.parse(socket.handshake.headers.cookie)['connect.sid']

  if (matchSocket(sessionID, socket))
    socket.emit('joined')

  socket.emit('allPlayers', allUserNames(users))

  socket.on('join', function (name) {
    console.log(sessionID)
    makeUser(name, sessionID, socket)
    socket.emit('joined')
    io.sockets.emit('allPlayers', allUserNames(users))
  })

  socket.on('chat', function(text) {
    if (users[sessionID])
      io.sockets.emit('chat', { name: users[sessionID].name, text: text })
    else
      socket.emit('erra', 'ENTER A FREAKIN NAME')
  })

  socket.on('startGame', function() {
    if (!startGame())
      socket.emit('gameInProgress')
  })

  socket.on('disconnect', function() {
    console.log('disconnected')
    // removeSocket(sessionID)
  })
})

http.listen(3000, function() {
  console.log("listening on 3000")
})
