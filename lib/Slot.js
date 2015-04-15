var Model = require('./Model');
var Layer = require('./Layer');
var Collection = require('./Collection');
var Sample = require('./Sample');
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

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);
    this.__layer = this.layer;
    this.layer = this._layer;
  },

  _layer: function (src, params) {
    if (typeof src === 'string') {
      params = params || {};
      params.src = src;
      var sample = new Sample(params);
      this.layers.add(sample);
      return sample;
    }
    return this.__layer.apply(this, arguments);
  },

  start: function (time, note, channel) {
    if (!this.mute) {
      this.layers.each(function (layer) {
        layer.start(time, note, channel);
      }.bind(this));
    }
  },

  stop: function (time, note, channel) {
    this.layers.each(function (layer) {
      layer.stop(time, note, channel);
    }.bind(this));
  }

}, overloadedAccessor('layer', Layer));

module.exports = Slot;
