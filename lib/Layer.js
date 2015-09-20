var Model = require('./Model');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var connectable = require('./mixins/connectable');
var Params = require('./Params');

var context = null;

function createPool (factoryName) {
  var nodes = [];
  return function pool(node) {
    if (node) {
      nodes.push(node);
    }
    else if (nodes.length) {
      return nodes.shift();
    }
    else {
      return context[factoryName]();
    }
  };
}

var gainPool = createPool('createGain');
var pannerPool = createPool('createPanner');

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

    context = context || this.context;

    var params = this._params(note, channel);
    var source = this._source(params);

    if (source) {
      var connections = this._getConnections(note, channel);
      var destination = this._connectDestination(connections);
      var gain = source._gain = gainPool();
      this._configureAttack(time, params, gain, destination);
      var panner = this._configurePan(params, gain);
      source.connect(panner || gain);

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

        gain.disconnect();
        source.disconnect();

        if (panner) {
          panner.disconnect();
          pannerPool(panner);
        }

        gainPool(gain);

        source = source.onended = source._gain = gain = panner = null;
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

  _paramsSources: function (note, channel) {
    var slot = this.collection && this.collection.parent || {};
    var kit = slot && slot.kit || {};
    return [note, channel, this, slot, kit];
  },

  _params: function (note, channel) {
    var sources = this._paramsSources(note, channel);
    return Params.fromSources(sources);
  },

  _getConnections: function (note, channel) {
    var sources = this._paramsSources(note, channel);
    var connections = [];
    sources.forEach(function (source) {
      if (source && source.connections) {
        connections = connections.concat(source.connections);
      }
    });
    return connections;
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

  _connectDestination: function (connections) {
    var destination = this.context.destination;

    // connecting the graph backwards, to start with hooking up to destination
    // and finishing with whatever node will be returned as layer destination
    connections.reverse().forEach(function (connection, index, list) {
      var next = list[index - 1];
      var node = connection.getNode(next && next.cid);
      node.connect(destination);
      destination = node;
    });
    return destination;
  },

  _configurePan: function (params, out) {
    if (params.pan !== 0) {
      var panner = pannerPool();
      var x = params.pan / 100;
      var z = 1 - Math.abs(x);
      panner.setPosition(x, 0, z);
      panner.connect(out);
      return panner;
    }
  },

  _configureAttack: function (time, params, gain, destination) {
    var volume = (params.volume || 100) / 100;
    gain.connect(destination);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + params.attack);
  },

  _configureRelease: function (time, params, gain) {
    var volume = (params.volume || 100) / 100;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.linearRampToValueAtTime(0, time + params.release);
  }
}, connectable);

module.exports = Layer;
