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

  var Chat = app.Chat;
  var VisCard   = app.VisCard;
  var InvisCard = app.InvisCard;
  var TeamPiles = app.TeamPiles;
  var Discards  = app.Discards;
  var Players   = app.Players;

  app.Hanubi = React.createClass({
    getInitialState: function() {
      return {hands: [[0]],
              teamPiles: [],
              discards: [],
              yourPlayerNum: 0,
              names: ['No Name']}
    },

    componentDidMount: function() {
      app.socket.on('connect', function() {
        this.setState({text: "Connect"});
      }.bind(this))

      app.socket.on('killGame', function() {
        window.location.href = '/';            
      })
      app.socket.on('gameState', this.gameState)
      app.socket.on('players', this.setNames)
      app.socket.on('erra', this.showError)
      app.socket.on('clue', function(clue) {
        clue = JSON.parse(clue);
        clue.giver = this.state.names[clue.giver];
        clue.recipient = this.state.names[clue.recipient];
        this.refs.chat.showClue(clue);
      }.bind(this));
      app.socket.on('move', function(move) {
        move = JSON.parse(move)
        move.player = this.state.names[move.player];
        this.refs.chat.showMove(move);
      }.bind(this));
    },

    showError: function(message) {
      this.refs.chat.flushMessage({name: 'Hanubi', text: message});
    },

    setNames: function(names) {
      var playerNames = [];
      names.forEach(function(nameObj) {
        playerNames[nameObj.id] = nameObj.name;
      });
      this.setState({names: playerNames});
    },

    gameState: function(game) {
      if (game.gameIsOver) {
        this.refs.chat.flushMessage({
          name:'Hanubi',
          text:'The game is over! Your final score is ' + game.score
        });
      }
      this.setState(game)
    },

    render: function() {
      var names = this.state.names.slice();
      var yourName = names.splice(this.state.yourPlayerNum, 1, undefined)[0];
      return(
        <div id="game">
          <div id="cards">
            <TeamPiles cards={this.state.teamPiles}
                       deckLength={this.state.deckLength}
                       lives={this.state.lives}
                       clues={this.state.clues}
                       score={this.state.score}/>
            <Discards  cards={this.state.discards}/>
            <Players   hands={this.state.hands}
                       names={this.state.names}
                       whoseTurn={this.state.whoseTurn}
                       yourPlayerNum={this.state.yourPlayerNum}
                       yourCards={this.state.yourCards}
                       whoseTurn={this.state.whoseTurn}/>
          </div>
          <Chat socket={app.socket}
                ref="chat"
                playerCount={this.state.hands.length}/>
        </div>
      )
    }
  });
})();
