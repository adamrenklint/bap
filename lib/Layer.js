var Model = require('./Model');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var Params = require('./Params');

var Layer = Model.extend(triggerParams, volumeParams, {

  type: 'layer',

  props: {
    sources: ['object', true, function () { return {}; }]
  },

  params: function (note, channel) {
    var slot = this.collection && this.collection.parent || {};
    var kit = slot && slot.collection && slot.collection.parent || {};
    var sources = [note, channel, this, slot, kit];
    return Params.fromSources.apply(null, sources);
  },

  createGain: function (params, source) {
    return this.context.createGain();
  },

  start: function (time, note, channel) {
    if (this.mute) { return; }

    if (typeof time !== 'number') {
      channel = note;
      note = time;
      time = this.context.currentTime;
    }
    note = note || {};

    var params = this.params(note, channel);
    var source = this.source(params);

    if (source) {
      var out = source.gain = this.createGain(params, source);
      out = this.configureAttack(time, params, out);
      out = this.configurePan(params, out);
      source.connect(out);
      this.startSource(time, params, source);

      var cid = note.cid || 'null';
      this.sources[cid] = this.sources[cid] || [];
      this.sources[cid].push(source);

      if (params.length) {
        var stopTime = time + params.length;
        this.stop(stopTime, note, channel);
        source.onended = source.disconnect.bind(source);
      }
    }
  },

  startSource: function (time, params, source) {
    source.start(time);
  },

  stopSource: function (time, params, source) {
    source.stop(time);
  },

  stop: function (time, note, channel) {
    if (typeof time !== 'number') {
      channel = note;
      note = time;
      time = this.context.currentTime;
    }
    note = note || {};

    var params = this.params(note, channel);
    var cid = note.cid || 'null';
    var sources = this.sources[cid] || [];

    sources.forEach(function (source) {
      if (source.gain) {
        this.configureRelease(time, params, source.gain);
      }
      this.stopSource(time, params, source);
      source.stop(time + params.release);
    }.bind(this));
  },

  source: function (params) {},

  output: function () {
    return this.context.destination;
  },

  configurePan: function (params, out) {
    if (params.pan !== 0) {
      var panner = this.context.createPanner();
      var x = params.pan / 100;
      var z = 1 - Math.abs(x);
      panner.setPosition(x, 0, z);
      panner.connect(out);
      return panner;
    }
    return out;
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
    return gain;
  }
});

module.exports = Layer;
