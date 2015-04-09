var events = require('events');
var inherits = require('util').inherits;
var audioContext = require('audio-context');

function Base (options) {

  options = options || {};
  events.EventEmitter.call(this, options);

  this.context = audioContext;
}

inherits(Base, events.EventEmitter);


//Base.prototype.xxx = fn...

module.exports = Base;
