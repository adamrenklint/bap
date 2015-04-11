var Base = require('./Base');
var inherits = require('util').inherits;
var Channel = require('./Channel');
var IndexedParent = require('./mixins/IndexedParent');
var assert = require('./utils/assert');

function Pattern (params) {

  Base.call(this, params);
  IndexedParent.call(this);
}

inherits(Pattern, Base);
var proto = Pattern.prototype;

proto.channel = function (index, existing) {
  // assert.number(index, 'index');
  // var channel = existing || new Channel();
  // this._children[index] = channel;
  // return channel;
  // return existing ? this : channel;
};

// proto.clear = function (index) {
//   if (typeof index === 'number') {
//     this._children[index] = null;
//   }
//   else if (index) {
//     index = this._children.indexOf(index);
//     if (~index) return this.clear(index);
//   }
//   return this;
// }

module.exports = Pattern;
