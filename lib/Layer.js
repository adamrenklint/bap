var Model = require('./Model');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var Params = require('./Params');

var Layer = Model.extend(triggerParams, volumeParams, {

  type: 'layer',

  props: {
    sources: ['object', true, function () { return {}; }]
  },

  start: function (time, note, channel) {
    if (this.mute) { return; }

    if (typeof time !== 'number') {
      channel = note;
      note = time;
      time = this.context.currentTime;
    }
    note = note || {};

    var params = this._params(note, channel);
    var source = this._source(params);

    if (source) {
      var out = source._gain = this._createGain(params, source);
      out = this._configureAttack(time, params, out);
      out = this._configurePan(params, out);
      source.connect(out);
      this._startSource(time, params, source);

      var cid = note.cid || 'null';
      this.sources[cid] = this.sources[cid] || [];
      this.sources[cid].push(source);

      if (params.length) {
        var stopTime = time + params.length;
        this.stop(stopTime, note, channel);
      }

      source.onended = function () {
        var index = this.sources[cid].indexOf(source);
        this.sources[cid].splice(index, 1);
        source.disconnect();
        source = source.onended = null;
        if (typeof note.after === 'function') {
          note.after();
        }
      }.bind(this);
    }
  },

  stop: function (time, note, channel) {
    if (typeof time !== 'number') {
      channel = note;
      note = time;
      time = this.context.currentTime;
    }
    note = note || {};

    var params = this._params(note, channel);
    var cid = note.cid || 'null';
    var sources = this.sources[cid] || [];

    if (cid === 'null') {
      sources = [];
      Object.keys(this.sources).forEach(function (cid) {
        sources = sources.concat(this.sources[cid]);
      }.bind(this));
    }

    sources.forEach(function (source) {
      if (source._gain) {
        this._configureRelease(time - params.release, params, source._gain);
      }
      this._stopSource(time, params, source);
    }.bind(this));
  },

  _params: function (note, channel) {
    var slot = this.collection && this.collection.parent || {};
    var kit = slot && slot.collection && slot.collection.parent || {};
    var sources = [note, channel, this, slot, kit];
    return Params.fromSources.apply(null, sources);
  },

  _createGain: function (params, source) {
    return this.context.createGain();
  },

  _startSource: function (time, params, source) {
    source.start(time);
  },

  _stopSource: function (time, params, source) {
    source.stop(time);
  },

  _source: function (params) {},

  _output: function () {
    return this.context.destination;
  },

  _configurePan: function (params, out) {
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

  _configureAttack: function (time, params, gain) {
    var volume = (params.volume || 100) / 100;
    gain.connect(this._output());
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + params.attack);
    return gain;
  },

  _configureRelease: function (time, params, gain) {
    var volume = (params.volume || 100) / 100;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.linearRampToValueAtTime(0, time + params.release);
    return gain;
  }
});

module.exports = Layer;
