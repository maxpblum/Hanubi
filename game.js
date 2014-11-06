var Player = require('./player')
var Deck   = require('./deck')
var Card   = require('./card')
var TeamPiles = require('./teamPiles')


function Game(playerCount, withRainbow) {
  this.players = this.createPlayers(playerCount)
  this.deck    = new Deck(withRainbow)
  this.dealCards()
  this.initState()
}

Game.prototype.MAX_CLUES = 8
Game.prototype.MAX_LIVES = 3

Game.prototype.createPlayers = function(playerCount) {
  players = []
  for (var p = 0; p < playerCount; p++)
    players.push(new Player())

  return players
}

Game.prototype.getPlayers = function() {
  return this.players
}

Game.prototype.getDeckLength = function() {
  return this.deck.getLength()
}

Game.prototype.getTeamPiles = function() {
  return this.teamPiles.getCards()
}

Game.prototype.dealCards = function() {
  var handSize = this.players.length < 4 ? 5 : 4
  for (var c = 0; c < handSize; c++)
    for (var p = 0; p < this.players.length; p++)
      this.players[p].addCard(this.deck.takeCard())
}

Game.prototype.initState = function() {
  this.discardPile  = []
  this.teamPiles    = new TeamPiles(this.deck.suits)
  this.clues        = this.MAX_CLUES
  this.lives        = this.MAX_LIVES
  this.endCountdown = this.players.length
  this.turn         = Math.floor(Math.random() * this.players.length)
  this.isOver       = false
}

Game.prototype.checkGameOver = function() {
  if (this.isOver)
    throw new Error ('Game is over! Score is ____')
}

Game.prototype.validatePlayer = function(playerIndex) {
  if (playerIndex != this.turn)
    throw new Error ('Not your turn! Stay back!')  
}

Game.prototype.beforeMove = function(playerIndex) {
  this.checkGameOver()
  this.validatePlayer(playerIndex)
}

Game.prototype.checkCountDown = function() {
  if (this.endCountdown === 0)
    this.isOver = true
  else if (this.deck.isEmpty())
    this.endCountdown--
}

Game.prototype.setNextTurn = function() {
  this.turn = (this.turn + 1) % this.players.length
}

Game.prototype.afterMove = function() {
  this.checkCountDown()
  this.setNextTurn()
}

Game.prototype.discard = function(playerIndex, cardIndex) {
  this.logMove(playerIndex, cardIndex)
  this.beforeMove(playerIndex)

  if (this.clues === this.MAX_CLUES)
    throw new Error ('Can\'t discard while on maximum clueness level.')

  var discarded = this.players[playerIndex].takeCard(cardIndex);
  this.discardPile.push(discarded);
  
  this.players[playerIndex].addCard(this.deck.takeCard())

  this.clues++

  this.afterMove()
  return discarded;
}

Game.prototype.logMove = function(playerIndex, cardIndex) {
  console.log('player ' + playerIndex + ' tried to play card ' + cardIndex)
}

Game.prototype.playCard = function(playerIndex, cardIndex) {
  this.logMove(playerIndex, cardIndex)
  this.beforeMove(playerIndex)

  var playedCard = this.players[playerIndex].takeCard(cardIndex)

  var moveWasValid = this.teamPiles.addCard(playedCard)

  if (!moveWasValid) {
    this.discardPile.push(playedCard)
    this.lives--
    if (this.lives === 0)
      this.isOver = true
  }

  this.players[playerIndex].addCard(this.deck.takeCard())


  if (playedCard.value === 5 && this.clues < this.MAX_CLUES)
    this.clues++

  this.afterMove();
  return {card: playedCard, valid: moveWasValid};
}

Game.prototype.giveClue = function(playerIndex, clueRecipientIndex, suitOrValue) {

  this.beforeMove(playerIndex)

  if (this.clues <= 0)
    throw new Error('No clues available! Play or discard a card.')

  var hand = this.players[clueRecipientIndex].getCards()

  var matching = []
  var parameter
  var asAnInt = parseInt(suitOrValue)

  if (asAnInt) {
    suitOrValue = asAnInt
    parameter = 'number'
  }
  else
    parameter = 'suit'

  for (var c = 0; c < hand.length; c++)
    if (hand[c][parameter] === suitOrValue)
      matching.push(c)

  if (matching.length === 0)
    throw new Error('Clue must refer to at least one card in receipient\'s hand!')

  this.clues--

  this.afterMove()
  return matching
}

Game.prototype.stringify = function (forPlayer) {

  var toSend = {
    playerCount: this.getPlayers().length,
    hands: this.getPlayers().map(function(player) {
      return player.getCards()
    }),
    deckLength: this.getDeckLength(),
    clues: this.clues,
    lives: this.lives,
    youAre: forPlayer,
    yourCards: this.getPlayers()[forPlayer].getCards().length,
    teamPiles: function(){
      var cards = []
      for (var suit in this.getTeamPiles())
        cards.push(this.getTeamPiles()[suit])
      return cards
    }.bind(this)(),
    discards: this.discardPile,
    gameIsOver: this.isOver,
    whoseTurn: this.turn
  }

  toSend.hands[forPlayer] = undefined

  return toSend
}

module.exports = Game
