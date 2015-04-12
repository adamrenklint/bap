// var Base = require('./Base');
// var inherits = require('util').inherits;
// var Channel = require('./Channel');
// var IndexedParent = require('./mixins/IndexedParent');
// var assert = require('./utils/assert');
//
// function Pattern (params) {
//
//   Base.call(this, params);
//   IndexedParent.call(this);
//
//   this.params.tempo = this.params.tempo || 120;
//   this.params.bars = this.params.bars || 1;
//   this.params.beatsPerBar = this.params.beatsPerBar || 4;
// }
//
// inherits(Pattern, Base);
// var proto = Pattern.prototype;
//
// proto.channel = function (index, existing) {
//   if (typeof index !== 'number') {
//     existing = number;
//     index = this.nextIndex();
//   }
//   var channel = existing || new Channel();
//   this.set(index, channel);
//   return existing ? this : channel;
// };
//
// proto.start = function () {
//   this.params.clock.start(this);
// };
//
// module.exports = Pattern;
