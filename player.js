function Player() {
  this.cards = []
}

Player.prototype.addCard = function(card) {
  if (card)
    this.cards.push(card)
}

Player.prototype.getCards = function() {
  return this.cards
}

Player.prototype.takeCard = function(index) {
  if (index < 0 || index >= this.cards.length) {
    throw new Error('Not a valid slot in hand!')
  }
  return this.cards.splice(index, 1)[0]
}
