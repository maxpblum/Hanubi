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
    render: function() {
      var show = function(message) {
        if(message.type === 'clue') {
          var cards = [];
          for(var i=0; i<5; i++) {
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
          var renderClueCard = function(card) {
            var classes = "clueCard " + card.suit + "Card";
            return <div className={classes}>{card.number}</div>
          };
          return [<dt>{message.clue.recipient} received a clue from {message.clue.giver}</dt>, 
                  <dd>
                    <div className='clueChat'>
                      {cards.map(renderClueCard)}
                    </div>
                  </dd>]
        } else {
          return [<dt>{message.name}</dt>,
                  <dd>{message.text}</dd>]
        }
      };
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
