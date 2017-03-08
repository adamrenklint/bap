const Model = require('./Model');
const Layer = require('./Layer');
const Collection = require('./Collection');
const overloadedAccessor = require('./mixins/overloadedAccessor');
const triggerParams = require('./mixins/triggerParams');
const volumeParams = require('./mixins/volumeParams');
const connectable = require('./mixins/connectable');
const bypassable = require('./mixins/bypassable');
const sampleShortcut = require('./mixins/sampleShortcut');

const Slot = Model.extend(triggerParams, volumeParams, bypassable, {

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
      this.layers.each(layer => {
        layer.start(time, note, channel, pattern, kit, this);
      });
    }
  },

  stop: function (time, note, channel, pattern, kit) {
    this.layers.each(layer => {
      layer.stop(time, note, channel, pattern, kit, this);
    });
  }

}, overloadedAccessor('layer', Layer), sampleShortcut, connectable);

module.exports = Slot;
