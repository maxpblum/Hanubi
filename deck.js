function Deck (withRainbow) {
  const stdSuits = ['blue', 'red', 'green', 'white', 'yellow']
  const values   = [1, 1, 1, 2, 2, 3, 3, 4, 4, 5]

  this.suits = stdSuits.slice()
  if (withRainbow)
    this.suits.push('rainbow')

  this.cards = []
  for (var i = 0; i < this.suits.length; i++)
    for (var j = 0; j < values.length; j++)
      this.cards.push(new Card(this.suits[i], values[j]))

  this.shuffle()
}

Deck.prototype.takeCard = function() {
  if (this.length === 0)
    return false
  return this.cards.pop()
}

Deck.prototype.shuffle = function () {
  var size = this.cards.length
  for (var i = size - 1; i > 0; i--){

    var switchIndex = Math.floor(Math.random() * (i + 1))
    
    var tmpCard             = this.cards[i]
    this.cards[i]           = this.cards[switchIndex]
    this.cards[switchIndex] = tmpCard

  }
}

Deck.prototype.isEmpty = function() {
  return this.cards.length === 0
}

module.exports = Deck
