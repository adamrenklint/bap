var Model = require('./Model');
var Layer = require('./Layer');
var Collection = require('./Collection');
var OverloadedAccessor = require('./mixins/OverloadedAccessor');

var Slot = Model.extend({

  type: 'slot',

  collections: {
    layers: Collection.extend({
      model: Layer
    })
  },

  runEvent: function (event, time, note, channel) {
    if (typeof time === 'number' && !note) {
      note = {};
    }
    else if (!note) {
      note = time;
      time = this.context.currentTime;
    }
    this.layers.each(function (layer) {
      layer[event](time, note, channel);
    });
  },

  start: function (time, note, channel) {
    this.runEvent('start', time, note, channel);
  },

  stop: function (time, note, channel) {
    this.runEvent('stop', time, note, channel);
  }

}, OverloadedAccessor('layer', Layer));

module.exports = Slot;




// // layer (src) > create and return new layer with sample with src
// // layer (sample) > create and return new layer with sample with src
//
// // layers() > array of layers
//
// // remove(layer)
// // clear(index)
// // clearAll > remove all layers on slot
//
// var Base = require('./Base');
// var inherits = require('util').inherits;
//
// function Slot (options) {
//
//   options = options || {};
//   Base.call(this, options);
// }
//
// inherits(Slot, Base);
//
// module.exports = Slot;
