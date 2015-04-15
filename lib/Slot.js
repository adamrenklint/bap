var Model = require('./Model');
var Layer = require('./Layer');
var Collection = require('./Collection');
var overloadedAccessor = require('./mixins/overloadedAccessor');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');

var Slot = Model.extend(triggerParams, volumeParams, {

  type: 'slot',

  collections: {
    layers: Collection.extend({
      model: Layer
    })
  },

  start: function (time, note, channel) {
    if (!this.mute) {
      this.layers.each(function (layer) {
        layer.start(event, time, note, channel);
      }.bind(this));
    }
  },

  stop: function (time, note, channel) {
    this.layers.each(function (layer) {
      layer.stop(event, time, note, channel);
    }.bind(this));
  }

}, overloadedAccessor('layer', Layer));

module.exports = Slot;
