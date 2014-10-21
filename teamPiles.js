function TeamPiles(suits) {
  this.piles = {}
  this.suits = suits
}

TeamPiles.prototype.addCard = function(card) {
  console.log(card)
  if (!this.piles[card.suit] && card.number === 1 ||
    (this.piles[card.suit] && (card.number === this.piles[card.suit].number + 1))) {
    this.piles[card.suit] = card
    return true
  }
  else
    return false
}

TeamPiles.prototype.getCards = function() {
  return this.piles
}

module.exports = TeamPiles
