var Model = require('./Model');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var Params = require('./Params');

var Layer = Model.extend(triggerParams, volumeParams, {

  type: 'layer',

  runEvent: function (event, time, note, channel, slot, kit) {
    var params = Params.fromSources(note, channel, this, slot, kit);
    // if (!note.duration && params.duration) {
    if (!params.length && params.duration) {
      // this.vent.trigger('transform:durationToLength', params);
      params.length = this.lengthFromDuration(params.duration);
    }

    var source = this[event](time, params, this.context.destination);
    if (params.length) {
      setTimeout(function () {
        var stopTime = time + params.length;
        this.stop(stopTime, params, source);
      }.bind(this));
    }
  },

  lengthFromDuration: function (duration) {
    // TODO: shouldn't be hardcoded :)
    var bpm = 120;
    var secondsPerBeat = 60 / bpm;
    var secondsPerTick = secondsPerBeat / 96;
    return duration * secondsPerTick;
  },

  start: function (time, params) {
    console.warn('start should be implemented by Layer subclass: ' + this.type);
  },

  stop: function (time, params) {
    console.warn('stop should be implemented by Layer subclass: ' + this.type);
  }
});

module.exports = Layer;
