var Model = require('./Model');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var oscillatorParams = require('./mixins/oscillatorParams');
var Params = require('./Params');

var Layer = Model.extend(triggerParams, volumeParams, oscillatorParams, {

  type: 'layer',

  runEvent: function (event, time, note, channel, slot, kit) {
    this[event](time, Params.fromSources(note, channel, this, slot, kit));
  },

  start: function (time, params) {
    console.warn('start should be implemented by Layer subclass: ' + this.type);
  },

  stop: function (time, params) {
    console.warn('stop should be implemented by Layer subclass: ' + this.type);
  }
});

module.exports = Layer;
