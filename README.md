Hanubi
======

Fireworks! It's a card game. [Live copy on Heroku](https://murmuring-lowlands-3725.herokuapp.com).

To run the server locally, just clone the repository and run `npm install`.

Hanubi is an homage to a wonderful cooperative card game. Here are the basic rules and things you need to know:

* There are five suits.
* Each suit has the following cards: 1 1 1 2 2 3 3 4 4 5.
* You can see everyone else's hand of cards, but not your own.
* Everyone is working together to try to create piles of cards.
  * One pile per suit
  * Each pile will eventually consist of a 1, 2, 3, 4 and 5 from its suit, in that order.
  * It is only valid to play a card if that is the "next" not-yet-played card in its suit's pile.
    * E.g. If the green pile has had a 1 and a 2 played on it, the only valid green card to play is a 3.
    * It follows that at the start of the game, the only valid cards are any and all 1s.
* On your turn, you may do one of three things:
  * Try to play a card
    * Do this by clicking on the card.
    * If it turns out to be invalid, it gets discarded instead (no clue is gained), and everyone loses a life.
    * If it's valid and also is a 5, your team gains a clue.
    * If you all lose three lives, the game ends.
    * Whatever happens, once the card leaves your hand, you draw a new card on the right side of your hand, and the other cards move down.
  * Discard
    * Do this by clicking on the card.
    * This puts a card out of play forever. Then you draw a new card, which will be on the right side of your hand. The rest of your hand will move over to make room.
    * When you discard, the team gains a clue. If your clues are already at maximum (8), you can't discard.
  * Give a clue
    * This consists of telling one other player about all of the cards in his/her hand that are of a particular suit or number.
    * E.g., These are all the 3s in your hand. Or, these are all the Blue cards in your hand.
    * To give a clue, click on one of the cards in your teammate's hand that you want to give a clue about.
    * Be aware that the clue will always be about *all* cards in that category.
* If the team doesn't lose three lives, the game ends one full turn rotation after the last card is drawn.
* At the end of the game, your final score is equal to the sum of the highest numbers successfully played in each suit. More simply, the score is equal to the total number of cards successfully played.
