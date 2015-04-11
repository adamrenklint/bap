var events = require('events');
var inherits = require('util').inherits;
var audioContext = require('audio-context');

function Base (params) {

  this.params = params || {};
  events.EventEmitter.call(this, params);

  this.context = audioContext;
}

inherits(Base, events.EventEmitter);

module.exports = Base;
