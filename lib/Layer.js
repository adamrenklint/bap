const Model = require('./Model');
const triggerParams = require('./mixins/triggerParams');
const volumeParams = require('./mixins/volumeParams');
const connectable = require('./mixins/connectable');
const bypassable = require('./mixins/bypassable');
const Params = require('./Params');

let context = null;

function createPool (factoryName) {
  const nodes = [];
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

const gainPool = createPool('createGain');
const pannerPool = createPool('createPanner');

let destination = null;

const Layer = Model.extend(triggerParams, volumeParams, {

  type: 'layer',

  props: {
    sources: ['object', true, () => ({})]
  },

  start: function (time, note, channel, pattern, kit, slot) {
    if (this.mute) { return; }

    if (typeof time !== 'number') {
      pattern = channel;
      channel = note;
      note = time;
      time = this.context.currentTime;
    }
    note = note || {};

    context = context || this.context;

    const params = this._params(note, channel, pattern, kit, slot);
    let source = this._source(params);

    if (source) {
      const connections = this._getConnections(note, channel, pattern);
      const destination = this._connectDestination(connections, params);
      let gain = source._gain = gainPool();
      this._configureAttack(time, params, gain, destination);
      let panner = this._configurePan(params, gain);
      source.connect(panner || gain);

      this._startSource(time, params, source);

      this._triggerPlaybackStateEvent('started', time, params, note, channel, pattern, kit, slot);

      const cid = note.cid || 'null';
      this.sources[cid] = this.sources[cid] || [];
      this.sources[cid].push(source);

      if (params.length) {
        const stopTime = this._getStopTime(time, params, source);
        this.stop(stopTime, note, channel, pattern);
      }

      source.onended = () => {
        const index = this.sources[cid].indexOf(source);
        this.sources[cid].splice(index, 1);

        gain.disconnect();
        source.disconnect();
        if (panner) {
          panner.disconnect();
          pannerPool(panner);
        }
        gainPool(gain);

        this._triggerPlaybackStateEvent('stopped', this.context.currentTime, params, note, channel, pattern, kit, slot);

        source = source.onended = source._gain = gain = panner = null;

        if (typeof note.after === 'function') note.after();
      };
    }
  },

  _getStopTime: function(time, {length}, source) {
    return time + length;
  },

  _triggerPlaybackStateEvent: function(event, time, params, note, channel, pattern, kit, slot) {
    const self = this;
    let lookahead = Math.floor((time - context.currentTime) * 1000) - 1;
    if (lookahead < 0) lookahead = 0;
    setTimeout(() => {
      [note, channel, pattern, kit, slot, self].forEach(target => {
        target && target.trigger(event, note, params);
      });
    }, lookahead);
  },

  stop: function (time, note, channel, pattern, kit, slot) {
    if (typeof time !== 'number') {
      pattern = channel;
      channel = note;
      note = time;
      time = this.context.currentTime;
    }
    note = note || {};

    const params = this._params(note, channel, pattern, kit, slot);
    const cid = note.cid || 'null';
    let sources = this.sources[cid] || [];

    if (cid === 'null') {
      sources = [];
      Object.keys(this.sources).forEach(cid => {
        sources = sources.concat(this.sources[cid]);
      });
    }

    sources.forEach(source => {
      if (source._gain) {
        this._configureRelease(time, params, source._gain);
      }
      this._stopSource(time, params, source);
    });
  },

  _paramsSources: function (note, channel, pattern, kit, slot) {
    slot = slot || this.collection && this.collection.parent || {};
    kit = kit || slot && slot.kit || {};
    const patternParams = {
      volume: pattern && pattern.volume,
      pitch: pattern && pattern.pitch,
      pan: pattern && pattern.pan
    };
    return [note, channel, patternParams, this, slot, kit];
  },

  _params: function (note, channel, pattern, kit, slot) {
    const sources = this._paramsSources(note, channel, pattern, kit, slot);
    return Params.fromSources(sources);
  },

  _getConnections: function (note, channel, pattern) {
    const sources = this._paramsSources(note, channel, pattern);
    let connections = [];
    sources.forEach(source => {
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
    throw new Error(`Required method "_source" is not implemented for ${this.cid}`);
  },

  _getLocalDestination: function () {

    if (!destination) {
      destination = gainPool();
      destination.connect(this.context.destination);
    }
    destination.gain.value = (this.vent.bap.volume / 100) * 0.8;
    return destination;
  },

  _connectDestination: function(connections, {bypass}) {

    let localDestination = this._getLocalDestination();
    if (bypass === true) return localDestination;
    const cid = this.cid;

    connections.filter(({type, bypass}) => {
      if (bypass === type || Array.isArray(bypass) && ~bypass.indexOf(type)) return false;
      return !bypass;
    }).reverse().forEach((connection, index, list) => {
      const next = list[index - 1];
      const node = connection.getNode(next && next.cid || 'destination');
      if (node.__connectedTo && node.__connectedTo !== localDestination) {
        console.error(`Attempted to reconnect already connected effect (${connection.cid}) for target ${cid}`);
      }
      else if (!node._connectedTo) {
        node.connect(localDestination);
        node._connectedTo = localDestination;
      }
      localDestination = node;
    });

    return localDestination;
  },

  _configurePan: function({pan}, out) {
    if (pan !== 0) {
      const panner = pannerPool();
      const x = pan / 100;
      const z = 1 - Math.abs(x);
      panner.setPosition(x, 0, z);
      panner.connect(out);
      return panner;
    }
  },

  _configureAttack: function (time, params, gain, destination) {
    const volume = (params.volume !== null && params.volume !== undefined ? params.volume : 100) / 100;
    gain.connect(destination);
    gain.gain.value = 0;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + params.attack);
  },

  _configureRelease: function (time, params, gain) {
    const volume = (params.volume !== null && params.volume !== undefined ? params.volume : 100) / 100;
    if (params.release) {
      gain.gain.cancelScheduledValues(time - 0.001);
      gain.gain.linearRampToValueAtTime(volume, time - params.release);
      gain.gain.linearRampToValueAtTime(0, time);
    }
  }
}, connectable);

module.exports = Layer;
