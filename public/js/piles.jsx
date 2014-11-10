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


  app.TeamPiles = React.createClass({
    renderCard: function(card) {
      return <VisCard displayOnly={true} suit={card.suit} number={card.number}/>
    },

    render: function() {
      var dummies = [{number: "_", suit: "blue"},
                     {number: "_", suit: "red"},
                     {number: "_", suit: "green"},
                     {number: "_", suit: "white"},
                     {number: "_", suit: "yellow"}];
      this.props.cards.forEach(function(card) {
        dummies.forEach(function(dummy) {
          if(dummy.suit === card.suit) {
            dummy.number = card.number;
          }
        })
      });

      var deckLength = this.props.deckLength;
      var lastValue  = deckLength < 10 ? deckLength : "?";
      var deckCards  = [1, 2, lastValue].slice(0, deckLength);
      var lives = this.props.lives;
      var clues = this.props.clues;
      var score = this.props.score;

      var renderDeckCard = function(val) {
        return <button className="invisCard">{val}</button>
      };
      return(<div id="team-pile" className="cards">
                <div className="cardContainer deckPile">
                  {deckCards.map(renderDeckCard)}
                </div>
                {dummies.map(this.renderCard)}
                <div className="stats">
                  <span>{lives}<i className="fa fa-heart"></i></span><br/>
                  <span>{clues}<i className="fa fa-comment"></i></span><br/>
                  <span>{score}<i className="fa fa-star"></i></span><br/>
                </div>
             </div>)
    }
  })

  app.Discards = React.createClass({
    renderCard: function(card) {
      return <VisCard displayOnly={true} suit={card.suit} number={card.number}/>
    },

    render: function() {
      return(<div className="cards discards">{this.props.cards.map(this.renderCard)}</div>
      )
    }       
  })

})();
