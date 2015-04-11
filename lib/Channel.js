var Base = require('./Base');
var inherits = require('util').inherits;

function Channel (params) {

  Base.call(this, params);

  //this.params
}

inherits(Channel, Base);
var proto = Channel.prototype;

proto.add = function () {
  var notes = [].slice.call(arguments);
  console.log(notes);
};

module.exports = Channel;
