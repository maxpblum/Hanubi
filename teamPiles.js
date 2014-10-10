function TeamPiles(suits) {
  this.piles = {}
  this.suits = suits
}

TeamPiles.prototype.addCard = function(card) {
  if (!this.piles[card.suit])
    this.piles[card.suit] = card
  else
    return false
}

TeamPiles.prototype.getCards = function() {
  return this.piles
}

module.exports = TeamPiles
