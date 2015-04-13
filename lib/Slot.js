var Model = require('./Model');
var Layer = require('./Layer');
var Collection = require('./Collection');
var overloadedAccessor = require('./mixins/overloadedAccessor');

var Slot = Model.extend({

  type: 'slot',

  collections: {
    layers: Collection.extend({
      model: Layer
    })
  },

  runEvent: function (event, time, note, channel, kit) {
    this.layers.each(function (layer) {
      layer.runEvent(event, time, note, channel, this, kit);
    }.bind(this));
  },

  start: function (time, note) {
    this.runEvent('start', time, note);
  },

  stop: function (time, note) {
    this.runEvent('stop', time, note);
  }

}, overloadedAccessor('layer', Layer));

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
