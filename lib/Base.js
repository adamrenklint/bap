var events = require('events');
var inherits = require('util').inherits;

function Base (options) {

  options = options || {};
  events.EventEmitter.call(this, options);
}

inherits(Base, events.EventEmitter);


//Base.prototype.xxx = fn...

module.exports = Base;
