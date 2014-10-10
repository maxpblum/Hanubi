function teamPiles(suits) {
  this.piles = {}
  this.suits = suits
}

teamPiles.prototype.addCard = function(card) {
  if (!this.piles[card.suit])
    this.piles[card.suit] = card
  else
    return false
}

teamPiles.prototype.getCards = function() {
  return this.piles
}
