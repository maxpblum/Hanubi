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

  app.VisCard = React.createClass({
    showDialog: function(recipient, suit, number) {
      if (this.props.whoseTurn != this.props.yourPlayerNum || this.props.displayOnly)
        return

      if ($('#playOrDiscardWindow').is(":visible"))
        $('#playOrDiscardWindow').hide();

      var dialog = $('#clueWindow');
      dialog.show();

      document.getElementById('giveClueAboutSuit').onclick = function() {
        app.socket.emit('clue', JSON.stringify({
          giver: this.props.yourPlayerNum,
          recipient: recipient,
          suitOrNumber: suit
        }))
        dialog.hide()
      }.bind(this);

      document.getElementById('giveClueAboutNumber').onclick = function() {
        app.socket.emit('clue', JSON.stringify({
          giver: this.props.yourPlayerNum,
          recipient: recipient,
          suitOrNumber: number
        }))
        dialog.hide()
      }.bind(this);

      document.getElementById('cancelClueWindow').onclick = function() {
        dialog.hide()
      }.bind(this);
    },

    render: function() {
      var suitToCardClass = function(suitName) {
        return suitName + 'card'
      }

      return (
        <div className="cardContainer">
          <button className={suitToCardClass(this.props.suit)} 
                  onClick={function() {
                    this.showDialog(this.props.playerNum, this.props.suit, this.props.number)
                  }.bind(this)}>
            {this.props.number}
          </button>
        </div>
      )
    }
  });

  app.InvisCard = React.createClass({
    showDialog: function(cardIndex) {
      if (this.props.whoseTurn != this.props.yourPlayerNum || this.props.displayOnly)
        return

      if ($('#clueWindow').is(":visible"))
        $('#clueWindow').hide();

      var dialog = $('#playOrDiscardWindow')
      dialog.show();

      document.getElementById('playCard').onclick = function() {
        app.socket.emit('playCard', JSON.stringify({
          player: this.props.yourPlayerNum,
          cardIndex: cardIndex
        }))
        dialog.hide()
      }.bind(this);

      document.getElementById('discard').onclick = function() {
        app.socket.emit('discard', JSON.stringify({
          player: this.props.yourPlayerNum,
          cardIndex: cardIndex
        }))
        dialog.hide()
      }.bind(this)

      document.getElementById('cancelPDWindow').onclick = function() {
        dialog.hide()
      }.bind(this)
    },

    renderCard: function(card) {
      return <invisCard displayOnly={false} suit={card.suit} number={card.number}/>
    },

    render: function() {
      return (
        <div className="cardContainer">
          <button className="invisCard"
                  displayOnly={false}
                  onClick={function(){ this.showDialog(this.props.key) }.bind(this)}>
            ?
          </button>
        </div>
      )
    }
  });

})();
