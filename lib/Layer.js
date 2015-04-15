var Model = require('./Model');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var Params = require('./Params');

var Layer = Model.extend(triggerParams, volumeParams, {

  type: 'layer',

  lengthFromDuration: function (duration) {
    // TODO: shouldn't be hardcoded :)
    var bpm = 120;
    var secondsPerBeat = 60 / bpm;
    var secondsPerTick = secondsPerBeat / 96;
    return duration * secondsPerTick;
  },

  params: function (note, channel) {
    var slot = this.collection && this.collection.parent || {};
    var kit = slot && slot.collection && slot.collection.parent || {};
    var sources = [note, channel, this, slot, kit];
    return Params.fromSources.apply(null, sources);
  },

  start: function (time, note, channel) {
    if (this.mute) { return; }

    if (typeof time !== 'number') {
      channel = note;
      note = time;
      time = this.context.currentTime;
    }
    var params = this.params(note, channel);

    // TODO: move this into params?
    if (!params.length && params.duration) {
      // this.vent.trigger('transform:durationToLength', params);
      params.length = this.lengthFromDuration(params.duration);
    }

    var source = this.source(params);

    if (source) {
      var gain = source.gain = this.context.createGain();
      this.configureAttack(time, params, gain);
      source.connect(gain);
      source.start(time);

      if (params.length) {
        var stopTime = time + params.length;
        this.stop(stopTime, params, source);
      }
    }
  },

  stop: function (time, params, source) {
    if (typeof time !== 'number') {
      params = time;
      time = this.context.currentTime;
    }
    params = params || {};

    if (source) {
      if (source.gain) {
        this.configureRelease(time, params, source.gain);
      }
      source.stop(time + params.release);
    }
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
  }
});

module.exports = Layer;
