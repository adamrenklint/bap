var Model = require('./Model');
var Layer = require('./Layer');
var Collection = require('./Collection');
var overloadedAccessor = require('./mixins/overloadedAccessor');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var connectable = require('./mixins/connectable');
var sampleShortcut = require('./mixins/sampleShortcut');

var Slot = Model.extend(triggerParams, volumeParams, {

  type: 'slot',

  collections: {
    layers: Collection.extend({
      model: Layer
    })
  },

  initialize: function () {
    Model.prototype.initialize.apply(this, arguments);
    this._initSampleShortcut();
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

}, overloadedAccessor('layer', Layer), sampleShortcut, connectable);

module.exports = Slot;
