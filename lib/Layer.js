var Model = require('./Model');
var triggerParams = require('./mixins/triggerParams');
var volumeParams = require('./mixins/volumeParams');
var connectable = require('./mixins/connectable');
var bypassable = require('./mixins/bypassable');
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

var destination = null;

var Layer = Model.extend(triggerParams, volumeParams, {

  type: 'layer',

  props: {
    sources: ['object', true, function () { return {}; }]
  },

  start: function (time, note, channel, pattern) {
    if (this.mute) { return; }

    if (typeof time !== 'number') {
      pattern = channel;
      channel = note;
      note = time;
      time = this.context.currentTime;
    }
    note = note || {};

    context = context || this.context;

    var params = this._params(note, channel, pattern);
    var source = this._source(params);

    if (source) {
      var connections = this._getConnections(note, channel, pattern);
      var destination = this._connectDestination(connections, params);
      var gain = source._gain = gainPool();
      this._configureAttack(time, params, gain, destination);
      var panner = this._configurePan(params, gain);
      source.connect(panner || gain);

      this._startSource(time, params, source);

      var cid = note.cid || 'null';
      this.sources[cid] = this.sources[cid] || [];
      this.sources[cid].push(source);

      if (params.length) {
        var stopTime = this._getStopTime(time, params, source);
        this.stop(stopTime, note, channel, pattern);
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

        if (typeof note.after === 'function') note.after();
      }.bind(this);
    }
  },

  _getStopTime: function (time, params, source) {
    return time + params.length;
  },

  stop: function (time, note, channel, pattern) {
    if (typeof time !== 'number') {
      pattern = channel;
      channel = note;
      note = time;
      time = this.context.currentTime;
    }
    note = note || {};

    var params = this._params(note, channel, pattern);
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
        this._configureRelease(time, params, source._gain);
      }
      this._stopSource(time, params, source);
    }.bind(this));
  },

  _paramsSources: function (note, channel, pattern) {
    var slot = this.collection && this.collection.parent || {};
    var kit = slot && slot.kit || {};
    var patternParams = { volume: pattern && pattern.volume };
    return [note, channel, patternParams, this, slot, kit];
  },

  _params: function (note, channel, pattern) {
    var sources = this._paramsSources(note, channel, pattern);
    return Params.fromSources(sources);
  },

  _getConnections: function (note, channel, pattern) {
    var sources = this._paramsSources(note, channel, pattern);
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

  _source: function (params) {
    throw new Error('Required method "_source" is not implemented for ' + this.cid);
  },

  _getLocalDestination: function () {

    if (!destination) {
      destination = gainPool();
      destination.connect(this.context.destination);
    }
    destination.gain.value = (this.vent.bap.volume / 100) * 0.8;
    return destination;
  },

  _connectDestination: function (connections, params) {

    var localDestination = this._getLocalDestination();
    if (params.bypass === true) return localDestination;
    var cid = this.cid;

    connections.filter(function (connection) {
      if (params.bypass === connection.type || Array.isArray(params.bypass) && ~params.bypass.indexOf(connection.type)) return false;
      return !connection.bypass;
    }).reverse().forEach(function (connection, index, list) {
      var next = list[index - 1];
      var node = connection.getNode(next && next.cid || 'destination');
      if (node.__connectedTo && node.__connectedTo !== localDestination) {
        console.error('Attempted to reconnect already connected effect (' + connection.cid + ') for target ' + cid);
      }
      else if (!node._connectedTo) {
        node.connect(localDestination);
        node._connectedTo = localDestination;
      }
      localDestination = node;
    });

    return localDestination;
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
    gain.gain.value = 0;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + params.attack);
  },

  _configureRelease: function (time, params, gain) {
    var volume = (params.volume || 100) / 100;
    if (params.release) {
      gain.gain.cancelScheduledValues(time - 0.001);
      gain.gain.linearRampToValueAtTime(volume, time - params.release);
      gain.gain.linearRampToValueAtTime(0, time);
    }
  }
}, connectable);

module.exports = Layer;
