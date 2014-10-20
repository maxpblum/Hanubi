var path = require('path')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Game = require('./game')

app.get('/game', function(req, res){
  res.sendFile(path.join(__dirname, 'game.html'))
});
app.get('/styles.css', function(req, res){
  res.sendFile(path.resolve('./styles.css'))
});
app.get('/react', function(req, res){
  res.sendFile(path.resolve('./build/react.js'))
});
app.get('/JSXTransformer', function(req, res){
  res.sendFile(path.resolve('./build/JSXTransformer.js'))
});
app.get('/jquery', function(req, res){
  res.sendFile(path.resolve('./build/jquery-1.11.1.js'))
});
