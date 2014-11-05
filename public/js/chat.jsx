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
  console.log("ASD");

  app.Chat = React.createClass({
    chat: io(":3001/chat"),
    getInitialState: function() {
      this.chat.on('chat', function(message) {
        var messages = this.state.messages;
        messages.push(message);
        this.setState({messages: messages});
        // Scroll to bottom to see the new message
        var wrapper = document.getElementsByClassName("overflow-wrapper")[0];
        wrapper.scrollTop = wrapper.scrollHeight;
      }.bind(this));
      return {message: "", messages: []}
    },
    show: function(message) {
      return [<dt>{message.name}</dt>,
              <dd>{message.text}</dd>]
    },
    emitMessage: function(e) {
      e.preventDefault();
      var message = this.state.message;
      this.chat.emit('chat', message); 
      this.setState({message: ''});
    },
    onChange: function(e) {
      var message = e.target.value;
      this.setState({message: message});
    },
    render: function() {
      return (
        <div id='chat'>
          <div className='overflow-wrapper'>
            <dl>{this.state.messages.map(this.show)}</dl>
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
