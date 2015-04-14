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

    var source = this[event](time, params);
    if (source && params.length) {
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

  source: function (params) {},

  output: function () {
    return this.context.destination;
  },

  configureAttack: function (time, params, gain) {
    var volume = (params.volume || 100) / 100;
    gain.connect(this.output());
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + params.attack);
    return gain;
  },

  configureRelease: function (time, params, gain) {
    var volume = (params.volume || 100) / 100;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.linearRampToValueAtTime(0, time + params.release);
  },

  start: function (time, params) {
    if (this.mute) { return; }
    
    time = time || this.context.currentTime;
    var source = this.source(params);

    if (source) {
      var gain = source.gain = this.context.createGain();
      this.configureAttack(time, params, gain);
      source.connect(gain);
      source.start(time);
      return source;
    }
  },

  stop: function (time, params, source) {
    time = time || this.context.currentTime;
    this.configureRelease(time, params, source.gain);
    source.stop(time + params.release);
  }
});

module.exports = Layer;
