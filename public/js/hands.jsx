/**
 * @jsx React.DOM
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React */
var app = app || {};

(function () {
  'use strict';


  var MyHand = React.createClass({
    render: function() {
      var cards = []
      for (var c = 0; c < this.props.yourCards; c++)
        cards.push(<InvisCard displayOnly={false}
                              whoseTurn={this.props.whoseTurn}
                              yourPlayerNum={this.props.yourPlayerNum}
                              key={c}/>)

      return(
        <tr className={this.props.active ? 'currentPlayer' : ''}>
          <td className="text">{this.props.name}</td>
          <td className="cards hand">{cards}</td>
        </tr>
      )
    }
  })

  var OtherHand = React.createClass({
    renderCards: function() {
      var cards = []
      for (var c = 0; c < this.props.cards.length; c++) {
        var card = this.props.cards[c]
        cards.push(<VisCard displayOnly={false}
                            suit={card.suit}
                            number={card.number}
                            whoseTurn={this.props.whoseTurn}
                            yourPlayerNum={this.props.yourPlayerNum}
                            playerNum={this.props.playerNum}/>)
      }
      return cards
    },

    render: function() {
      return(
        <tr className={this.props.active ? 'currentPlayer' : ''}>
          <td className="text">{this.props.name}</td>
          <td className="cards hand">{this.renderCards()}</td>
        </tr>
      )
    }
  })

  app.Players = React.createClass({
    makeHands: function(listOfHands) {
      var hands = []
      for (var h = 0; h < listOfHands.length; h++) {
        if (listOfHands[h])
          hands.push(<OtherHand active={h === this.props.whoseTurn} 
                                whoseTurn={this.props.whoseTurn}
                                yourPlayerNum={this.props.yourPlayerNum}
                                cards={listOfHands[h]} 
                                playerNum={h}
                                name={this.props.names[h]}/>);
        else
          hands.push(<MyHand active={h === this.props.whoseTurn}
                             whoseTurn={this.props.whoseTurn}
                             yourPlayerNum={this.props.yourPlayerNum}
                             yourCards={this.props.yourCards}
                             name={this.props.names[h]}/>);
      }
      return hands
    },

    render: function() {
      return <table>{this.makeHands(this.props.hands)}</table>
    }
  });

})();
