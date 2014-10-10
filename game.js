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

Game.prototype.dealCards = function() {
  var handSize = this.players.length < 4 ? 5 : 4
  for (var c = 0; c < handSize; c++)
    for (var p = 0; p < this.players.length; p++)
      players.addCard(this.deck.takeCard())
}

Game.prototype.initState = function() {
  this.discardPile  = []
  this.clues        = this.MAX_CLUES
  this.lives        = this.MAX_LIVES
  this.endCountdown = this.player.length
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

Game.prototype.discardCard = function(playerIndex, cardIndex) {
  this.beforeMove(playerIndex)

  if (this.clues === this.MAX_CLUES)
    throw new Error ('Can\'t discard while on maximum clueness level.')

  this.discardPile.push(this.players[playerIndex].takeCard(cardIndex))
  
  this.players[playerIndex].addCard(this.deck.takeCard())

  this.afterMove()
}

Game.prototype.playCard = function(playerIndex, cardIndex) {
  this.beforeMove(playerIndex)

  var playedCard = this.players[playerIndex].takeCard(cardIndex)

  var moveWasValid = this.teamPiles.addCard(playedCard)

  if (!moveWasValid) {
    this.discardPile.push(playedCard)
    this.lives--
    if (this.lives === 0)
      this.isOver = true
  }

  this.afterMove() 
  return moveWasValid
}

Game.prototype.giveClue = function(playerIndex, clueRecipientIndex, suitOrValue) {
  this.beforeMove(playerIndex)

  var hand = this.players.clueRecipientIndex.getCards()

  var matching = []
  var parameter = parseInt(suitOrValue) ? 'value' : 'suit'

  for (var c = 0; c < hand.length; c++)
    if (hand[c][parameter] === suitOrValue)
      matching.push(c)

  if (matching.length === 0)
    throw new Error('Clue must refer to at least one card in receipient\'s hand!')

  this.afterMove()
  return matching
}
