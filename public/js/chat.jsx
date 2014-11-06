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

  app.Chat = React.createClass({
    getInitialState: function() {
      this.props.socket.on('chat', this.flushMessage.bind(this));
      return {message: "", messages: []}
    },
    
    flushMessage: function(message) {
      var messages = this.state.messages;
      messages.push(message);
      this.setState({messages: messages});
      // Scroll to bottom to see the new message
      var wrapper = document.getElementsByClassName("overflow-wrapper")[0];
      wrapper.scrollTop = wrapper.scrollHeight;
    },

    showClue: function(clue) {
      this.flushMessage({type: "clue", clue: clue });
    },

    showMove: function(move) {
      this.flushMessage({type: "move", move: move});
    },

    emitMessage: function(e) {
      e.preventDefault();
      var message = this.state.message;
      this.props.socket.emit('chat', message); 
      this.setState({message: ''});
    },

    onChange: function(e) {
      var message = e.target.value;
      this.setState({message: message});
    },

    parseClue: function(message) {
      var cards = [];
      for(var i=0; i<(this.props.playerCount < 4 ? 5 : 4); i++) {
        var value    = message.clue.suitOrNumber;
        var matching = message.clue.matching;
        
        var hit      = _.contains(matching, i);

        var suit     = "unknown";
        var number   = "?";
        if(parseInt(value) && hit) {
          number = parseInt(value);
        } else if (hit) {
          suit   = value;
        }
        cards.push({suit:suit, number: number});
      }
      return cards;
    },
    renderClue: function(card) {
      var classes = "clueCard " + card.suit + "Card";
      return <div className={classes}>{card.number}</div>
    },

    parseMove: function(message) {
      var cards = [];
      for(var i=0; i<(this.props.playerCount < 4 ? 5 : 4); i++) {
        var suit     = "unknown";
        var number   = "?";
        if(i === message.move.cardIndex) {
          number = message.move.card.number;
          suit   = message.move.card.suit;
        }
        cards.push({suit:suit, number: number});
      }
      return cards;

    },
    renderMove: function(card) {
      var classes = "moveCard " + card.suit + "Card";
      return <div className={classes}>{card.number}</div>
    },

    render: function() {
      var show = function(message) {
        if(message.type === 'clue') {
          return [<dt>{message.clue.recipient} received a clue from {message.clue.giver}</dt>, 
                  <dd>
                    <div className='clueChat'>
                      {this.parseClue(message).map(this.renderClue)}
                    </div>
                  </dd>]
        } else if(message.type === 'move') {
          return [<dt>{message.move.player} {message.move.action}.</dt>, 
                  <dd>
                    <div className='clueChat'>
                      {this.parseMove(message).map(this.renderMove)}
                    </div>
                  </dd>]
          return 
        } else {
          return [<dt>{message.name}</dt>,
                  <dd>{message.text}</dd>]
        }
      }.bind(this);
      return (
        <div id='chat'>
          <div className='overflow-wrapper'>
            <dl>{this.state.messages.map(show)}</dl>
          </div>
          <form onSubmit={this.emitMessage}>
            <input id='chat-message' onChange={this.onChange} value={this.state.message} />
            <button className='button send'>Send</button>
          </form>
        </div>
      )
    }
  });
})();
