var path = require('path')
var express = require('express')
var app = express()
var cookieParser = require('cookie-parser')
var session = require('express-session')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Game = require('./game')

var game
var gameUsers = {}
var users = {}

function keyCount(obj) {
  Object.keys(obj).length
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

User.prototype.removeSocket = function() {
  this.socket = undefined
}

function makeUser(name, session, socket) {
  if (!users[session])
    users[session] = new User(name, socket)
  else {
    users[session].updateName(name)
    users[session].updateSocket(socket)
  }
}

function matchSocket(session, socket) {
  if (users[session])
    users[session].updateSocket(socket)
  if (gameUsers[session])
    gameUsers[session].updateSocket(socket)
}

function removeSocket(session) {
  if (!(gameUsers.hasOwnProperty(session) || 
        users.hasOwnProperty(session)))
    return

  if (gameUsers.hasOwnProperty(session)) {
    gameUsers[session].socket = undefined
  }

  if (users.hasOwnProperty(session)) {
    users[session].socket = undefined
  }
}

function lockInUsers() {
  Object.keys(users).forEach(function(session) {
    gameUsers[session] = users[session]
    users[session] = undefined
  })
}

function sayGameIsStarting() {
  Object.keys(gameUsers).forEach(function(session) {
    gameUsers[session].socket.emit('gameIsStarting')
  })
}

function startGame() {
  if (game) {
    return false
  }
  else {
    game = new Game(keyCount(users))
    lockInUsers()
    sayGameIsStarting()
    updatePlayers()
    return true
  }
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

io.sockets.on('connection', function(socket){
  var session = cookie.parse(socket.handshake.headers.cookie)['connect.sid']

  matchSocket(session, socket)

  socket.on('join', function (name) {
    makeUser(name, session, socket)
  })

  socket.on('startGame', function() {
    if (!startGame())
      socket.emit('gameInProgress')
  })

  socket.on('disconnect', function() {
    removeSocket(session)
  })
})

http.listen(3000, function() {
  console.log("listening on 3000")
})
