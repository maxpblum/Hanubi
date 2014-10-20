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

function getPlayerNum(session) {
  if (gameUsers[session])
    return gameUsers[session].playerNum
  else
    return false
}

function allUserNames(userList) {
  nameObjs = []

  Object.keys(userList).forEach(function(session, index) {
    if (userList[session]) {
      nameObjs.push({
        id: index,
        name: userList[session].name
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

function makeUser(name, session, socket) {
  if (!users[session])
    users[session] = new User(name, socket)
  else {
    users[session].updateName(name)
    users[session].updateSocket(socket)
  }
}

function matchSocket(session, socket) {
  var socketExists = false

  if (gameUsers[session]) {
    gameUsers[session].updateSocket(socket)
    socketExists = true
  } else if (users[session]) {
    users[session].updateSocket(socket)
    socketExists = true
  }

  return socketExists
}

// function removeSocket(session) {
//   if (!(gameUsers.hasOwnProperty(session) || 
//         users.hasOwnProperty(session)))
//     return

//   if (gameUsers.hasOwnProperty(session)) {
//     gameUsers[session].socket = undefined
//   }

//   if (users.hasOwnProperty(session)) {
//     users[session].socket = undefined
  // }
// }

function lockInUsers() {

  Object.keys(users).forEach(function(session, index) {
    if (users[session]) {
      gameUsers[session] = users[session]
      gameUsers[session].playerNum = index

      gameUsers[session].addGameHandlers = function() {
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
      

      gameUsers[session].updateSocket = function(socket) {
        console.log("Updating socket")
        this.socket = socket
        this.addGameHandlers()
        this.socket.emit('youAre', this.playerNum)
        updateOnePlayer(gameUsers[session])
      }
    }
  })
}

function sayGameIsStarting() {
  Object.keys(gameUsers).forEach(function(session) {
    console.log(session)
    if (gameUsers[session])
      gameUsers[session].socket.emit('gameIsStarting')
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
  Object.keys(gameUsers).forEach(function(session){
    updateOnePlayer(gameUsers[session])
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

  var session = cookie.parse(socket.handshake.headers.cookie)['connect.sid']

  if (matchSocket(session, socket))
    socket.emit('joined')

  socket.emit('allPlayers', allUserNames(users))

  socket.on('join', function (name) {
    makeUser(name, session, socket)
    socket.emit('joined')
    io.sockets.emit('allPlayers', allUserNames(users))
  })

  socket.on('chat', function(text) {
    if (users[session])
      io.sockets.emit('chat', { name: users[session].name, text: text })
    else
      socket.emit('erra', 'ENTER A FREAKIN NAME')
  })

  socket.on('startGame', function() {
    if (!startGame())
      socket.emit('gameInProgress')
  })

  socket.on('disconnect', function() {
    console.log('disconnected')
    // removeSocket(session)
  })
})

http.listen(3000, function() {
  console.log("listening on 3000")
})
