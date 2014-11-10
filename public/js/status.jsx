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

  app.Status = React.createClass({
    render: function() {
      if(this.props.connected) {
        return <div>There are currently {this.props.players} players connected.</div>
      } else {
        return <div>Server is down. I repeat: The server is down! Panic is advisable!</div>
      }
    }
  });
})();
