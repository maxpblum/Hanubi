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

  var Chat   = app.Chat;
  var Status = app.Status;

  var Start = React.createClass({
    render : function() {
      return (
        <div id="start">
          <button disabled={!this.props.enabled}
                  onClick={startGame}
                  className="button">
            Start Game
          </button>
        </div>
      )
    }
  });

  var PlayersList = React.createClass({
    getInitialState: function() {
      return {name: ""}
    },

    onChange: function(e) {
      this.setState({name: e.target.value});
    },

    handleSubmit: function(e) {
      e.preventDefault();
      app.socket.emit("rename", this.state.name);
      this.setState({name: ""});
    },

    render: function() {
      var createPlayer = function(player) {
        return <li key={player.id}>{player.name}</li>
      };
      return (
        <div id="players">
          <Status connected={this.props.connected} players={this.props.players.length} />
          <ul>{this.props.players.map(createPlayer)}</ul>
          <form className='name' onSubmit={this.handleSubmit}>
            <input onChange={this.onChange} value={this.state.name} />
            <button className='button' disabled={!this.state.name}>Rename</button>
          </form>
        </div>
      )
    }
  });

  app.Hanubi = React.createClass({
    getInitialState: function() {
      app.socket.on('disconnect', function () {
        this.setState({players: [], connected: false});
      }.bind(this));

      app.socket.on('connect', function () {
        this.setState({connected: true});
      }.bind(this));

      app.socket.on('gameIsStarting', function(gameID) {
      console.log("Should redirect");
        window.location.href = '/game.html?gameID=' + gameID;
      });

      app.socket.on("players", function(data) {
        this.setState({players: data, start: data.length > 1 && data.length < 6});
      }.bind(this));
      
      return {players: [], start: false};
    },

    render: function() {
      return (
        <div>
          <Start enabled={this.state.start}/>
          <PlayersList players={this.state.players} connected={this.state.connected} />
          <Chat socket={app.socket} />
        </div>
      );
    }
  
  });
})();
