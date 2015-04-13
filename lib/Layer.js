var Model = require('./Model');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var Params = require('./Params');

var Layer = Model.extend(triggerParams, volumeParams, {

  type: 'layer',

  runEvent: function (event, time, note, channel, slot, kit) {
    var params = Params.fromSources(note, channel, this, slot, kit);
    // TODO: if length (or duration), but no note.duration, need to schedule the stop event ourselves
    this[event](time, params);
  },

  start: function (time, params) {
    console.warn('start should be implemented by Layer subclass: ' + this.type);
  },

  stop: function (time, params) {
    console.warn('stop should be implemented by Layer subclass: ' + this.type);
  }
});

module.exports = Layer;
