var Model = require('./Model');
var Layer = require('./Layer');
var Collection = require('./Collection');
var overloadedAccessor = require('./mixins/overloadedAccessor');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var connectable = require('./mixins/connectable');
var bypassable = require('./mixins/bypassable');
var sampleShortcut = require('./mixins/sampleShortcut');

var Slot = Model.extend(triggerParams, volumeParams, bypassable, {

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

  start: function (time, note, channel, pattern, kit) {
    if (!this.mute) {
      this.layers.each(function (layer) {
        layer.start(time, note, channel, pattern, kit, this);
      }.bind(this));
    }
  },

  stop: function (time, note, channel, pattern, kit) {
    this.layers.each(function (layer) {
      layer.stop(time, note, channel, pattern, kit, this);
    }.bind(this));
  }

}, overloadedAccessor('layer', Layer), sampleShortcut, connectable);

module.exports = Slot;
